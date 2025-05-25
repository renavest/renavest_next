// src/scripts/delete-user.ts

import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

import { db } from '@/src/db';
import {
  users,
  therapists,
  bookingSessions,
  clientNotes,
  userOnboarding,
  therapistAvailability,
  therapistBlockedTimes,
  pendingTherapists,
} from '@/src/db/schema';

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
 * Deletes pending therapist records with matching email
 */
async function deletePendingTherapistRecords(email: string) {
  try {
    console.log(`🗑️ Deleting pending therapist records for email: ${email}...`);
    const deletePendingResult = await db
      .delete(pendingTherapists)
      .where(eq(pendingTherapists.clerkEmail, email));

    if (deletePendingResult.rowCount !== null && deletePendingResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deletePendingResult.rowCount} pending therapist record(s) for ${email}.`,
      );
    } else {
      console.log(`ℹ️ No pending therapist records found for ${email}.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting pending therapist records for ${email}:`, error);
    // Don't re-throw, continue with other deletions
  }
}

/**
 * Deletes client notes and booking sessions for a user
 */
async function deleteUserClientData(internalUserId: number, therapistId?: number) {
  // Delete client notes where user is the client
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
  }

  // Delete client notes where user is the therapist (if they are a therapist)
  if (therapistId) {
    try {
      console.log(`🗑️ Deleting client notes written by therapist (ID: ${therapistId})...`);
      const deleteTherapistNotesResult = await db
        .delete(clientNotes)
        .where(eq(clientNotes.therapistId, therapistId));

      if (deleteTherapistNotesResult.rowCount !== null && deleteTherapistNotesResult.rowCount > 0) {
        console.log(
          `✅ Successfully deleted ${deleteTherapistNotesResult.rowCount} client note(s) written by therapist ID ${therapistId}.`,
        );
      } else {
        console.log(`ℹ️ No client notes found written by therapist ID ${therapistId}.`);
      }
    } catch (error) {
      console.error(
        `❌ Error deleting client notes written by therapist ID ${therapistId}:`,
        error,
      );
    }
  }

  // Delete booking sessions where user is the client
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
  }

  // Delete booking sessions where user is the therapist (if they are a therapist)
  if (therapistId) {
    try {
      console.log(`🗑️ Deleting booking sessions for therapist (ID: ${therapistId})...`);
      const deleteTherapistSessionsResult = await db
        .delete(bookingSessions)
        .where(eq(bookingSessions.therapistId, therapistId));

      if (
        deleteTherapistSessionsResult.rowCount !== null &&
        deleteTherapistSessionsResult.rowCount > 0
      ) {
        console.log(
          `✅ Successfully deleted ${deleteTherapistSessionsResult.rowCount} booking session(s) for therapist ID ${therapistId}.`,
        );
      } else {
        console.log(`ℹ️ No booking sessions found for therapist ID ${therapistId}.`);
      }
    } catch (error) {
      console.error(`❌ Error deleting booking sessions for therapist ID ${therapistId}:`, error);
    }
  }
}

/**
 * Deletes therapist-specific data (availability, blocked times)
 */
async function deleteTherapistData(therapistId: number) {
  // Delete therapist availability records
  try {
    console.log(`🗑️ Deleting therapist availability for therapist (ID: ${therapistId})...`);
    const deleteAvailabilityResult = await db
      .delete(therapistAvailability)
      .where(eq(therapistAvailability.therapistId, therapistId));

    if (deleteAvailabilityResult.rowCount !== null && deleteAvailabilityResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deleteAvailabilityResult.rowCount} availability record(s) for therapist ID ${therapistId}.`,
      );
    } else {
      console.log(`ℹ️ No availability records found for therapist ID ${therapistId}.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting availability records for therapist ID ${therapistId}:`, error);
  }

  // Delete therapist blocked times
  try {
    console.log(`🗑️ Deleting therapist blocked times for therapist (ID: ${therapistId})...`);
    const deleteBlockedTimesResult = await db
      .delete(therapistBlockedTimes)
      .where(eq(therapistBlockedTimes.therapistId, therapistId));

    if (deleteBlockedTimesResult.rowCount !== null && deleteBlockedTimesResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deleteBlockedTimesResult.rowCount} blocked time record(s) for therapist ID ${therapistId}.`,
      );
    } else {
      console.log(`ℹ️ No blocked time records found for therapist ID ${therapistId}.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting blocked time records for therapist ID ${therapistId}:`, error);
  }
}

/**
 * Deletes user onboarding records and core user/therapist profiles
 */
async function deleteUserProfiles(email: string, internalUserId: number, therapistId?: number) {
  // Delete user onboarding records
  try {
    console.log(`🗑️ Deleting user onboarding records for user (internal ID: ${internalUserId})...`);
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
  }

  // Delete therapist profile (if user is a therapist)
  if (therapistId) {
    try {
      console.log(
        `🗑️ Deleting therapist profile for user ${email} (therapist ID: ${therapistId})...`,
      );
      const deleteTherapistResult = await db
        .delete(therapists)
        .where(eq(therapists.userId, internalUserId));

      if (deleteTherapistResult.rowCount !== null && deleteTherapistResult.rowCount > 0) {
        console.log(
          `✅ Successfully deleted ${deleteTherapistResult.rowCount} therapist record(s) for ${email}.`,
        );
      } else {
        console.log(`ℹ️ No therapist record found for ${email}.`);
      }
    } catch (error) {
      console.error(`❌ Error deleting therapist record for ${email}:`, error);
      throw error; // Re-throw if therapist deletion fails, as it might be a critical data integrity issue
    }
  }

  // Delete user from local 'users' table
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
    throw error; // Re-throw as this is a critical operation
  }
}

/**
 * Deletes a user and all their associated data from Clerk and the local database.
 * This includes:
 * 1. Deleting the user from Clerk.
 * 2. Deleting any pending therapist records with matching email.
 * 3. Deleting any client notes where the user is the client.
 * 4. Deleting any client notes where the user is the therapist (via therapist relationship).
 * 5. Deleting any booking sessions where the user is the client.
 * 6. Deleting any booking sessions where the user is the therapist (via therapist relationship).
 * 7. Deleting any therapist availability records (if user is a therapist).
 * 8. Deleting any therapist blocked times (if user is a therapist).
 * 9. Deleting any user onboarding records.
 * 10. Deleting the therapist profile (if user is a therapist).
 * 11. Deleting the user from the local 'users' table.
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

  // Get the internal userId and therapistId from the local database
  const userRecord = await db
    .select({ id: users.id, clerkId: users.clerkId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((records) => records[0]);

  const internalUserId = userRecord?.id;

  // Get therapist record if user is a therapist
  let therapistRecord = null;
  if (internalUserId) {
    therapistRecord = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, internalUserId))
      .limit(1)
      .then((records) => records[0]);
  }

  const therapistId = therapistRecord?.id;

  if (!internalUserId) {
    console.warn(
      `⚠️ User ${email} not found in local 'users' table. Skipping database cleanup for related records.`,
    );
  }

  // Step 2: Delete pending therapist records with matching email
  await deletePendingTherapistRecords(email);

  if (!internalUserId) {
    console.log(`🎉 Deletion process for ${email} completed (user not found in local database).`);
    return;
  }

  // Steps 3-6: Delete client notes and booking sessions
  await deleteUserClientData(internalUserId, therapistId);

  // Steps 7-8: Delete therapist-specific data (if user is a therapist)
  if (therapistId) {
    await deleteTherapistData(therapistId);
  }

  // Steps 9-11: Delete user onboarding and core profiles
  await deleteUserProfiles(email, internalUserId, therapistId);

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
