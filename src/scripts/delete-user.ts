// src/scripts/delete-user.ts

import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

import { db } from '@/src/db';
import { users, therapists, bookingSessions, clientNotes, userOnboarding } from '@/src/db/schema'; // Added userOnboarding and clientNotes

// Load environment variables
// const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: '.env.production' });

// Validate Clerk Secret Key
const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_API_KEY) {
  console.error(
    '❌ CLERK_SECRET_KEY environment variable is not set. This is required to interact with the Clerk API.',
  );
  process.exit(1);
}

/**
 * Fetches a user from Clerk by email.
 * @param email The email of the user to find in Clerk.
 * @returns The Clerk user object if found, otherwise null.
 */
async function getClerkUserByEmail(email: string) {
  const response = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response.ok) {
    console.error(`Failed to fetch Clerk user by email: ${email}`, await response.text());
    return null;
  }
  const data = (await response.json()) as { length: number; [key: number]: { id: string } };
  return data.length > 0 ? data[0] : null;
}

/**
 * Deletes a user from Clerk by their Clerk user ID.
 * @param userId The Clerk ID of the user to delete.
 * @returns True if deletion was successful, otherwise throws an error.
 */
async function deleteClerkUser(userId: string) {
  const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${CLERK_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Clerk user: ${error}`);
  }
  return true;
}

/**
 * Deletes a user and all their associated data from Clerk and the local database.
 * This includes:
 * 1. Deleting the user from Clerk.
 * 2. Deleting any booking sessions associated with the user's internal database ID.
 * 3. Deleting any client notes associated with the user's internal database ID.
 * 4. Deleting any user onboarding records associated with the user's internal database ID.
 * 5. Deleting the user from the local 'users' table.
 * 6. Deleting the user from the local 'therapists' table (if they exist there).
 *
 * @param email The email of the user to delete.
 */
async function deleteUser(email: string): Promise<void> {
  console.log(`🚀 Initiating deletion process for user: ${email}`);

  // Step 1: Handle Clerk operations FIRST
  let clerkUser = null;
  try {
    clerkUser = await getClerkUserByEmail(email);
    if (clerkUser) {
      console.log(
        `🗑️ Attempting to delete user ${email} (Clerk ID: ${clerkUser.id}) from Clerk...`,
      );
      await deleteClerkUser(clerkUser.id);
      console.log(`✅ Successfully deleted user ${email} from Clerk.`);
    } else {
      console.warn(
        `❓ User ${email} not found in Clerk. They might have been deleted already or never existed.`,
      );
    }
  } catch (error) {
    console.error(`❌ Error deleting user ${email} from Clerk:`, error);
    throw error; // Re-throw to stop script if Clerk deletion fails critically
  }

  // Get the internal userId from the local 'users' table using email
  const userRecord = await db
    .select({ id: users.id, clerkId: users.clerkId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((records) => records[0]);

  const internalUserId = userRecord?.id;

  if (!internalUserId) {
    console.warn(
      `⚠️ User ${email} not found in local 'users' table. Skipping database cleanup for related records.`,
    );
    // We can still proceed to delete from 'therapists' and 'users' (again) in case of partial deletion
  } else {
    // Step 2: Delete booking sessions associated with the user's internal userId
    try {
      console.log(`🗑️ Deleting booking sessions for user (internal ID: ${internalUserId})...`);
      const deleteBookingResult = await db
        .delete(bookingSessions)
        .where(eq(bookingSessions.userId, internalUserId));

      if (deleteBookingResult.rowCount !== null && deleteBookingResult.rowCount > 0) {
        console.log(
          `✅ Successfully deleted ${deleteBookingResult.rowCount} booking session(s) for user with internal ID ${internalUserId}.`,
        );
      } else {
        console.log(`ℹ️ No booking sessions found for user with internal ID ${internalUserId}.`);
      }
    } catch (error) {
      console.error(
        `❌ Error deleting booking sessions for user with internal ID ${internalUserId}:`,
        error,
      );
      // Don't re-throw, try to clean up other remnants
    }

    // Step 3: Delete client notes associated with the user's internal userId
    try {
      console.log(`🗑️ Deleting client notes for user (internal ID: ${internalUserId})...`);
      const deleteClientNotesResult = await db
        .delete(clientNotes)
        .where(eq(clientNotes.userId, internalUserId));

      if (deleteClientNotesResult.rowCount !== null && deleteClientNotesResult.rowCount > 0) {
        console.log(
          `✅ Successfully deleted ${deleteClientNotesResult.rowCount} client note(s) for user with internal ID ${internalUserId}.`,
        );
      } else {
        console.log(`ℹ️ No client notes found for user with internal ID ${internalUserId}.`);
      }
    } catch (error) {
      console.error(
        `❌ Error deleting client notes for user with internal ID ${internalUserId}:`,
        error,
      );
      // Don't re-throw
    }

    // Step 4: Delete user onboarding records associated with the user's internal userId
    try {
      console.log(
        `🗑️ Deleting user onboarding records for user (internal ID: ${internalUserId})...`,
      );
      const deleteOnboardingResult = await db
        .delete(userOnboarding)
        .where(eq(userOnboarding.userId, internalUserId));

      if (deleteOnboardingResult.rowCount !== null && deleteOnboardingResult.rowCount > 0) {
        console.log(
          `✅ Successfully deleted ${deleteOnboardingResult.rowCount} onboarding record(s) for user with internal ID ${internalUserId}.`,
        );
      } else {
        console.log(`ℹ️ No onboarding records found for user with internal ID ${internalUserId}.`);
      }
    } catch (error) {
      console.error(
        `❌ Error deleting user onboarding records for user with internal ID ${internalUserId}:`,
        error,
      );
      // Don't re-throw
    }
  }

  // Step 5: Delete user from local 'users' table
  try {
    console.log(`🗑️ Deleting user ${email} from local 'users' table...`);
    const deleteUserResult = await db.delete(users).where(eq(users.email, email));
    if (deleteUserResult.rowCount !== null && deleteUserResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deleteUserResult.rowCount} record(s) for ${email} from 'users' table.`,
      );
    } else {
      console.warn(
        `❓ User ${email} was not found in 'users' table for deletion (perhaps already deleted).`,
      );
    }
  } catch (error) {
    console.error(`❌ Error deleting user ${email} from 'users' table:`, error);
    // Don't re-throw, try to clean up therapists table
  }

  // Step 6: Delete user from local 'therapists' table (if they exist there)
  try {
    console.log(
      `🗑️ Deleting user ${email} from local 'therapists' table (if they are a therapist)...`,
    );
    let deleteTherapistResult;
    if (internalUserId) {
      deleteTherapistResult = await db
        .delete(therapists)
        .where(eq(therapists.userId, internalUserId));
    } else {
      deleteTherapistResult = { rowCount: null };
      console.warn(`⚠️ Skipping therapist deletion: no internal user ID found for ${email}.`);
    }

    if (deleteTherapistResult.rowCount !== null && deleteTherapistResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deleteTherapistResult.rowCount} therapist record(s) for ${email}.`,
      );
    } else {
      console.log(`ℹ️ No existing therapist record found for ${email}.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting therapist record for ${email}:`, error);
    throw error; // Re-throw if therapist deletion fails, as it might be a critical data integrity issue
  }

  console.log(`🎉 Deletion process for ${email} completed successfully!`);
}

// --- Script Execution ---
async function run() {
  const args = process.argv.slice(2); // Skip 'node' and script path

  if (args.length < 1) {
    console.error('Usage: tsx ./src/scripts/delete-user.ts <email>');
    console.error('Example: tsx ./src/scripts/delete-user.ts john.doe@example.com');
    process.exit(1);
  }

  const email = args[0];

  try {
    await deleteUser(email);
    process.exit(0); // Success
  } catch (error) {
    console.error('🚫 An error occurred during user deletion:', error);
    process.exit(1);
  }
}

// Execute the run function
run();

export { deleteUser };
