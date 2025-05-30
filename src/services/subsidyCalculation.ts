import { eq, and, gte, isNull, or } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';

import { db } from '@/src/db';
import {
  users,
  employers,
  sponsoredGroups,
  sponsoredGroupMembers,
  employerSubsidies,
  bookingSessions,
  sessionPayments,
} from '@/src/db/schema';

// Type for transaction context
type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface SubsidyCalculationResult {
  totalAmountCents: number;
  subsidyFromGroupCents: number;
  subsidyFromEmployerDirectCents: number;
  subsidyFromEmployerPercentageCents: number;
  totalSubsidyUsedCents: number;
  outOfPocketCents: number;
  sponsoringGroupId?: number;
  groupUpdates: Array<{ groupId: number; newRemainingCredits: number }>;
  employerSubsidyUpdates: Array<{ subsidyId: number; newRemainingCents: number }>;
  fullySubsidized: boolean;
}

export interface SubsidyApplicationData {
  userId: number;
  totalSessionCostCents: number;
  bookingSessionId: number;
}

/**
 * Calculates and applies subsidies for a session booking in the correct priority order:
 * 1. Sponsored group credits (if user is member of active group)
 * 2. Direct employer subsidies (employerSubsidies table)
 * 3. Employer default percentage (employers.defaultSubsidyPercentage)
 */
