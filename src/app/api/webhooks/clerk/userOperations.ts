import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { Result, ok, err } from 'neverthrow';

import { EMPLOYER_EMAIL_MAP, ALLOWED_EMPLOYER_ADMIN_EMAILS } from '@/src/constants';
import { db } from '@/src/db';
import {
  users,
  userRoleEnum,
  therapists,
  pendingTherapists,
  userOnboarding,
} from '@/src/db/schema';
import type { users as usersTable } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';
import { MetadataManager } from '@/src/features/auth/utils/metadataManager';

import type { WebhookUserData, UserHandlingError } from './types';

// Proper Drizzle transaction type
type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Extracts the primary email from an array of email addresses.
 */
export function getPrimaryEmail(
  emailAddresses: WebhookUserData['email_addresses'],
  clerkUserId: string,
): Result<string, UserHandlingError> {
  const verifiedEmail = emailAddresses.find(
    (email) => email.verification?.status === 'verified',
  )?.email_address;

  const primaryEmail = verifiedEmail || emailAddresses[0]?.email_address;

  return primaryEmail ? ok(primaryEmail) : err({ type: 'NoValidEmail', userId: clerkUserId });
}

/**
 * Safely converts a timestamp string or number to a Date object.
 */
export function safelyParseDate(timestamp: string | number | null, fallbackDate: Date): Date {
  if (!timestamp) return fallbackDate;
  try {
    const dateArg = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return createDate(dateArg).toJSDate();
  } catch (error) {
    console.error('Webhook: Error converting date', { timestamp, error });
    return fallbackDate;
  }
}

/**
 * Handles the creation of a new user in the database.
 */
export async function createUser(
  tx: DatabaseTransaction,
  data: WebhookUserData,
  primaryEmail: string,
  now: Date,
  clerkProvidedRole: (typeof userRoleEnum.enumValues)[number] | undefined,
): Promise<typeof usersTable.$inferSelect | undefined> {
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    created_at: createdAt,
    updated_at: updatedAt,
  } = data;

  try {
    const userCreatedAt = safelyParseDate(createdAt, now);
    const userUpdatedAt = safelyParseDate(updatedAt, now);

    console.log('Webhook: Creating new user in database', {
      clerkId: id,
      email: primaryEmail,
      role: clerkProvidedRole,
      timestamp: new Date().toISOString(),
    });

    await tx.insert(users).values({
      clerkId: id,
      email: primaryEmail,
      firstName: firstName || null,
      lastName: lastName || null,
      imageUrl: imageUrl || null,
      createdAt: userCreatedAt,
      updatedAt: userUpdatedAt,
      role: clerkProvidedRole,
    });

    const newUser = (await tx.select().from(users).where(eq(users.clerkId, id)).limit(1))[0];

    if (!newUser) {
      throw new Error(`Failed to retrieve newly created user with Clerk ID: ${id}`);
    }

    console.info('Webhook: Successfully created new user in DB', {
      userId: newUser.id,
      clerkId: id,
      email: primaryEmail,
      role: newUser.role,
    });

    return newUser;
  } catch (error) {
    console.error('Webhook: Failed to create user in database', {
      clerkId: id,
      email: primaryEmail,
      role: clerkProvidedRole,
      error,
    });
    throw error; // Re-throw to trigger atomic cleanup
  }
}

/**
 * Handles updating an existing user in the database.
 */
export async function updateUser(
  tx: DatabaseTransaction,
  existingUser: typeof usersTable.$inferSelect,
  data: WebhookUserData,
  primaryEmail: string,
  now: Date,
  validatedRole: (typeof userRoleEnum.enumValues)[number],
): Promise<typeof usersTable.$inferSelect> {
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    updated_at: updatedAt,
  } = data;

  const userUpdatedAt = safelyParseDate(updatedAt, now);

  await tx
    .update(users)
    .set({
      email: primaryEmail,
      firstName: firstName || null,
      lastName: lastName || null,
      imageUrl: imageUrl || null,
      updatedAt: userUpdatedAt,
      role: validatedRole,
    })
    .where(eq(users.clerkId, id));

  const updatedUser = (await tx.select().from(users).where(eq(users.clerkId, id)).limit(1))[0];
  console.info('Webhook: Updated existing user in DB', { userId: id });
  return updatedUser;
}

