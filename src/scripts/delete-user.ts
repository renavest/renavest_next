// src/scripts/delete-user-enhanced.ts

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
  sponsoredGroupMembers,
  therapistDocuments,
  therapistDocumentAssignments,
  stripeCustomers,
  employerSubsidies,
  therapistPayouts,
  sessionPayments,
  therapistChatPreferences,
  chatChannels,
  chatMessages,
  pendingTherapists,
} from '@/src/db/schema';

// Load environment variables
dotenv.config({ path: '.env.production' });

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_API_KEY) {
  console.error('❌ CLERK_SECRET_KEY environment variable is not set.');
  process.exit(1);
}

/**
 * Safely delete from a table with logging
 */
async function safeDelete(table: any, condition: any, description: string): Promise<number> {
  try {
    console.log(`🗑️ Deleting ${description}...`);
    const result = await db.delete(table).where(condition);
    const count = result.rowCount || 0;
    if (count > 0) {
      console.log(`✅ Successfully deleted ${count} ${description}.`);
    } else {
      console.log(`ℹ️ No ${description} found.`);
    }
    return count;
  } catch (error) {
    console.error(`❌ Error deleting ${description}:`, error);
    return 0;
  }
}

/**
 * Get Clerk user by email
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
    console.error(`Failed to fetch Clerk user by email: ${email}`);
    return null;
  }
  const data = (await response.json()) as { length: number; [key: number]: { id: string } };
  return data.length > 0 ? data[0] : null;
}

/**
 * Delete user from Clerk
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
 * Comprehensive user deletion from all tables
 */
async function deleteUser(email: string): Promise<void> {
  console.log(`🚀 Initiating comprehensive deletion process for user: ${email}`);

  // Step 1: Handle Clerk deletion
  let clerkUser = null;
  try {
    clerkUser = await getClerkUserByEmail(email);
    if (clerkUser) {
      console.log(`🗑️ Deleting user ${email} (Clerk ID: ${clerkUser.id}) from Clerk...`);
      await deleteClerkUser(clerkUser.id);
      console.log(`✅ Successfully deleted user ${email} from Clerk.`);
    } else {
      console.warn(`❓ User ${email} not found in Clerk.`);
    }
  } catch (error) {
    console.error(`❌ Error deleting user ${email} from Clerk:`, error);
    throw error;
  }

  // Step 2: Get internal user and therapist IDs
  const userRecord = await db
    .select({ id: users.id, clerkId: users.clerkId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((records) => records[0]);

  const internalUserId = userRecord?.id;
  // if (!internalUserId) {
  //   console.warn(`⚠️ User ${email} not found in local database. Cleaning up pending data only.`);
  //   await safeDelete(
  //     pendingTherapists,
  //     eq(pendingTherapists.clerkEmail, email),
  //     'pending therapist records by email',
  //   );
  //   console.log(`🎉 Deletion process for ${email} completed (no local user found).`);
  //   return;
  // }

  const therapistRecord = await db
    .select({ id: therapists.id })
    .from(therapists)
    .where(eq(therapists.userId, internalUserId))
    .limit(1)
    .then((records) => records[0]);

  const therapistId = therapistRecord?.id;

  // Step 3: Delete all user-related data
  console.log(
    `📊 Deleting all data for user ID ${internalUserId}${therapistId ? ` (therapist ID ${therapistId})` : ''}...`,
  );

  // Delete related data in parallel for efficiency
  await Promise.all([
    // User-specific deletions
    safeDelete(
      sponsoredGroupMembers,
      eq(sponsoredGroupMembers.userId, internalUserId),
      'sponsored group memberships',
    ),
    safeDelete(
      therapistDocumentAssignments,
      eq(therapistDocumentAssignments.userId, internalUserId),
      'document assignments',
    ),
    safeDelete(chatMessages, eq(chatMessages.senderId, internalUserId), 'chat messages'),
    safeDelete(
      chatChannels,
      eq(chatChannels.prospectUserId, internalUserId),
      'chat channels as prospect',
    ),
    safeDelete(sessionPayments, eq(sessionPayments.userId, internalUserId), 'session payments'),
    safeDelete(
      stripeCustomers,
      eq(stripeCustomers.userId, internalUserId),
      'Stripe customer records',
    ),
    safeDelete(
      employerSubsidies,
      eq(employerSubsidies.userId, internalUserId),
      'employer subsidies',
    ),
    safeDelete(
      bookingSessions,
      eq(bookingSessions.userId, internalUserId),
      'booking sessions as client',
    ),
    safeDelete(clientNotes, eq(clientNotes.userId, internalUserId), 'client notes as client'),
    safeDelete(
      userOnboarding,
      eq(userOnboarding.userId, internalUserId),
      'user onboarding records',
    ),
    safeDelete(
      pendingTherapists,
      eq(pendingTherapists.clerkEmail, email),
      'pending therapist records',
    ),
  ]);

  // Step 4: Delete therapist-specific data if user is a therapist
  if (therapistId) {
    console.log(`👩‍⚕️ Deleting therapist-specific data for therapist ID ${therapistId}...`);
    await Promise.all([
      safeDelete(
        therapistChatPreferences,
        eq(therapistChatPreferences.therapistId, therapistId),
        'therapist chat preferences',
      ),
      safeDelete(
        therapistPayouts,
        eq(therapistPayouts.therapistId, therapistId),
        'therapist payouts',
      ),
      safeDelete(
        therapistDocuments,
        eq(therapistDocuments.therapistId, therapistId),
        'therapist documents',
      ),
      safeDelete(
        bookingSessions,
        eq(bookingSessions.therapistId, therapistId),
        'booking sessions as therapist',
      ),
      safeDelete(
        clientNotes,
        eq(clientNotes.therapistId, therapistId),
        'client notes as therapist',
      ),
      safeDelete(
        therapistAvailability,
        eq(therapistAvailability.therapistId, therapistId),
        'therapist availability',
      ),
      safeDelete(
        therapistBlockedTimes,
        eq(therapistBlockedTimes.therapistId, therapistId),
        'therapist blocked times',
      ),
    ]);

    // Delete therapist profile
    await safeDelete(therapists, eq(therapists.userId, internalUserId), 'therapist profile');
  }

  // Step 5: Finally delete the user record
  await safeDelete(users, eq(users.email, email), 'user profile');

  console.log(`🎉 Comprehensive deletion process for ${email} completed successfully!`);
}

// Script execution
async function run() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: tsx ./delete-user-enhanced.ts <email>');
    console.error('Example: tsx ./delete-user-enhanced.ts john.doe@example.com');
    process.exit(1);
  }

  const email = args[0];
  try {
    await deleteUser(email);
    process.exit(0);
  } catch (error) {
    console.error('🚫 An error occurred during user deletion:', error);
    process.exit(1);
  }
}

run();
export { deleteUser };