export async function calculateSessionSubsidies(
  data: SubsidyApplicationData,
  txOrDb?: DatabaseTransaction,
): Promise<SubsidyCalculationResult> {
  const dbContext = txOrDb || db;

  const { userId, totalSessionCostCents, bookingSessionId } = data;

  let remainingCostToSubsidize = totalSessionCostCents;
  let subsidyFromGroupCents = 0;
  let subsidyFromEmployerDirectCents = 0;
  let subsidyFromEmployerPercentageCents = 0;
  let sponsoringGroupId: number | undefined;

  const groupUpdates: Array<{ groupId: number; newRemainingCredits: number }> = [];
  const employerSubsidyUpdates: Array<{ subsidyId: number; newRemainingCents: number }> = [];

  // Get user with employer information
  const userWithEmployer = await dbContext
    .select({
      id: users.id,
      employerId: users.employerId,
      role: users.role,
      employer: {
        id: employers.id,
        defaultSubsidyPercentage: employers.defaultSubsidyPercentage,
        allowsSponsoredGroups: employers.allowsSponsoredGroups,
      },
    })
    .from(users)
    .leftJoin(employers, eq(users.employerId, employers.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (userWithEmployer.length === 0) {
    // User not found or no employer - no subsidies available
    return {
      totalAmountCents: totalSessionCostCents,
      subsidyFromGroupCents: 0,
      subsidyFromEmployerDirectCents: 0,
      subsidyFromEmployerPercentageCents: 0,
      totalSubsidyUsedCents: 0,
      outOfPocketCents: totalSessionCostCents,
      groupUpdates: [],
      employerSubsidyUpdates: [],
      fullySubsidized: false,
    };
  }

  const user = userWithEmployer[0];

  // Only employees can get subsidies
  if (user.role !== 'employee' || !user.employerId) {
    return {
      totalAmountCents: totalSessionCostCents,
      subsidyFromGroupCents: 0,
      subsidyFromEmployerDirectCents: 0,
      subsidyFromEmployerPercentageCents: 0,
      totalSubsidyUsedCents: 0,
      outOfPocketCents: totalSessionCostCents,
      groupUpdates: [],
      employerSubsidyUpdates: [],
      fullySubsidized: false,
    };
  }

  // TIER 1: Check for sponsored group credits
  if (user.employer?.allowsSponsoredGroups && remainingCostToSubsidize > 0) {
    const groupMemberships = await dbContext
      .select({
        groupId: sponsoredGroupMembers.groupId,
        group: {
          id: sponsoredGroups.id,
          name: sponsoredGroups.name,
          remainingSessionCredits: sponsoredGroups.remainingSessionCredits,
          groupType: sponsoredGroups.groupType,
        },
      })
      .from(sponsoredGroupMembers)
      .innerJoin(sponsoredGroups, eq(sponsoredGroupMembers.groupId, sponsoredGroups.id))
      .where(
        and(
          eq(sponsoredGroupMembers.userId, userId),
          eq(sponsoredGroupMembers.isActive, true),
          eq(sponsoredGroups.isActive, true),
          eq(sponsoredGroups.employerId, user.employerId),
          gte(sponsoredGroups.remainingSessionCredits, 1),
        ),
      )
      .orderBy(sponsoredGroups.remainingSessionCredits); // Use groups with fewer credits first

    // Apply sponsored group credits (typically one session = one credit)
    for (const membership of groupMemberships) {
      if (remainingCostToSubsidize <= 0) break;

      const group = membership.group;
      const creditsToUse = Math.min(group.remainingSessionCredits, 1); // Usually 1 session per booking

      if (creditsToUse > 0) {
        // For simplicity, assume 1 credit = full session cost, but could be prorated
        const subsidyAmount = Math.min(remainingCostToSubsidize, totalSessionCostCents);

        subsidyFromGroupCents += subsidyAmount;
        remainingCostToSubsidize -= subsidyAmount;
        sponsoringGroupId = group.id;

        groupUpdates.push({
          groupId: group.id,
          newRemainingCredits: group.remainingSessionCredits - creditsToUse,
        });

        console.log(
          `Applied sponsored group subsidy: $${subsidyAmount / 100} from group ${group.name}`,
        );
        break; // Typically only use one group per session
      }
    }
  }

  // TIER 2: Check for direct employer subsidies (employerSubsidies table)
  if (remainingCostToSubsidize > 0) {
    const availableSubsidies = await dbContext
      .select()
      .from(employerSubsidies)
      .where(
        and(
          eq(employerSubsidies.userId, userId),
          eq(employerSubsidies.employerId, user.employerId),
          gte(employerSubsidies.remainingCents, 1),
          or(isNull(employerSubsidies.expiresAt), gte(employerSubsidies.expiresAt, new Date())),
        ),
      )
      .orderBy(employerSubsidies.createdAt); // Use oldest subsidies first

    for (const subsidy of availableSubsidies) {
      if (remainingCostToSubsidize <= 0) break;

      const subsidyToUse = Math.min(subsidy.remainingCents, remainingCostToSubsidize);

      subsidyFromEmployerDirectCents += subsidyToUse;
      remainingCostToSubsidize -= subsidyToUse;

      employerSubsidyUpdates.push({
        subsidyId: subsidy.id,
        newRemainingCents: subsidy.remainingCents - subsidyToUse,
      });

      console.log(
        `Applied direct employer subsidy: $${subsidyToUse / 100} from subsidy ${subsidy.id}`,
      );
    }
  }

  // TIER 3: Apply employer default percentage subsidy
  if (remainingCostToSubsidize > 0 && user.employer?.defaultSubsidyPercentage > 0) {
    const percentageSubsidy = Math.round(
      (remainingCostToSubsidize * user.employer.defaultSubsidyPercentage) / 100,
    );

    subsidyFromEmployerPercentageCents = percentageSubsidy;
    remainingCostToSubsidize -= percentageSubsidy;

    console.log(
      `Applied employer percentage subsidy: $${percentageSubsidy / 100} (${user.employer.defaultSubsidyPercentage}%)`,
    );
  }

  const totalSubsidyUsedCents =
    subsidyFromGroupCents + subsidyFromEmployerDirectCents + subsidyFromEmployerPercentageCents;
  const outOfPocketCents = Math.max(0, totalSessionCostCents - totalSubsidyUsedCents);

  return {
    totalAmountCents: totalSessionCostCents,
    subsidyFromGroupCents,
    subsidyFromEmployerDirectCents,
    subsidyFromEmployerPercentageCents,
    totalSubsidyUsedCents,
    outOfPocketCents,
    sponsoringGroupId,
    groupUpdates,
    employerSubsidyUpdates,
    fullySubsidized: outOfPocketCents === 0,
  };
}

/**
 * Applies the calculated subsidies to the database within a transaction
 */
export async function applySubsidies(
  calculationResult: SubsidyCalculationResult,
  bookingSessionData: SubsidyApplicationData,
  txOrDb?: DatabaseTransaction,
): Promise<void> {
  const dbContext = txOrDb || db;

  const { bookingSessionId, userId } = bookingSessionData;
  const {
    subsidyFromGroupCents,
    subsidyFromEmployerDirectCents,
    sponsoringGroupId,
    groupUpdates,
    employerSubsidyUpdates,
  } = calculationResult;

  // Update sponsored group credits
  for (const update of groupUpdates) {
    await dbContext
      .update(sponsoredGroups)
      .set({
        remainingSessionCredits: update.newRemainingCredits,
        updatedAt: new Date(),
      })
      .where(eq(sponsoredGroups.id, update.groupId));
  }

  // Update employer subsidies
  for (const update of employerSubsidyUpdates) {
    if (update.newRemainingCents <= 0) {
      // Delete subsidy if fully used
      await dbContext.delete(employerSubsidies).where(eq(employerSubsidies.id, update.subsidyId));
    } else {
      // Update remaining amount
      await dbContext
        .update(employerSubsidies)
        .set({
          remainingCents: update.newRemainingCents,
          updatedAt: new Date(),
        })
        .where(eq(employerSubsidies.id, update.subsidyId));
    }
  }

  // Update booking session with subsidy information
  await dbContext
    .update(bookingSessions)
    .set({
      sponsoringGroupId,
      subsidyFromGroupCents,
      subsidyFromEmployerDirectCents,
      updatedAt: new Date(),
    })
    .where(eq(bookingSessions.id, bookingSessionId));

  console.log(`Applied subsidies to booking session ${bookingSessionId}:`, {
    subsidyFromGroupCents,
    subsidyFromEmployerDirectCents,
    sponsoringGroupId,
  });
}
