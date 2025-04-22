import { eq } from 'drizzle-orm';
import { Result, ok, err } from 'neverthrow';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';

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
  email_addresses: WebhookUserData['email_addresses'],
): Result<string, UserHandlingError> {
  const verifiedEmail = email_addresses?.find(
    (email) => email.verification?.status === 'verified',
  )?.email_address;

  const primaryEmail = verifiedEmail || email_addresses?.[0]?.email_address;

  return primaryEmail
    ? ok(primaryEmail)
    : (err({ type: 'NoValidEmail', userId: email_addresses?.[0]?.id || 'unknown' }) as Result<
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { id, email_addresses, first_name, last_name, image_url, created_at, updated_at } = data;

  // Get primary email
  const emailResult = getPrimaryEmail(email_addresses);
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
    const [existingUserByClerkId, existingUserByEmail] = await Promise.all([
      db.select().from(users).where(eq(users.clerkId, id)).limit(1),
      db.select().from(users).where(eq(users.email, primaryEmail)).limit(1),
    ]);

    const existingUser = existingUserByClerkId[0];
    const userWithEmail = existingUserByEmail[0];

    const now = new Date();
    const userCreatedAt = new Date(created_at);
    const userUpdatedAt = new Date(updated_at);

    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          updatedAt: userUpdatedAt || now,
        })
        .where(eq(users.clerkId, id));

      console.info('Updated existing user', {
        userId: id,
        eventType,
      });
    } else if (eventType === 'user.created') {
      if (userWithEmail) {
        // Handle case where email exists but with different Clerk ID
        await db
          .update(users)
          .set({
            clerkId: id,
            firstName: first_name || userWithEmail.firstName,
            lastName: last_name || userWithEmail.lastName,
            imageUrl: image_url || userWithEmail.imageUrl,
            updatedAt: userUpdatedAt || now,
          })
          .where(eq(users.email, primaryEmail));

        console.info('Updated user with new Clerk ID', {
          userId: id,
          eventType,
          previousId: userWithEmail.clerkId,
        });
      } else {
        // Create new user
        await db.insert(users).values({
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          createdAt: userCreatedAt || now,
          updatedAt: userUpdatedAt || now,
        });

        console.info('Created new user', {
          userId: id,
          eventType,
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
        updatedAt: new Date(),
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
        updatedAt: new Date(), // Using updatedAt as activity tracker
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