/**
 * Handles updating a user by email with a new Clerk ID.
 */
export async function updateUserWithClerkId(
  tx: DatabaseTransaction,
  userWithEmail: typeof usersTable.$inferSelect,
  data: WebhookUserData,
  primaryEmail: string,
  now: Date,
  clerkProvidedRole: (typeof userRoleEnum.enumValues)[number] | undefined,
): Promise<typeof usersTable.$inferSelect | undefined> {
  const {
    id,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    updated_at: updatedAt,
  } = data;

  const userUpdatedAt = safelyParseDate(updatedAt, now);

  await tx
    .update(users)
    .set({
      clerkId: id,
      firstName: firstName || userWithEmail.firstName || null,
      lastName: lastName || userWithEmail.lastName || null,
      imageUrl: imageUrl || userWithEmail.imageUrl || null,
      updatedAt: userUpdatedAt,
      role: clerkProvidedRole ?? userWithEmail.role,
    })
    .where(eq(users.email, primaryEmail));

  const updatedUser = (
    await tx.select().from(users).where(eq(users.email, primaryEmail)).limit(1)
  )[0];
  console.info('Webhook: Updated user with new Clerk ID in DB', {
    userId: id,
    previousId: userWithEmail.clerkId,
  });
  return updatedUser;
}

/**
 * Restore promotePendingTherapist function for DB promotion only
 */
export async function promotePendingTherapist(
  user: typeof usersTable.$inferSelect,
  pendingTherapistMatch: typeof pendingTherapists.$inferSelect,
  dbOrTx: DatabaseTransaction,
) {
  // Check if therapist already exists for this user
  const existingTherapist = (
    await dbOrTx.select().from(therapists).where(eq(therapists.userId, user.id)).limit(1)
  )[0];
  if (existingTherapist) {
    console.info('promotePendingTherapist: Therapist already exists for user', { userId: user.id });
    // Still update the user's role in case it changed
    await dbOrTx
      .update(users)
      .set({ role: 'therapist', updatedAt: createDate().toJSDate() })
      .where(eq(users.id, user.id));
    return;
  }
  await dbOrTx.insert(therapists).values({
    userId: user.id,
    name: pendingTherapistMatch.name,
    title: pendingTherapistMatch.title,
    bookingURL: pendingTherapistMatch.bookingURL,
    expertise: pendingTherapistMatch.expertise,
    certifications: pendingTherapistMatch.certifications,
    song: pendingTherapistMatch.song,
    yoe: pendingTherapistMatch.yoe,
    clientele: pendingTherapistMatch.clientele,
    longBio: pendingTherapistMatch.longBio,
    previewBlurb: pendingTherapistMatch.previewBlurb,
    profileUrl: pendingTherapistMatch.profileUrl,
    hourlyRateCents: pendingTherapistMatch.hourlyRateCents,
    googleCalendarIntegrationStatus: 'not_connected',
    createdAt: createDate().toJSDate(),
    updatedAt: createDate().toJSDate(),
  });
  await dbOrTx
    .update(users)
    .set({ role: 'therapist', updatedAt: createDate().toJSDate() })
    .where(eq(users.id, user.id));
  
  // Delete the pending therapist record to prevent duplicates
  await dbOrTx
    .delete(pendingTherapists)
    .where(eq(pendingTherapists.id, pendingTherapistMatch.id));
  
  console.info('promotePendingTherapist: Successfully promoted and cleaned up pending record', {
    userId: user.id,
    pendingTherapistId: pendingTherapistMatch.id,
  });
}

/**
 * Synchronize user role to Clerk's metadata using centralized manager
 * This ensures middleware can read the role from sessionClaims
 */
