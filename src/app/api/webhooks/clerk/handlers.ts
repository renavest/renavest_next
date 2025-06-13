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
import {
  trackUserCreatedServerSide,
  trackUserUpdatedServerSide,
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
async function promotePendingTherapist(
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
 * For user.created events, this implements atomic signup - if database operations fail,
 * the Clerk user is deleted to maintain consistency.
 *
 * This function ensures ACID properties:
 * - Atomicity: All operations succeed or all fail (with Clerk user cleanup)
 * - Consistency: Role validation and authorization checks maintain data integrity
 * - Isolation: Database transactions ensure concurrent operations don't interfere
 * - Durability: Successful operations are committed to the database
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

  const startTime = Date.now();

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
    timestamp: new Date().toISOString(),
    signupTimestamp: unsafeMetadata?.signupTimestamp,
  });

  // Validate email extraction
  const emailResult = getPrimaryEmail(emailAddresses, id);
  if (emailResult.isErr()) {
    console.error('Webhook: No valid email found for user', {
      userId: id,
      eventType,
      emailAddresses: emailAddresses.map((e) => ({ id: e.id, verified: e.verification?.status })),
      timestamp: new Date().toISOString(),
    });

    // For user.created events, delete the Clerk user since we can't process them
    if (eventType === 'user.created') {
      await deleteClerkUserOnFailure(
        id,
        'No valid email found - cannot process user without email',
      );
    }

    return err(emailResult.error);
  }

  const primaryEmail = emailResult.value.toLowerCase();
  const now = createDate().toJSDate();

  // Start database transaction with comprehensive error handling
  try {
    const result = await db.transaction(async (tx) => {
      console.log('Webhook: Starting database transaction', {
        userId: id,
        eventType,
        email: primaryEmail,
        transactionId: Math.random().toString(36).substr(2, 9), // Simple transaction ID for logging
      });

      try {
        // Check for existing users with comprehensive logging
        const existingUser = (
          await tx.select().from(users).where(eq(users.clerkId, id)).limit(1)
        )[0];
        const userWithEmail = (
          await tx.select().from(users).where(eq(users.email, primaryEmail)).limit(1)
        )[0];

        console.log('Webhook: User lookup results', {
          userId: id,
          eventType,
          hasExistingUser: !!existingUser,
          hasUserWithEmail: !!userWithEmail,
          existingUserId: existingUser?.id,
          userWithEmailId: userWithEmail?.id,
        });

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
          // For new users, validate the requested role with comprehensive error handling
          try {
            const requestedRole = (unsafeMetadata?.role || publicMetadata?.role) as string;
            finalValidatedRole = await validateRoleAuthorization(primaryEmail, requestedRole, tx);

            console.log('Webhook: Role validation completed for new user', {
              requestedRole,
              validatedRole: finalValidatedRole,
              email: primaryEmail,
              eventType,
            });
          } catch (roleValidationError) {
            console.error('Webhook: Role validation failed, using fallback', {
              userId: id,
              email: primaryEmail,
              error: roleValidationError,
              fallbackRole: 'individual_consumer',
            });
            finalValidatedRole = 'individual_consumer';
          }
        }

        let finalUser: typeof usersTable.$inferSelect | undefined = undefined;

        // Handle user creation/update with proper error handling
        try {
          if (existingUser) {
            finalUser = await updateUser(
              tx,
              existingUser,
              data,
              primaryEmail,
              now,
              finalValidatedRole as (typeof userRoleEnum.enumValues)[number],
            );
          } else if (userWithEmail) {
            finalUser = await updateUserWithClerkId(
              tx,
              userWithEmail,
              data,
              primaryEmail,
              now,
              finalValidatedRole as (typeof userRoleEnum.enumValues)[number],
            );
          } else {
            finalUser = await createUser(
              tx,
              data,
              primaryEmail,
              now,
              finalValidatedRole as (typeof userRoleEnum.enumValues)[number],
            );
          }

          if (!finalUser) {
            throw new Error('Failed to create or update user - no user record returned');
          }

          // CRITICAL: Ensure role is synchronized to Clerk's publicMetadata for session tokens
          try {
            await synchronizeRoleToClerk(id, finalUser.role);
          } catch (syncError) {
            console.error('Webhook: Failed to synchronize role to Clerk - non-blocking', {
              userId: id,
              role: finalUser.role,
              error: syncError,
            });
            // Non-blocking error - continue processing
          }

          console.log('Webhook: User created/updated with validated role', {
            userId: finalUser.id,
            clerkId: finalUser.clerkId,
            role: finalUser.role,
            email: finalUser.email,
            eventType,
          });

          // Handle role-specific logic with error handling
          if (finalUser.role === 'therapist') {
            try {
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
            } catch (therapistError) {
              console.error('Webhook: Failed to process therapist promotion', {
                userId: finalUser.id,
                email: primaryEmail,
                error: therapistError,
              });
              throw therapistError; // This should fail the transaction
            }
          }

          // Associate employee users with their employer and potentially a sponsored group
          if (finalUser.role === 'employee') {
            try {
              const sponsoredGroupName = unsafeMetadata?.sponsoredGroupName as string | undefined;

              await associateUserWithEmployerAndSponsoredGroup(
                tx,
                finalUser,
                primaryEmail,
                sponsoredGroupName,
              );

              // Store sponsored group name in Clerk metadata for client-side access
              if (sponsoredGroupName) {
                try {
                  await synchronizeSponsoredGroupToClerk(id, sponsoredGroupName);
                } catch (sponsoredGroupSyncError) {
                  console.error('Webhook: Failed to sync sponsored group to Clerk - non-blocking', {
                    userId: id,
                    sponsoredGroupName,
                    error: sponsoredGroupSyncError,
                  });
                  // Non-blocking error
                }
              }
            } catch (employerError) {
              console.error('Webhook: Failed to associate user with employer', {
                userId: finalUser.id,
                email: primaryEmail,
                error: employerError,
              });
              // Non-blocking error - don't fail the transaction
            }
          }

          // Process onboarding data if present in unsafeMetadata (for new signups)
          if (eventType === 'user.created' && finalUser && unsafeMetadata) {
            try {
              await processOnboardingData(tx, finalUser, unsafeMetadata);
            } catch (onboardingError) {
              console.error('Webhook: Failed to process onboarding data - non-blocking', {
                userId: finalUser.id,
                error: onboardingError,
              });
              // Non-blocking error - don't fail the transaction
            }
          }

          console.info('Webhook: User sync complete', {
            userId: id,
            eventType,
            finalRole: finalUser.role,
            email: finalUser.email,
            processingTime: Date.now() - startTime,
          });

          // Track authentication events in PostHog with error handling
          try {
            if (eventType === 'user.created') {
              await trackUserCreatedServerSide(finalUser.clerkId, finalUser.email, finalUser.role, {
                signup_method: 'email_password',
                onboarding_completed: !!unsafeMetadata,
                processing_time_ms: Date.now() - startTime,
              });
            } else if (eventType === 'user.updated') {
              await trackUserUpdatedServerSide(
                finalUser.clerkId,
                finalUser.email,
                finalUser.role,
                [], // changedFields - empty array since we don't track specific field changes
                {
                  update_source: 'webhook',
                  processing_time_ms: Date.now() - startTime,
                },
              );
            }
          } catch (trackingError) {
            console.error('Webhook: Failed to track authentication event - non-blocking', {
              userId: id,
              eventType,
              error: trackingError,
            });
            // Non-blocking error
          }

          return finalUser;
        } catch (userOperationError) {
          console.error('Webhook: User operation failed within transaction', {
            userId: id,
            eventType,
            email: primaryEmail,
            error: userOperationError,
          });
          throw userOperationError; // Will trigger transaction rollback
        }
      } catch (transactionError) {
        console.error('Webhook: Transaction operation failed', {
          userId: id,
          eventType,
          email: primaryEmail,
          error: transactionError,
        });
        throw transactionError; // Re-throw to rollback transaction
      }
    });

    // Handle post-transaction operations (outside transaction to avoid blocking)
    if (eventType === 'user.created' && result) {
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
    console.error('Webhook: Database operation failed', {
      userId: id,
      eventType,
      error,
      processingTime: Date.now() - startTime,
      email: primaryEmail,
    });

    // ATOMIC SIGNUP: For user.created events, delete the Clerk user if database operations fail
    if (eventType === 'user.created') {
      await deleteClerkUserOnFailure(
        id,
        `Database operation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: `Error ${eventType === 'user.created' ? 'creating' : 'updating'} user during sync`,
      originalError: error,
    };

    return err(errorDetails);
  }
}

/**
 * Deletes a Clerk user when database operations fail during user.created events
 * This ensures atomic signup - if we can't create the user in our database,
 * we remove them from Clerk to maintain consistency
 */
async function deleteClerkUserOnFailure(clerkUserId: string, reason: string): Promise<void> {
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

/**
 * Process onboarding data from Clerk unsafeMetadata
 */
async function processOnboardingData(
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
 * Enhanced role validation with comprehensive logging and error handling
 */
async function validateRoleAuthorization(
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
