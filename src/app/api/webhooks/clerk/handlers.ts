import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { type PgTransaction } from 'drizzle-orm/pg-core';
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
import {
  trackUserCreatedServerSide,
  trackUserUpdatedServerSide,
  trackUserActivityServerSide,
} from '@/src/features/posthog/authTrackingServer';
import { getOrCreateStripeCustomer } from '@/src/features/stripe';
import { createDate } from '@/src/utils/timezone';

import {
  associateUserWithEmployerAndSponsoredGroup,
  synchronizeSponsoredGroupToClerk,
} from './sponsoredGroupHelpers';

// Import clerkClient for role synchronization

// Proper Drizzle transaction type
type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface WebhookUserData {
  id: string;
  email_addresses: Array<{ email_address: string; id: string; verification?: { status: string } }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

type UserHandlingError =
  | { type: 'NoValidEmail'; userId: string }
  | { type: 'DatabaseError'; message: string; originalError: unknown };

/**
 * Extracts the primary email from an array of email addresses.
 */
function getPrimaryEmail(
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
function safelyParseDate(timestamp: string | number | null, fallbackDate: Date): Date {
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
async function createUser(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
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

  const userCreatedAt = safelyParseDate(createdAt, now);
  const userUpdatedAt = safelyParseDate(updatedAt, now);

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
  console.info('Webhook: Created new user in DB', { userId: id });
  return newUser;
}

/**
 * Handles updating an existing user in the database.
 */
async function updateUser(
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
async function updateUserWithClerkId(
  tx: PgTransaction<any, any, any>,
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
async function promotePendingTherapist(
  user: typeof usersTable.$inferSelect,
  pendingTherapistMatch: any, // You may want to type this more strictly
  dbOrTx: any,
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
}

/**
 * Synchronize user role to Clerk's publicMetadata for session tokens
 * This ensures middleware can read the role from sessionClaims
 */
async function synchronizeRoleToClerk(clerkUserId: string, role: string): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role,
        onboardingComplete: true,
      },
    });
    console.log('Webhook: Successfully synchronized role to Clerk', { clerkUserId, role });
  } catch (error) {
    console.error('Webhook: Failed to synchronize role to Clerk', { clerkUserId, role, error });
    // Don't throw - this shouldn't fail the entire webhook
  }
}

/**
 * Main function to handle user creation or update events from Clerk webhooks.
 */
