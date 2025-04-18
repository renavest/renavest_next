import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { therapists } from '../db/schema';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });
const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_API_KEY) {
  throw new Error('CLERK_SECRET_KEY is required');
}

async function createClerkUser(email: string, name: string) {
  const response = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLERK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [email],
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
      password: Math.random().toString(36).slice(-12), // Random password, they'll need to reset
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create Clerk user: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.id; // This is the Clerk user ID
}

// Add this function to fetch Clerk user by email
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
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

async function main() {
  try {
    // Get all therapists without a userId
    const therapistsWithoutUsers = await db.query.therapists.findMany({
      where: (therapists, { isNull }) => isNull(therapists.userId),
      columns: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`Found ${therapistsWithoutUsers.length} therapists without Clerk users`);

    for (const therapist of therapistsWithoutUsers) {
      if (!therapist.email) {
        console.log(`Skipping therapist ${therapist.id} - no email address`);
        continue;
      }

      try {
        // Check if Clerk user exists
        const existingClerkUser = await getClerkUserByEmail(therapist.email);

        if (existingClerkUser) {
          // If userId is missing or different, update it
          if (therapist.userId !== existingClerkUser.id) {
            await db
              .update(therapists)
              .set({
                userId: existingClerkUser.id,
                updatedAt: new Date(),
              })
              .where(eq(therapists.id, therapist.id));
            console.log(`Updated therapist ${therapist.name} with existing Clerk user ID`);
          } else {
            console.log(`Therapist ${therapist.name} already has correct Clerk user ID`);
          }
        } else {
          // Create new Clerk user if none exists
          console.log(`Creating Clerk user for therapist ${therapist.name} (${therapist.email})`);
          const clerkUserId = await createClerkUser(therapist.email, therapist.name);

          await db
            .update(therapists)
            .set({
              userId: clerkUserId,
              updatedAt: new Date(),
            })
            .where(eq(therapists.id, therapist.id));

          console.log(`Successfully created Clerk user for therapist ${therapist.name}`);
        }
      } catch (error) {
        console.error(`Failed to process therapist ${therapist.name}:`, error);
      }
    }

    console.log('Finished creating Clerk users for therapists');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
