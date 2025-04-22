import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';

export async function GET(req: Request) {
  try {
    console.log('Google Calendar status check initiated');
    const user = await currentUser();
    const url = new URL(req.url);
    const therapistId = url.searchParams.get('therapistId');

    console.log('Request params:', {
      therapistId,
      hasUser: !!user,
    });

    if (!user) {
      console.log('No user found, returning 401');
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 });
    }

    if (!therapistId) {
      console.log('No therapist ID provided, returning 400');
      return NextResponse.json(
        { success: false, message: 'Missing therapist ID' },
        { status: 400 },
      );
    }

    // Find therapist by ID
    console.log('Finding therapist with ID:', therapistId);
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, parseInt(therapistId)),
      columns: {
        id: true,
        email: true,
        googleCalendarEmail: true,
        googleCalendarIntegrationStatus: true,
      },
    });

    console.log('Therapist query result:', {
      found: !!therapist,
      integrationStatus: therapist?.googleCalendarIntegrationStatus,
      hasCalendarEmail: !!therapist?.googleCalendarEmail,
    });

    if (!therapist) {
      console.log('Therapist not found, returning 404');
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    const response = {
      success: true,
      therapistId: therapist.id,
      email: therapist.email,
      isConnected: therapist.googleCalendarIntegrationStatus === 'connected',
      calendarEmail: therapist.googleCalendarEmail || null,
    };

    console.log('Returning successful response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
