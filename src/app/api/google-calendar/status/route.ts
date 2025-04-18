import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export async function GET() {
  try {
    const { userId } = await auth();

    let therapist;

    if (userId) {
      // First try to find by Clerk userId
      therapist = await db.query.therapists.findFirst({
        where: (therapists, { eq }) => eq(therapists.userId, userId),
        columns: {
          id: true,
          email: true,
          googleCalendarEmail: true,
          googleCalendarIntegrationStatus: true,
        },
      });
    }

    if (!therapist) {
      // If no therapist found by userId, try to find by email from Clerk session
      const { emailAddresses } = await auth().getUser(userId);
      const userEmail = emailAddresses[0]?.emailAddress;

      if (userEmail) {
        therapist = await db.query.therapists.findFirst({
          where: (therapists, { eq }) => eq(therapists.email, userEmail),
          columns: {
            id: true,
            email: true,
            googleCalendarEmail: true,
            googleCalendarIntegrationStatus: true,
          },
        });
      }
    }

    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      therapistId: therapist.id,
      email: therapist.email,
      isConnected: therapist.googleCalendarIntegrationStatus === 'connected',
      calendarEmail: therapist.googleCalendarEmail || null,
    });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check calendar status' },
      { status: 500 },
    );
  }
}