export async function handleUserCreateOrUpdate(
  eventType: 'user.created' | 'user.updated',
  data: WebhookUserData,
): Promise<Result<boolean, UserHandlingError>> {
  const {
    id,
    email_addresses: emailAddresses,
    public_metadata: publicMetadata,
    unsafe_metadata: unsafeMetadata,
  } = data;

  // Prioritize unsafeMetadata over publicMetadata for role (signup flow uses unsafeMetadata)
  const clerkProvidedRole = (unsafeMetadata?.role || publicMetadata?.role) as
    | (typeof userRoleEnum.enumValues)[number]
    | undefined;

  console.log('Webhook: Processing user event', {
    userId: id,
    eventType,
    clerkProvidedRole,
    hasUnsafeMetadata: !!unsafeMetadata,
    hasPublicMetadata: !!publicMetadata,
  });

  const emailResult = getPrimaryEmail(emailAddresses, id);
  if (emailResult.isErr()) {
    console.error('Webhook: No valid email found for user', { userId: id, eventType });
    return err(emailResult.error);
  }

  const primaryEmail = emailResult.value.toLowerCase();
  const now = createDate().toJSDate();

  try {
    await db.transaction(async (tx) => {
      const existingUser = (await tx.select().from(users).where(eq(users.clerkId, id)).limit(1))[0];
      const userWithEmail = (
        await tx.select().from(users).where(eq(users.email, primaryEmail)).limit(1)
      )[0];

      // CRITICAL: Prevent role changes after initial signup
      let finalValidatedRole: string;

      if (existingUser && eventType === 'user.updated') {
        // For existing users, NEVER allow role changes - use existing role
        finalValidatedRole = existingUser.role;
        console.log('Webhook: Preventing role change for existing user', {
          userId: id,
          existingRole: existingUser.role,
          attemptedRole: clerkProvidedRole,
          eventType,
        });
      } else {
        // For new users, validate the requested role
        const requestedRole = (unsafeMetadata?.role || publicMetadata?.role) as string;
        finalValidatedRole = await validateRoleAuthorization(primaryEmail, requestedRole, tx);

        console.log('Webhook: Role validation for new user', {
          requestedRole,
          validatedRole: finalValidatedRole,
          email: primaryEmail,
          eventType,
        });
      }

      let finalUser: typeof usersTable.$inferSelect | undefined = undefined;

      if (existingUser) {
        finalUser = await updateUser(
          tx,
          existingUser,
          data,
          primaryEmail,
          now,
          finalValidatedRole as any,
        );
      } else if (userWithEmail) {
        finalUser = await updateUserWithClerkId(
          tx,
          userWithEmail,
          data,
          primaryEmail,
          now,
          finalValidatedRole as any,
        );
      } else {
        finalUser = await createUser(tx, data, primaryEmail, now, finalValidatedRole as any);
      }

      if (!finalUser) {
        throw new Error('Failed to create or update user');
      }

      // CRITICAL: Ensure role is synchronized to Clerk's publicMetadata for session tokens
      await synchronizeRoleToClerk(id, finalUser.role);

      console.log('Webhook: User created/updated with validated role', {
        userId: finalUser.id,
        clerkId: finalUser.clerkId,
        role: finalUser.role,
        email: finalUser.email,
        eventType,
      });

      // Handle role-specific logic ONLY if role is therapist and validated
      if (finalUser.role === 'therapist') {
        const pendingTherapistMatch = (
          await tx
            .select()
            .from(pendingTherapists)
            .where(eq(pendingTherapists.clerkEmail, primaryEmail))
            .limit(1)
        )[0];

        if (pendingTherapistMatch) {
          await promotePendingTherapist(finalUser, pendingTherapistMatch, tx);
          console.log('Webhook: Successfully promoted pending therapist', {
            userId: finalUser.id,
            therapistName: pendingTherapistMatch.name,
          });
        } else {
          console.error('Webhook: User has therapist role but no pendingTherapist record', {
            userId: finalUser.id,
            email: primaryEmail,
          });
        }
      }

      // NEW: Associate employee users with their employer and potentially a sponsored group
      if (finalUser.role === 'employee') {
        // Extract sponsored group name from unsafeMetadata if provided during signup
        const sponsoredGroupName = unsafeMetadata?.sponsoredGroupName as string | undefined;

        await associateUserWithEmployerAndSponsoredGroup(
          tx,
          finalUser,
          primaryEmail,
          sponsoredGroupName,
        );

        // Store sponsored group name in Clerk metadata for client-side access
        if (sponsoredGroupName) {
          await synchronizeSponsoredGroupToClerk(id, sponsoredGroupName);
        }
      }

      // Process onboarding data if present in unsafeMetadata (for new signups)
      if (eventType === 'user.created' && finalUser && unsafeMetadata) {
        await processOnboardingData(tx, finalUser, unsafeMetadata);
      }

      console.info('Webhook: User sync complete', {
        userId: id,
        eventType,
        finalRole: finalUser.role,
        email: finalUser.email,
      });

      // Track authentication events in PostHog
      if (eventType === 'user.created') {
        await trackUserCreatedServerSide(finalUser.clerkId, finalUser.email, finalUser.role, {
          signup_method: 'email_password',
          onboarding_completed: !!unsafeMetadata,
        });
      } else if (eventType === 'user.updated') {
        await trackUserUpdatedServerSide(
          finalUser.clerkId,
          finalUser.email,
          finalUser.role,
          [], // changedFields - empty array since we don't track specific field changes
          {
            update_source: 'webhook',
          },
        );
      }
    });

    // Create Stripe customer for new users (outside transaction to avoid blocking)
    if (eventType === 'user.created') {
      try {
        const userRecord = await db.select().from(users).where(eq(users.clerkId, id)).limit(1);
        if (userRecord.length > 0) {
          await getOrCreateStripeCustomer(userRecord[0].id, primaryEmail);
          console.log('Webhook: Created Stripe customer for new user', {
            userId: id,
            email: primaryEmail,
          });
        }
      } catch (stripeError) {
        console.error('Webhook: Failed to create Stripe customer (non-blocking)', {
          userId: id,
          email: primaryEmail,
          error: stripeError,
        });
        // Don't fail the webhook for Stripe customer creation errors
      }
    }

    return ok(true);
  } catch (error) {
    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: `Error ${eventType === 'user.created' ? 'creating' : 'updating'} user during sync`,
      originalError: error,
    };
    console.error('Webhook: User handling error', {
      userId: id,
      eventType,
      error,
    });
    return err(errorDetails);
  }
}

