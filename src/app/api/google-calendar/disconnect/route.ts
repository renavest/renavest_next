import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  // Find therapist by userId
  const therapist = await db.query.therapists.findFirst({
    where: (therapists, { eq }) => eq(therapists.userId, parseInt(userId)),
  });
  if (!therapist) {
    return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
  }
  // Disconnect Google Calendar integration
  await db
    .update(therapists)
    .set({
      googleCalendarAccessToken: null,
      googleCalendarRefreshToken: null,
      googleCalendarEmail: null,
      googleCalendarIntegrationStatus: 'not_connected',
      googleCalendarIntegrationDate: null,
      updatedAt: new Date(),
    })
    .where(eq(therapists.id, therapist.id));
  return NextResponse.json({ success: true, message: 'Google Calendar integration disconnected' });
}
