import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { Result, ok, err } from 'neverthrow';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import { UserType } from '@/src/features/auth/types/auth';
import { createDate } from '@/src/utils/timezone';

// User-related webhook data
export interface WebhookUserData {
  id: string;
  email_addresses: Array<{ email_address: string; id: string; verification?: { status: string } }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Custom error types for user handling
type UserHandlingError =
  | { type: 'NoValidEmail'; userId: string }
  | { type: 'DatabaseError'; message: string; originalError: unknown };

/**
 * Get primary email from user data
 */
function getPrimaryEmail(
  emailAddresses: WebhookUserData['email_addresses'],
): Result<string, UserHandlingError> {
  const verifiedEmail = emailAddresses?.find(
    (email) => email.verification?.status === 'verified',
  )?.email_address;

  const primaryEmail = verifiedEmail || emailAddresses?.[0]?.email_address;

  return primaryEmail
    ? ok(primaryEmail)
    : (err({ type: 'NoValidEmail', userId: emailAddresses?.[0]?.id || 'unknown' }) as Result<
        string,
        UserHandlingError
      >);
}

/**
 * Handle user created or updated events
 */
export async function handleUserCreateOrUpdate(
  eventType: 'user.created' | 'user.updated',
  data: WebhookUserData,
): Promise<Result<boolean, UserHandlingError>> {
  const {
    id,
    email_addresses: emailAddresses,
    first_name: firstName,
    last_name: lastName,
    image_url: imageUrl,
    created_at: createdAt,
    updated_at: updatedAt,
  } = data;
  console.log('data', data);
  console.log('WEHOOK DATA', data);
  // Get primary email
  const emailResult = getPrimaryEmail(emailAddresses);
  if (emailResult.isErr()) {
    console.error('No valid email found for user', {
      userId: id,
      eventType,
    });
    return err({
      type: 'NoValidEmail',
      userId: id,
    });
  }

  const primaryEmail = emailResult.value;

  try {
    // Check if user exists by either clerkId or email
    const [existingUserByClerkId, existingUserByEmail, therapistRecord] = await Promise.all([
      db.select().from(users).where(eq(users.clerkId, id)).limit(1),
      db.select().from(users).where(eq(users.email, primaryEmail)).limit(1),
      db.select().from(therapists).where(eq(therapists.email, primaryEmail.toLowerCase())).limit(1),
    ]);

    const existingUser = existingUserByClerkId[0];
    const userWithEmail = existingUserByEmail[0];
    const matchedTherapist = therapistRecord[0];

    // Determine user role and set public metadata
    let userRole = 'user'; // default role
    if (matchedTherapist) {
      userRole = 'therapist';
    }

    // Add public metadata to Clerk user
    (await clerkClient()).users.updateUserMetadata(id, {
      publicMetadata: {
        role: userRole as UserType,
      },
    });

    const now = createDate().toJSDate();
    // Handle date conversions safely to prevent "Invalid time value" errors
    let userCreatedAt;
    let userUpdatedAt;

    try {
      // Convert timestamps to ISO dates if they're numbers
      const createdAtDate = typeof createdAt === 'number' ? new Date(createdAt) : createdAt;
      const updatedAtDate = typeof updatedAt === 'number' ? new Date(updatedAt) : updatedAt;

      userCreatedAt = createdAt ? createDate(createdAtDate).toJSDate() : now;
      userUpdatedAt = updatedAt ? createDate(updatedAtDate).toJSDate() : now;
    } catch (error) {
      console.error('Error converting dates', { createdAt, updatedAt, error });
      userCreatedAt = now;
      userUpdatedAt = now;
    }
    // TODO: add employer table

    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: primaryEmail,
          firstName: firstName || null,
          lastName: lastName || null,
          imageUrl: imageUrl || null,
          updatedAt: userUpdatedAt || now,
          therapistId: matchedTherapist?.id || null,
        })
        .where(eq(users.clerkId, id));

      console.info('Updated existing user', {
        userId: id,
        eventType,
        isTherapist: !!matchedTherapist,
        publicMetadata: { role: userRole },
      });
    } else if (eventType === 'user.created') {
      if (userWithEmail) {
        // Handle case where email exists but with different Clerk ID
        await db
          .update(users)
          .set({
            clerkId: id,
            firstName: firstName || userWithEmail.firstName,
            lastName: lastName || userWithEmail.lastName,
            imageUrl: imageUrl || userWithEmail.imageUrl,
            updatedAt: userUpdatedAt || now,
            therapistId: matchedTherapist?.id || null,
          })
          .where(eq(users.email, primaryEmail));

        console.info('Updated user with new Clerk ID', {
          userId: id,
          eventType,
          previousId: userWithEmail.clerkId,
          isTherapist: !!matchedTherapist,
          therapistId: matchedTherapist?.id,
          publicMetadata: { role: userRole },
        });
      } else {
        // Create new user
        await db.insert(users).values({
          clerkId: id,
          email: primaryEmail,
          firstName: firstName || null,
          lastName: lastName || null,
          imageUrl: imageUrl || null,
          createdAt: userCreatedAt || now,
          updatedAt: userUpdatedAt || now,
          therapistId: matchedTherapist?.id || null,
        });

        console.info('Created new user', {
          userId: id,
          eventType,
          isTherapist: !!matchedTherapist,
          therapistId: matchedTherapist?.id,
          publicMetadata: { role: userRole },
        });
      }
    }

    return ok(true);
  } catch (error) {
    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: `Error ${eventType === 'user.created' ? 'creating' : 'updating'} user`,
      originalError: error,
    };

    console.error('User handling error', {
      userId: id,
      eventType,
      error,
    });

    return err(errorDetails);
  }
}

/**
 * Handle user deletion events
 */
export async function handleUserDeletion(
  data: WebhookUserData,
): Promise<Result<boolean, UserHandlingError>> {
  const { id } = data;

  try {
    // Mark user as inactive instead of deleting
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: createDate().toJSDate(),
      })
      .where(eq(users.clerkId, id));

    console.info('Marked user as inactive', { userId: id });

    return ok(true);
  } catch (error) {
    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: 'Error handling user deletion',
      originalError: error,
    };

    console.error('User deletion error', {
      userId: id,
      error,
    });

    return err(errorDetails);
  }
}

/**
 * Handle user activity events (sign in, sign out)
 */
export async function handleUserActivity(
  data: WebhookUserData,
): Promise<Result<boolean, UserHandlingError>> {
  const { id } = data;

  try {
    // Update user's last activity timestamp
    await db
      .update(users)
      .set({
        updatedAt: createDate().toJSDate(), // Using updatedAt as activity tracker
      })
      .where(eq(users.clerkId, id));

    console.info('Updated user activity', { userId: id });

    return ok(true);
  } catch (error) {
    const errorDetails: UserHandlingError = {
      type: 'DatabaseError',
      message: 'Error handling user activity',
      originalError: error,
    };

    console.error('User activity update error', {
      userId: id,
      error,
    });

    return err(errorDetails);
  }
}
