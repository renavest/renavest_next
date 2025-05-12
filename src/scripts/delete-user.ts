// src/scripts/convert-user-to-therapist.ts

import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';

// Validate Clerk Secret Key
const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_API_KEY) {
  console.error(
    '❌ CLERK_SECRET_KEY environment variable is not set. This is required to interact with the Clerk API.',
  );
  process.exit(1);
}

async function deleteUser(email: string) {
  const deleteUserResult = await db.delete(users).where(eq(users.email, email));
  console.log(
    `✅ Successfully deleted ${deleteUserResult.rowCount} record(s) for ${email} from 'users' table.`,
  );
  const clerkUser = await getClerkUserByEmail(email);
  const deleteClerkUserResult = await deleteClerkUser(clerkUser.id);
  console.log(
    `✅ Successfully deleted ${deleteClerkUserResult} record(s) for ${email} from 'clerk' table.`,
  );
}

async function run() {
  await deleteUser('smphotography39@gmail.com');
}

run();

async function getClerkUserByEmail(email: string) {
  const response = await fetch(`https://api.clerk.com/v1/users?email_address=${email}`, {
    headers: {
      Authorization: `Bearer ${CLERK_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to get Clerk user: ${response.statusText}`);
  }
  const data = await response.json();
  return data[0];
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
