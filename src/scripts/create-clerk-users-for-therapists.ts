import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { therapists, users } from '../db/schema';
import TherapistList from '../old_config/therapistsList';
import { generateTherapistImageKey } from '../services/s3/assetUrls';

const envFile = '.env.local';
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
      password: Math.random().toString(36).slice(-12),
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create Clerk user: ${JSON.stringify(error)}`);
  }
  const data = await response.json();
  return data.id;
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
  const data = await response.json();
  return data.length > 0 ? data[0] : null;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('This script should only be run in development mode!');
  }
  let created = 0;
  let skipped = 0;
  let errors = 0;
  for (const therapist of TherapistList) {
    if (!therapist.email) {
      console.log(`Skipping therapist ${therapist.name} - no email`);
      skipped++;
      continue;
    }
    try {
      // Remove any existing user/therapist with this email
      if (typeof therapist.email === 'string') {
        const existingTherapist = await db.query.therapists.findFirst({
          where: (t, { eq }) => eq(t.email, therapist.email!),
        });
        if (existingTherapist) {
          await db.delete(therapists).where(eq(therapists.email, therapist.email!));
          console.log(`Deleted existing therapist for ${therapist.email}`);
        }
        const existingUser = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.email, therapist.email!),
        });
        if (existingUser) {
          await db.delete(users).where(eq(users.email, therapist.email!));
          console.log(`Deleted existing user for ${therapist.email}`);
        }
      }
      // Check if Clerk user exists
      let clerkId: string;
      const existingClerkUser = await getClerkUserByEmail(therapist.email);
      if (existingClerkUser) {
        clerkId = existingClerkUser.id;
        console.log(`Found existing Clerk user for ${therapist.email}`);
      } else {
        clerkId = await createClerkUser(therapist.email, therapist.name);
        console.log(`Created new Clerk user for ${therapist.email}`);
      }
      // Insert user row
      const now = createDate();
      await db.insert(users).values({
        clerkId,
        email: therapist.email,
        firstName: therapist.name.split(' ')[0],
        lastName: therapist.name.split(' ').slice(1).join(' '),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      // Insert therapist row
      await db.insert(therapists).values({
        userId: clerkId,
        name: therapist.name,
        email: therapist.email,
        title: therapist.title,
        bookingURL: therapist.bookingURL,
        expertise: therapist.expertise,
        certifications: therapist.certifications,
        song: therapist.song,
        yoe: parseInt(therapist.yoe) || null,
        clientele: therapist.clientele,
        longBio: therapist.longBio,
        previewBlurb: therapist.previewBlurb,
        profileUrl: generateTherapistImageKey(therapist.name),
        hourlyRate: therapist.hourlyRate ? therapist.hourlyRate.toString() : null,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`Created dev user and therapist for ${therapist.name} (${therapist.email})`);
      created++;
    } catch (error) {
      console.error(`Error processing ${therapist.name}:`, error);
      errors++;
    }
  }
  console.log('---');
  console.log(`Done. Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
}

main();