export async function synchronizeRoleToClerk(clerkUserId: string, role: string): Promise<void> {
  try {
    await MetadataManager.synchronizeRoleToClerk(clerkUserId, role);
    console.log('Webhook: Successfully synchronized role to Clerk', { clerkUserId, role });
  } catch (error) {
    console.error('Webhook: Failed to synchronize role to Clerk', { clerkUserId, role, error });
    // Don't throw - this shouldn't fail the entire webhook
  }
}

/**
 * Enhanced role validation with comprehensive logging and error handling
 */
export async function validateRoleAuthorization(
  email: string,
  requestedRole: string,
  tx: DatabaseTransaction,
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const emailDomain = normalizedEmail.split('@')[1];

  console.log('Webhook: Starting role validation', {
    email: normalizedEmail,
    domain: emailDomain,
    requestedRole,
    timestamp: new Date().toISOString(),
  });

  try {
    // 1. THERAPIST ROLE - Must be in pendingTherapists table
    if (requestedRole === 'therapist') {
      const pendingTherapist = await tx
        .select()
        .from(pendingTherapists)
        .where(eq(pendingTherapists.clerkEmail, normalizedEmail))
        .limit(1);

      if (pendingTherapist.length > 0) {
        console.log('✅ Webhook: Therapist role authorized via pendingTherapists table', {
          email: normalizedEmail,
          therapistName: pendingTherapist[0].name,
        });
        return 'therapist';
      } else {
        console.warn('❌ Webhook: Unauthorized therapist role request - not in pendingTherapists', {
          email: normalizedEmail,
          requestedRole,
          fallbackRole: 'employee',
        });
        return 'employee'; // Fallback to employee
      }
    }

    // 2. EMPLOYER_ADMIN ROLE - Must be in allowed employer admin emails
    if (requestedRole === 'employer_admin') {
      if (ALLOWED_EMPLOYER_ADMIN_EMAILS.includes(normalizedEmail)) {
        console.log(
          '✅ Webhook: Employer admin role authorized via ALLOWED_EMPLOYER_ADMIN_EMAILS',
          {
            email: normalizedEmail,
          },
        );
        return 'employer_admin';
      } else {
        console.warn('❌ Webhook: Unauthorized employer_admin role request - not in allowed list', {
          email: normalizedEmail,
          requestedRole,
          fallbackRole: 'employee',
        });
        return 'employee'; // Fallback to employee
      }
    }

    // 3. EMPLOYEE ROLE (default) - Check if they belong to a known employer
    // Check exact email match first
    if (EMPLOYER_EMAIL_MAP[normalizedEmail]) {
      console.log('✅ Webhook: Employee role authorized via exact email match', {
        email: normalizedEmail,
        employer: EMPLOYER_EMAIL_MAP[normalizedEmail],
      });
      return 'employee';
    }

    // Check domain match
    if (emailDomain && EMPLOYER_EMAIL_MAP[emailDomain]) {
      console.log('✅ Webhook: Employee role authorized via domain match', {
        email: normalizedEmail,
        domain: emailDomain,
        employer: EMPLOYER_EMAIL_MAP[emailDomain],
      });
      return 'employee';
    }

    // If no specific role requested or no authorization found, default to individual_consumer
    // This allows B2C users to sign up independently
    console.log(
      '⚠️ Webhook: No employer authorization found, defaulting to individual_consumer role',
      {
        email: normalizedEmail,
        domain: emailDomain,
        requestedRole,
        finalRole: 'individual_consumer',
      },
    );
    return 'individual_consumer';
  } catch (error) {
    console.error('Webhook: Error during role validation', {
      email: normalizedEmail,
      requestedRole,
      error,
      fallbackRole: 'individual_consumer',
    });

    // On any error in role validation, default to individual_consumer
    return 'individual_consumer';
  }
}

/**
 * Process onboarding data from Clerk unsafeMetadata
 */
