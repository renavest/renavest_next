// src/scripts/convert-user-to-therapist.ts

import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

import { db } from '@/src/db';
import { users, therapists, bookingSessions } from '@/src/db/schema';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

// Validate Clerk Secret Key
const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_API_KEY) {
  console.error(
    '❌ CLERK_SECRET_KEY environment variable is not set. This is required to interact with the Clerk API.',
  );
  process.exit(1);
}

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
  if (!response.ok) return null;
  const data = (await response.json()) as { length: number; [key: number]: { id: string } };
  return data.length > 0 ? data[0] : null;
}

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
 * Converts a user to a therapist by email:
 * 1. Fetches user details from the local 'users' table.
 * 2. Deletes the user from Clerk.
 * 3. Deletes booking sessions associated with the user.
 * 4. Deletes the user from the local 'users' table.
 * 5. Creates a new record in the 'therapists' table.
 *
 * @param email The email of the user to convert.
 * @param therapistDetails Additional details for creating the therapist profile.
 */
async function convertUserToTherapist(
  email: string,
  therapistDetails: Partial<typeof therapists.$inferInsert> = {},
): Promise<void> {
  console.log(`🚀 Initiating conversion for user: ${email}`);

  // Step 1: Handle Clerk operations FIRST
  let clerkUser = null;
  try {
    clerkUser = await getClerkUserByEmail(email);
    if (clerkUser) {
      console.log(`🗑️ Attempting to delete user ${email} from Clerk...`);
      await deleteClerkUser(clerkUser.id);
      console.log(`✅ Successfully deleted user ${email} from Clerk.`);
    } else {
      console.warn(`❓ User ${email} not found in Clerk. They might have been deleted already.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting user ${email} from Clerk:`, error);
    throw error;
  }

  // Step 2: Delete existing therapist row if it exists
  try {
    console.log(`🗑️ Deleting existing therapist row for ${email}...`);
    const deleteTherapistResult = await db.delete(therapists).where(eq(therapists.email, email));

    if (deleteTherapistResult.rowCount !== null && deleteTherapistResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deleteTherapistResult.rowCount} therapist record(s) for ${email}.`,
      );
    } else {
      console.log(`ℹ️ No existing therapist record found for ${email}.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting therapist record for ${email}:`, error);
    throw error;
  }

  // Step 3: Fetch user data from local 'users' table
  const userRecord = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((records) => records[0]);

  // Determine name for the therapist
  const name =
    therapistDetails.name ||
    (userRecord ? `${userRecord.firstName} ${userRecord.lastName}`.trim() : email.split('@')[0]);

  // If no user record exists, log a warning but continue
  if (!userRecord) {
    console.warn(`⚠️ No user record found for ${email}. Using fallback name and details.`);
  }

  // Step 4: Delete booking sessions associated with the user
  if (userRecord) {
    try {
      console.log(
        `🗑️ Deleting booking sessions for user ${email} (clerk_id: ${userRecord.clerkId})...`,
      );
      const deleteBookingResult = await db
        .delete(bookingSessions)
        .where(eq(bookingSessions.userId, userRecord.clerkId));
      if (deleteBookingResult.rowCount !== null && deleteBookingResult.rowCount > 0) {
        console.log(
          `✅ Successfully deleted ${deleteBookingResult.rowCount} booking session(s) for ${email}.`,
        );
      } else {
        console.log(`ℹ️ No booking sessions found for user ${email}.`);
      }
    } catch (error) {
      console.error(`❌ Error deleting booking sessions for user ${email}:`, error);
      throw error;
    }
  } else {
    console.log(`ℹ️ Skipping booking sessions deletion - no user record found for ${email}.`);
  }

  // Step 5: Delete user from local 'users' table
  try {
    console.log(`🗑️ Deleting user ${email} from local 'users' table...`);
    const deleteResult = await db.delete(users).where(eq(users.email, email));
    if (deleteResult.rowCount !== null && deleteResult.rowCount > 0) {
      console.log(
        `✅ Successfully deleted ${deleteResult.rowCount} record(s) for ${email} from 'users' table.`,
      );
    } else {
      console.warn(
        `❓ User ${email} was not found in 'users' table for deletion during this step (perhaps already deleted).`,
      );
    }
  } catch (error) {
    console.error(`❌ Error deleting user ${email} from 'users' table:`, error);
    throw error;
  }

  // Step 6: Add user to 'therapists' table
  console.log(`➕ Creating therapist profile for: ${name} (Email: ${email})...`);
  console.log('Therapist Profile Data:', JSON.stringify(therapistDetails, null, 2));

  const therapistProfileData = {
    name: name,
    email: email,
    title: therapistDetails.title || 'Financial Therapist',
    bookingURL: therapistDetails.bookingURL || 'https://calendly.com/seth-morton/30min',
    expertise: therapistDetails.expertise || 'Financial Therapy',
    certifications: therapistDetails.certifications || 'CFA, CFP',
    song: therapistDetails.song || 'Free Spirit',
    yoe: therapistDetails.yoe || 7,
    clientele: therapistDetails.clientele || 'Individuals and couples',
    longBio:
      therapistDetails.longBio ||
      'Seth is a financial therapist with a passion for helping people navigate their finances.',
    previewBlurb:
      therapistDetails.previewBlurb ||
      'Seth is a financial therapist with a passion for helping people navigate their finances.',
    profileUrl: therapistDetails.profileUrl || 'https://d2qcuj7ucxw61o.cloudfront.net/seth.jpg',
    hourlyRate: therapistDetails.hourlyRate || '120',
    ...therapistDetails,
  };

  try {
    const insertedTherapists = await db.insert(therapists).values(therapistProfileData).returning();

    if (insertedTherapists.length > 0) {
      console.log(
        `✅ Successfully created therapist profile for ${name} (ID: ${insertedTherapists[0].id}).`,
      );
      console.log('Therapist details:', JSON.stringify(insertedTherapists[0], null, 2));
    } else {
      console.error('❌ Failed to create therapist profile. No records returned after insert.');
      console.error('Therapist Profile Data:', JSON.stringify(therapistProfileData, null, 2));
      throw new Error('Failed to insert therapist into database. No records returned.');
    }
  } catch (error) {
    console.error('❌ Error inserting therapist profile:', error);
    console.error(
      'Error occurred with Therapist Profile Data:',
      JSON.stringify(therapistProfileData, null, 2),
    );

    // Log any specific database-related error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);

      // If it's a Drizzle/database-specific error, log additional details
      if ('details' in error) {
        console.error(
          'Additional error details:',
          (error as Error & { details?: unknown }).details,
        );
      }
    }

    throw error;
  }

  console.log(`🎉 Conversion process for ${email} completed successfully!`);
}

// --- Script Execution ---
async function run() {
  const args = process.argv.slice(2); // Skip 'node' and script path

  if (args.length < 1) {
    console.error(
      'Usage: tsx ./src/scripts/convert-user-to-therapist.ts <email> [jsonTherapistData]',
    );
    console.error(
      'Example: tsx ./src/scripts/convert-user-to-therapist.ts seth@renavestapp.com \'{"title": "Senior Counselor", "hourlyRate": "120", "yoe": 7}\'',
    );
    process.exit(1);
  }

  const email = args[0];
  let therapistDetails = {};

  if (args[1]) {
    try {
      therapistDetails = JSON.parse(args[1]);
      console.log('📝 Parsed therapist details from command line:', therapistDetails);
    } catch (e) {
      console.error('❌ Invalid JSON provided for therapist data:', e);
      process.exit(1);
    }
  } else {
    console.log(
      'ℹ️ No additional therapist data provided via command line. Will rely on defaults.',
    );
  }

  await convertUserToTherapist(email, therapistDetails);
  process.exit(0); // Success
}

run().catch((error) => {
  console.error('🚫 Unhandled error in script execution:', error);
  process.exit(1);
});

export { convertUserToTherapist };
