import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  // Find the therapist associated with the user
  const therapist = await db.query.therapists.findFirst({
    where: (therapists, { eq }) => eq(therapists.userId, parseInt(userId)),
    columns: {
      googleCalendarEmail: true,
      googleCalendarIntegrationStatus: true,
    },
  });
  if (!therapist) {
    return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    isConnected: therapist.googleCalendarIntegrationStatus === 'connected',
    calendarEmail: therapist.googleCalendarEmail || null,
  });
}