export async function processOnboardingData(
  tx: DatabaseTransaction,
  user: typeof usersTable.$inferSelect,
  unsafeMetadata: Record<string, unknown>,
) {
  try {
    // Extract onboarding data from unsafeMetadata
    const onboardingData = {
      firstName: unsafeMetadata.firstName as string,
      lastName: unsafeMetadata.lastName as string,
      email: unsafeMetadata.email as string,
      purpose: unsafeMetadata.purpose as string,
      ageRange: unsafeMetadata.ageRange as string,
      maritalStatus: unsafeMetadata.maritalStatus as string,
      ethnicity: unsafeMetadata.ethnicity as string,
      agreeToTerms: unsafeMetadata.agreeToTerms as boolean,
      role: unsafeMetadata.role as string,
    };

    // Only process if we have meaningful onboarding data
    if (
      onboardingData.purpose ||
      onboardingData.ageRange ||
      onboardingData.maritalStatus ||
      onboardingData.ethnicity
    ) {
      // Store onboarding data in userOnboarding table
      await tx
        .insert(userOnboarding)
        .values({
          userId: user.id,
          answers: onboardingData,
          version: 1,
          createdAt: createDate().toJSDate(),
          updatedAt: createDate().toJSDate(),
        })
        .onConflictDoUpdate({
          target: userOnboarding.userId,
          set: {
            answers: onboardingData,
            version: 1,
            updatedAt: createDate().toJSDate(),
          },
        });

      console.log('Webhook: Processed onboarding data', { userId: user.id });
    }
  } catch (error) {
    console.error('Webhook: Error processing onboarding data', { userId: user.id, error });
    // Don't fail the entire webhook for onboarding data issues
  }
}

/**
 * Deletes a Clerk user when database operations fail during user.created events
 * This ensures atomic signup - if we can't create the user in our database,
 * we remove them from Clerk to maintain consistency
 */
export async function deleteClerkUserOnFailure(clerkUserId: string, reason: string): Promise<void> {
  try {
    console.warn('Webhook: Attempting to delete Clerk user due to database failure', {
      clerkUserId,
      reason,
      timestamp: new Date().toISOString(),
    });

    const client = await clerkClient();

    // First verify the user exists before attempting deletion
    try {
      await client.users.getUser(clerkUserId);
    } catch (getUserError) {
      console.warn('Webhook: Clerk user may have already been deleted or not found', {
        clerkUserId,
        error: getUserError,
      });
      // User doesn't exist, so no cleanup needed
      return;
    }

    // Attempt to delete the user with retries
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await client.users.deleteUser(clerkUserId);
        console.info('Webhook: Successfully deleted Clerk user to maintain atomicity', {
          clerkUserId,
          reason,
          retryCount,
          timestamp: new Date().toISOString(),
        });
        return;
      } catch (deleteError) {
        retryCount++;
        console.warn(`Webhook: Clerk user deletion attempt ${retryCount} failed`, {
          clerkUserId,
          reason,
          retryCount,
          maxRetries,
          error: deleteError,
        });

        if (retryCount < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    }

    // All retries failed
    throw new Error(`Failed to delete Clerk user after ${maxRetries} attempts`);
  } catch (deleteError) {
    console.error('Webhook: CRITICAL - Failed to delete Clerk user after database failure', {
      clerkUserId,
      reason,
      deleteError,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
    });

    // TODO: Add alerting here for critical errors
    // This is a critical error - we have an orphaned Clerk user
    // Consider adding to a cleanup queue or sending alerts to operations team

    // Store the orphaned user info for manual cleanup
    try {
      // Could store in a separate table for manual cleanup later
      console.error('Webhook: Orphaned Clerk user requires manual cleanup', {
        clerkUserId,
        reason,
        failureTimestamp: new Date().toISOString(),
        action_required: 'manual_cleanup',
      });
    } catch (logError) {
      console.error('Webhook: Failed to log orphaned user for cleanup', {
        clerkUserId,
        logError,
      });
    }
  }
}
