import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { therapists, users, bookingSessions, clientNotes } from '@/src/db/schema';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_API_KEY) {
  throw new Error('CLERK_SECRET_KEY is required');
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

async function seedTherapistDashboard() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('This script should only be run in development mode!');
  }
  // --- 1. Create/find Seth Morton as therapist ---
  const therapistEmail = 'sethmorton05@gmail.com';
  const therapistName = 'Seth Morton';
  let therapistClerkId: string;

  // Remove any existing therapist/user with this email
  await db.delete(therapists).where(eq(therapists.email, therapistEmail));
  await db.delete(users).where(eq(users.email, therapistEmail));

  // Clerk user for therapist
  const existingClerkUser = await getClerkUserByEmail(therapistEmail);
  if (existingClerkUser) {
    therapistClerkId = existingClerkUser.id;
    console.log(`Found existing Clerk user for ${therapistEmail}`);
  } else {
    therapistClerkId = await createClerkUser(therapistEmail, therapistName);
    console.log(`Created new Clerk user for ${therapistEmail}`);
  }
  // Insert user row for therapist
  const now = createDate();
  await db
    .insert(users)
    .values({
      clerkId: therapistClerkId,
      email: therapistEmail,
      firstName: 'Seth',
      lastName: 'Morton',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  // Insert therapist row
  const insertedTherapistRows = await db
    .insert(therapists)
    .values({
      userId: therapistClerkId,
      name: therapistName,
      email: therapistEmail,
      title: 'Founder & Financial Therapist',
      bookingURL: 'https://calendly.com/sethmorton',
      expertise: 'Platform Development, Financial Technology, Startup Finances',
      certifications: 'Renavest Platform Development, Financial Coaching',
      song: 'Code & Chill',
      yoe: 5,
      clientele: 'Tech Entrepreneurs, Startup Founders, Software Engineers',
      longBio:
        'Creator of Renavest, focusing on building innovative financial therapy solutions and supporting tech entrepreneurs.',
      previewBlurb: 'Tech Founder & Financial Therapist',
      profileUrl: '',
      hourlyRate: '250.00',
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  const therapistRow = insertedTherapistRows[0];
  if (!therapistRow) {
    throw new Error('Failed to insert therapist row for Seth Morton');
  }

  // --- 2. Find or create client user (seth@renavestapp.com) ---
  const clientEmail = 'seth@renavestapp.com';
  let clientUserRow = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, clientEmail),
  });
  let clientClerkId: string;
  if (!clientUserRow) {
    // Find Clerk user for client
    const clientClerkUser = await getClerkUserByEmail(clientEmail);
    if (!clientClerkUser) {
      throw new Error(`No Clerk user found for client email: ${clientEmail}`);
    }
    clientClerkId = clientClerkUser.id;
    // Create user row for client
    [clientUserRow] = await db
      .insert(users)
      .values({
        clerkId: clientClerkId,
        email: clientEmail,
        firstName: 'Seth',
        lastName: '',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    console.log(`Created user row for client ${clientEmail}`);
  } else {
    clientClerkId = clientUserRow.clerkId;
    console.log(`Found user row for client ${clientEmail}`);
  }

  // --- 3. Link client to therapist ---
  await db.update(users).set({ therapistId: therapistRow.id }).where(eq(users.email, clientEmail));
  console.log(`Linked client ${clientEmail} to therapist Seth Morton`);

  // --- 4. Create two booking sessions ---
  const bookingSessionsData = [
    {
      userId: clientClerkId,
      therapistId: therapistRow.id,
      sessionDate: createDate('2025-04-09T10:00:00Z'),
      sessionStartTime: createDate('2025-04-09T10:00:00Z'),
      sessionEndTime: createDate('2025-04-09T11:00:00Z'),
      status: 'scheduled' as const,
      metadata: {
        topic: 'Startup Financial Strategy',
        notes: 'Initial consultation for financial planning',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: clientClerkId,
      therapistId: therapistRow.id,
      sessionDate: createDate('2025-05-15T14:30:00Z'),
      sessionStartTime: createDate('2025-05-15T14:30:00Z'),
      sessionEndTime: createDate('2025-05-15T15:30:00Z'),
      status: 'completed' as const,
      metadata: {
        topic: 'Investment Portfolio Review',
        notes: 'Discussed long-term investment strategies',
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
  const insertedBookingSessions = await db
    .insert(bookingSessions)
    .values(bookingSessionsData)
    .onConflictDoNothing()
    .returning();

  // --- 5. Create two client notes ---
  const clientNotesData = insertedBookingSessions.map((session, index) => ({
    userId: clientClerkId,
    therapistId: therapistRow.id,
    sessionId: session.id,
    title: `Session Notes ${index + 1}`,
    content: {
      keyObservations: [
        'Discussed current financial challenges',
        'Identified potential investment opportunities',
      ],
      progressNotes: [
        'Client shows strong motivation for financial growth',
        'Needs help with long-term financial planning',
      ],
      actionItems: [
        'Create a 6-month financial roadmap',
        'Review and optimize current investment portfolio',
      ],
      emotionalState: index === 0 ? 'Anxious but hopeful' : 'Confident and motivated',
      additionalContext: 'Follow-up session recommended',
    },
    isConfidential: true,
    createdAt: now,
    updatedAt: now,
  }));
  await db.insert(clientNotes).values(clientNotesData).onConflictDoNothing();

  console.log('✅ Successfully seeded Seth Morton therapist dashboard with test data');
  console.log('🔍 Details:');
  console.log('   - Therapist: Seth Morton (sethmorton05@gmail.com)');
  console.log('   - Client User Email: seth@renavestapp.com');
  console.log(`   - Booking Sessions: ${insertedBookingSessions.length}`);
  console.log(`   - Client Notes: ${clientNotesData.length}`);
}

// Run the script
seedTherapistDashboard().catch(console.error);

export { seedTherapistDashboard };
