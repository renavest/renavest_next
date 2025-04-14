import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

import { db } from '@/src/db';
import { therapists, users, bookingSessions, clientNotes } from '@/src/db/schema';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

async function seedTherapistDashboard() {
  try {
    // // Upsert therapist - insert or update based on email
    // const [insertedOrUpdatedTherapist] = await db
    //   .insert(therapists)
    //   .values({
    //     name: 'Seth Morton',
    //     title: 'Founder & Financial Therapist',
    //     expertise: 'Platform Development, Financial Technology, Startup Finances',
    //     longBio:
    //       'Creator of Renavest, focusing on building innovative financial therapy solutions and supporting tech entrepreneurs.',
    //     previewBlurb: 'Tech Founder & Financial Therapist',
    //     bookingURL: 'https://calendly.com/sethmorton', // Optional: replace with real booking link
    //     yoe: 5,
    //     clientele: 'Tech Entrepreneurs, Startup Founders, Software Engineers',
    //     hourlyRate: sql`250.00`, // Use sql template to explicitly handle numeric
    //     profileUrl: '', // Optional: add profile image URL
    //     certifications: 'Renavest Platform Development, Financial Coaching',
    //     song: 'Code & Chill', // Just for fun
    //     email: 'sethmorton05@gmail.com',
    //   })
    //   .onConflictDoUpdate({
    //     target: therapists.email,
    //     set: {
    //       name: 'Seth Morton',
    //       title: 'Founder & Financial Therapist',
    //       expertise: 'Platform Development, Financial Technology, Startup Finances',
    //       // Add other fields you want to update
    //     },
    //   })
    //   .returning();

    // Find the existing test user
    const [testUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'stanley@renavestapp.com'))
      .limit(1);
    const [insertedOrUpdatedTherapist] = await db
      .select()
      .from(therapists)
      .where(eq(therapists.email, 'sethmorton05@gmail.com'))
      .limit(1);
    if (!testUser) {
      throw new Error('Test user not found');
    }

    // Update the test user with the therapist ID
    await db
      .update(users)
      .set({ therapistId: insertedOrUpdatedTherapist.id })
      .where(eq(users.email, 'stanley@renavestapp.com'));

    // Upsert booking sessions
    const bookingSessionsData = [
      {
        userId: testUser.clerkId,
        therapistId: insertedOrUpdatedTherapist.id,
        sessionDate: new Date('2025-04-09T10:00:00Z'),
        sessionStartTime: new Date('2025-04-09T10:00:00Z'),
        status: 'scheduled' as const,
        metadata: {
          topic: 'Startup Financial Strategy',
          notes: 'Initial consultation for financial planning',
        },
      },
      {
        userId: testUser.clerkId,
        therapistId: insertedOrUpdatedTherapist.id,
        sessionDate: new Date('2025-05-15T14:30:00Z'),
        sessionStartTime: new Date('2025-05-15T14:30:00Z'),
        status: 'completed' as const,
        metadata: {
          topic: 'Investment Portfolio Review',
          notes: 'Discussed long-term investment strategies',
        },
      },
    ];

    const insertedBookingSessions = await db
      .insert(bookingSessions)
      .values(bookingSessionsData)
      .onConflictDoNothing() // Skip if already exists
      .returning();

    // Upsert client notes
    const clientNotesData = insertedBookingSessions.map((session, index) => ({
      userId: testUser.clerkId,
      therapistId: insertedOrUpdatedTherapist.id,
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
    }));

    await db.insert(clientNotes).values(clientNotesData).onConflictDoNothing(); // Skip if already exists

    console.log('✅ Successfully seeded/updated therapist dashboard with test data');
    console.log('🔍 Details:');
    console.log('   - Therapist added/updated: Seth Morton');
    console.log('   - Test User Email: stanley@renavestapp');
    console.log(`   - Booking Sessions: ${insertedBookingSessions.length}`);
    console.log(`   - Client Notes: ${clientNotesData.length}`);
  } catch (error) {
    console.error('❌ Error seeding therapist dashboard:', error);
    throw error;
  }
}

// Run the script
seedTherapistDashboard().catch(console.error);

export { seedTherapistDashboard };
