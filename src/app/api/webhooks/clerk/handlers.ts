import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';

// User-related webhook data
export interface WebhookUserData {
  id: string;
  email_addresses: Array<{ email_address: string; id: string; verification?: { status: string } }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

/**
 * Handle user created or updated events
 */
export async function handleUserCreateOrUpdate(
  eventType: 'user.created' | 'user.updated',
  data: WebhookUserData,
) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  // Get primary email - prefer verified emails if available
  const verifiedEmail = email_addresses?.find(
    (email) => email.verification?.status === 'verified',
  )?.email_address;

  const primaryEmail = verifiedEmail || email_addresses?.[0]?.email_address;

  if (!primaryEmail) {
    console.error(`No valid email found for user: ${id}`);
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.clerkId, id)).limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));

      console.log(`Updated user with ID: ${id}`);
    } else if (eventType === 'user.created') {
      // Insert new user
      await db.insert(users).values({
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
      });

      console.log(`Created new user with ID: ${id}`);
    }
  } catch (error) {
    console.error(`Error ${eventType === 'user.created' ? 'creating' : 'updating'} user:`, error);
    throw error;
  }
}

/**
 * Handle user deletion events
 */
export async function handleUserDeletion(data: WebhookUserData) {
  const { id } = data;

  try {
    // Mark user as inactive instead of deleting
    // This is often better than hard deletes for data integrity
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, id));

    console.log(`Marked user as inactive: ${id}`);

    // Alternatively, if you want to hard delete:
    // await db.delete(users).where(eq(users.clerkId, id));
    // console.log(`Deleted user with ID: ${id}`);
  } catch (error) {
    console.error(`Error handling deletion for user: ${id}`, error);
    throw error;
  }
}

/**
 * Handle user activity events (sign in, sign out)
 */
export async function handleUserActivity(data: WebhookUserData) {
  const { id } = data;

  try {
    // Update user's last activity timestamp
    await db
      .update(users)
      .set({
        updatedAt: new Date(), // Using updatedAt as activity tracker
      })
      .where(eq(users.clerkId, id));

    console.log(`Updated activity for user: ${id}`);
  } catch (error) {
    console.error(`Error handling activity for user: ${id}`, error);
    throw error;
  }
}