/**
 * Process onboarding data from Clerk unsafeMetadata
 */
async function processOnboardingData(
  tx: PgTransaction<any, any, any>,
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
 * Handles user deletion events by marking the user as inactive.
 */
export async function handleUserDeletion(
  data: WebhookUserData,
): Promise<Result<boolean, UserHandlingError>> {
  const { id } = data;

  try {
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: createDate().toJSDate(),
      })
      .where(eq(users.clerkId, id));

    console.info('Webhook: Marked user as inactive', { userId: id });
    return ok(true);
  } catch (error) {
    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: 'Webhook: Error handling user deletion',
      originalError: error,
    };
    console.error('Webhook: User deletion error', { userId: id, error });
    return err(errorDetails);
  }
}

/**
 * Handles user activity events (e.g., sign in, sign out) by updating the user's timestamp.
 */
export async function handleUserActivity(
  data: WebhookUserData,
): Promise<Result<boolean, UserHandlingError>> {
  const { id } = data;

  try {
    await db
      .update(users)
      .set({
        updatedAt: createDate().toJSDate(), // Using updatedAt as activity tracker
      })
      .where(eq(users.clerkId, id));

    console.info('Webhook: Updated user activity', { userId: id });
    return ok(true);
  } catch (error) {
    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: 'Webhook: Error handling user activity',
      originalError: error,
    };
    console.error('Webhook: User activity update error', { userId: id, error });
    return err(errorDetails);
  }
}

/**
 * Validates if a user is authorized for the requested role
 * This is the SINGLE SOURCE OF TRUTH for role assignment
 */
async function validateRoleAuthorization(
  email: string,
  requestedRole: string,
  tx: DatabaseTransaction,
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const emailDomain = normalizedEmail.split('@')[1];

  console.log('Role validation:', {
    email: normalizedEmail,
    domain: emailDomain,
    requestedRole,
  });

  // 1. THERAPIST ROLE - Must be in pendingTherapists table
  if (requestedRole === 'therapist') {
    const pendingTherapist = await tx
      .select()
      .from(pendingTherapists)
      .where(eq(pendingTherapists.clerkEmail, normalizedEmail))
      .limit(1);

    if (pendingTherapist.length > 0) {
      console.log('✅ Therapist role authorized via pendingTherapists table', {
        email: normalizedEmail,
      });
      return 'therapist';
    } else {
      console.warn('❌ Unauthorized therapist role request - not in pendingTherapists', {
        email: normalizedEmail,
        requestedRole,
      });
      return 'employee'; // Fallback to employee
    }
  }

  // 2. EMPLOYER_ADMIN ROLE - Must be in allowed employer admin emails
  if (requestedRole === 'employer_admin') {
    if (ALLOWED_EMPLOYER_ADMIN_EMAILS.includes(normalizedEmail)) {
      console.log('✅ Employer admin role authorized via ALLOWED_EMPLOYER_ADMIN_EMAILS', {
        email: normalizedEmail,
      });
      return 'employer_admin';
    } else {
      console.warn('❌ Unauthorized employer_admin role request - not in allowed list', {
        email: normalizedEmail,
        requestedRole,
      });
      return 'employee'; // Fallback to employee
    }
  }

  // 3. EMPLOYEE ROLE (default) - Check if they belong to a known employer
  // Check exact email match first
  if (EMPLOYER_EMAIL_MAP[normalizedEmail]) {
    console.log('✅ Employee role authorized via exact email match', {
      email: normalizedEmail,
      employer: EMPLOYER_EMAIL_MAP[normalizedEmail],
    });
    return 'employee';
  }

  // Check domain match
  if (emailDomain && EMPLOYER_EMAIL_MAP[emailDomain]) {
    console.log('✅ Employee role authorized via domain match', {
      email: normalizedEmail,
      domain: emailDomain,
      employer: EMPLOYER_EMAIL_MAP[emailDomain],
    });
    return 'employee';
  }

  // If no specific role requested or no authorization found, default to individual_consumer
  // This allows B2C users to sign up independently
  console.log('⚠️ No employer authorization found, defaulting to individual_consumer role', {
    email: normalizedEmail,
    domain: emailDomain,
    requestedRole,
  });
  return 'individual_consumer';
}
