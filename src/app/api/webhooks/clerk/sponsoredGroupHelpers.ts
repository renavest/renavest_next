import { clerkClient } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { type PgTransaction } from 'drizzle-orm/pg-core';

import { EMPLOYER_EMAIL_MAP } from '@/src/constants';
import { users, employers, sponsoredGroups, sponsoredGroupMembers } from '@/src/db/schema';
import type { users as usersTable } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

// Proper Drizzle transaction type
type DatabaseTransaction = Parameters<Parameters<typeof import('@/src/db').db.transaction>[0]>[0];

/**
 * Associates a user with their employer and potentially a sponsored group
 */
export async function associateUserWithEmployerAndSponsoredGroup(
  tx: DatabaseTransaction,
  user: typeof usersTable.$inferSelect,
  email: string,
  sponsoredGroupName?: string,
): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const emailDomain = normalizedEmail.split('@')[1];

  // Skip if user is not an employee
  if (user.role !== 'employee') {
    return;
  }

  // Find employer name from email/domain mapping
  const employerName =
    EMPLOYER_EMAIL_MAP[normalizedEmail] || (emailDomain ? EMPLOYER_EMAIL_MAP[emailDomain] : null);

  if (!employerName) {
    console.log('No employer mapping found for user', { email: normalizedEmail });
    return;
  }

  try {
    // Find or create the employer
    let employer = (
      await tx.select().from(employers).where(eq(employers.name, employerName)).limit(1)
    )[0];

    if (!employer) {
      // Create employer if it doesn't exist
      const [newEmployer] = await tx
        .insert(employers)
        .values({
          name: employerName,
          industry: 'Technology', // Default - can be updated later
          allowsSponsoredGroups: true,
          defaultSubsidyPercentage: 50, // 50% default subsidy
          isActive: true,
          createdAt: createDate().toJSDate(),
          updatedAt: createDate().toJSDate(),
        })
        .returning();
      employer = newEmployer;
      console.log('Created new employer', { employerName, employerId: employer.id });
    }

    // Associate user with employer
    await tx
      .update(users)
      .set({
        employerId: employer.id,
        updatedAt: createDate().toJSDate(),
      })
      .where(eq(users.id, user.id));

    console.log('Associated user with employer', {
      userId: user.id,
      employerId: employer.id,
      employerName,
    });

    // If sponsored group name is provided, find or create the sponsored group and add user to it
    if (sponsoredGroupName) {
      await associateUserWithSponsoredGroup(tx, user.id, employer.id, sponsoredGroupName);
    }
  } catch (error) {
    console.error('Error associating user with employer and sponsored group', {
      userId: user.id,
      email: normalizedEmail,
      employerName,
      error,
    });
    // Don't throw - this shouldn't fail the entire webhook
  }
}

/**
 * Associates a user with a specific sponsored group
 */
export async function associateUserWithSponsoredGroup(
  tx: DatabaseTransaction,
  userId: number,
  employerId: number,
  sponsoredGroupName: string,
): Promise<void> {
  try {
    // Find or create the sponsored group
    let sponsoredGroup = (
      await tx
        .select()
        .from(sponsoredGroups)
        .where(
          and(
            eq(sponsoredGroups.employerId, employerId),
            eq(sponsoredGroups.name, sponsoredGroupName),
            eq(sponsoredGroups.groupType, 'erg'),
          ),
        )
        .limit(1)
    )[0];

    if (!sponsoredGroup) {
      // Create sponsored group if it doesn't exist
      const [newGroup] = await tx
        .insert(sponsoredGroups)
        .values({
          employerId,
          groupType: 'erg',
          name: sponsoredGroupName,
          description: `Sponsored group: ${sponsoredGroupName}`,
          allocatedSessionCredits: 10, // Default 10 sessions for new sponsored group
          remainingSessionCredits: 10,
          isActive: true,
          createdAt: createDate().toJSDate(),
          updatedAt: createDate().toJSDate(),
        })
        .returning();
      sponsoredGroup = newGroup;
      console.log('Created new sponsored group', {
        sponsoredGroupName,
        groupId: sponsoredGroup.id,
      });
    }

    // Check if user is already a member
    const existingMembership = (
      await tx
        .select()
        .from(sponsoredGroupMembers)
        .where(
          and(
            eq(sponsoredGroupMembers.userId, userId),
            eq(sponsoredGroupMembers.groupId, sponsoredGroup.id),
          ),
        )
        .limit(1)
    )[0];

    if (!existingMembership) {
      // Add user to sponsored group
      await tx.insert(sponsoredGroupMembers).values({
        groupId: sponsoredGroup.id,
        userId,
        roleInGroup: 'member',
        isActive: true,
        joinedAt: createDate().toJSDate(),
        createdAt: createDate().toJSDate(),
        updatedAt: createDate().toJSDate(),
      });

      console.log('Added user to sponsored group', {
        userId,
        groupId: sponsoredGroup.id,
        sponsoredGroupName,
      });
    } else {
      console.log('User already member of sponsored group', {
        userId,
        groupId: sponsoredGroup.id,
        sponsoredGroupName,
      });
    }
  } catch (error) {
    console.error('Error associating user with sponsored group', {
      userId,
      employerId,
      sponsoredGroupName,
      error,
    });
    // Don't throw - this shouldn't fail the entire webhook
  }
}

/**
 * Synchronize sponsored group information to Clerk's publicMetadata
 */
export async function synchronizeSponsoredGroupToClerk(
  clerkUserId: string,
  sponsoredGroupName: string,
): Promise<void> {
  try {
    const client = await clerkClient();
    // Get current metadata first to preserve existing data
    const user = await client.users.getUser(clerkUserId);
    const currentMetadata = user.publicMetadata || {};

    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        ...currentMetadata,
        sponsoredGroupName,
      },
    });
    console.log('Webhook: Successfully synchronized sponsored group to Clerk', {
      clerkUserId,
      sponsoredGroupName,
    });
  } catch (error) {
    console.error('Webhook: Failed to synchronize sponsored group to Clerk', {
      clerkUserId,
      sponsoredGroupName,
      error,
    });
    // Don't throw - this shouldn't fail the entire webhook
  }
}
