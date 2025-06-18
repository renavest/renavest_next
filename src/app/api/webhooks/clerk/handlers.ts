import { eq } from 'drizzle-orm';
import { Result, ok, err } from 'neverthrow';

import { db } from '@/src/db';
import { users, userRoleEnum, pendingTherapists, userSessions } from '@/src/db/schema';
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
import type {
  WebhookUserData,
  WebhookSessionData,
  SessionHandlingError,
  UserHandlingError,
} from './types';

/**
 * Handles session.created events from Clerk webhooks with ACID principles.
 * Ensures the user exists in our database before tracking the session.
 */
export async function handleSessionCreated(
  sessionData: WebhookSessionData,
): Promise<Result<boolean, SessionHandlingError>> {
  const { id: sessionId, user_id: clerkUserId, created_at: createdAt } = sessionData;

  console.log('Webhook: Processing session.created event', {
    sessionId,
    clerkUserId,
    timestamp: new Date().toISOString(),
  });

  try {
    return await db.transaction(async (tx) => {
      // First, ensure the user exists in our database
      const user = (
        await tx.select().from(users).where(eq(users.clerkId, clerkUserId)).limit(1)
      )[0];

      if (!user) {
        console.error('Webhook: User not found for session.created event', {
          sessionId,
          clerkUserId,
          action: 'session_creation_skipped',
        });

        // Return error to trigger webhook retry - user might be created in subsequent webhook
        return err({
          type: 'UserNotFound',
          sessionId,
          clerkUserId,
        });
      }

      // Check if session already exists (idempotency)
      const existingSession = (
        await tx
          .select()
          .from(userSessions)
          .where(eq(userSessions.clerkSessionId, sessionId))
          .limit(1)
      )[0];

      if (existingSession) {
        console.log('Webhook: Session already tracked, skipping', {
          sessionId,
          userId: user.id,
          existingSessionId: existingSession.id,
        });
        return ok(true);
      }

      // Create session record
      await tx.insert(userSessions).values({
        userId: user.id,
        clerkSessionId: sessionId,
        status: 'created',
        createdAt: createdAt ? new Date(createdAt) : createDate().toJSDate(),
        metadata: sessionData.metadata || null,
      });

      console.info('Webhook: Successfully tracked session.created', {
        sessionId,
        userId: user.id,
        clerkUserId,
      });

      return ok(true);
    });
  } catch (error) {
    console.error('Webhook: Failed to handle session.created', {
      sessionId,
      clerkUserId,
      error,
    });

    return err({
      type: 'DatabaseError',
      message: 'Failed to track session creation',
      originalError: error,
    });
  }
}

/**
 * Handles session.removed and session.ended events from Clerk webhooks.
 */
export async function handleSessionEnded(
  sessionData: WebhookSessionData,
  eventType: 'session.removed' | 'session.ended',
): Promise<Result<boolean, SessionHandlingError>> {
  const { id: sessionId, user_id: clerkUserId, ended_at: endedAt } = sessionData;

  console.log(`Webhook: Processing ${eventType} event`, {
    sessionId,
    clerkUserId,
    timestamp: new Date().toISOString(),
  });

  try {
    return await db.transaction(async (tx) => {
      // Find the session record
      const existingSession = (
        await tx
          .select()
          .from(userSessions)
          .where(eq(userSessions.clerkSessionId, sessionId))
          .limit(1)
      )[0];

      if (!existingSession) {
        // Session not found - might be from before we started tracking or a race condition
        console.warn(`Webhook: Session not found for ${eventType} event`, {
          sessionId,
          clerkUserId,
          action: 'session_end_skipped',
        });
        return ok(true); // Not an error - just log and continue
      }

      // Update session status and end time
      await tx
        .update(userSessions)
        .set({
          status: eventType === 'session.ended' ? 'ended' : 'removed',
          endedAt: endedAt ? new Date(endedAt) : createDate().toJSDate(),
        })
        .where(eq(userSessions.id, existingSession.id));

      console.info(`Webhook: Successfully handled ${eventType}`, {
        sessionId,
        sessionDbId: existingSession.id,
        clerkUserId,
      });

      return ok(true);
    });
  } catch (error) {
    console.error(`Webhook: Failed to handle ${eventType}`, {
      sessionId,
      clerkUserId,
      error,
    });

    return err({
      type: 'DatabaseError',
      message: `Failed to handle ${eventType}`,
      originalError: error,
    });
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

  // Import helper functions from userOperations
  const {
    getPrimaryEmail,
    createUser,
    updateUser,
    updateUserWithClerkId,
    promotePendingTherapist,
    synchronizeRoleToClerk,
    validateRoleAuthorization,
    processOnboardingData,
    deleteClerkUserOnFailure,
  } = await import('./userOperations');

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
