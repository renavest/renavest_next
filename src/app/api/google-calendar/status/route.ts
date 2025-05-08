import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { createDate } from '@/src/utils/timezone';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const therapistId = url.searchParams.get('therapistId');

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
        googleCalendarIntegrationDate: true,
        googleCalendarAccessToken: true,
        googleCalendarRefreshToken: true,
        updatedAt: true,
      },
    });

    console.log('Therapist query result:', {
      found: !!therapist,
      integrationStatus: therapist?.googleCalendarIntegrationStatus,
      hasCalendarEmail: !!therapist?.googleCalendarEmail,
      hasAccessToken: !!therapist?.googleCalendarAccessToken,
      hasRefreshToken: !!therapist?.googleCalendarRefreshToken,
    });

    if (!therapist) {
      console.log('Therapist not found, returning 404');
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    // Determine if the integration is actually connected based on tokens and status
    const isConnected =
      therapist.googleCalendarIntegrationStatus === 'connected' &&
      !!therapist.googleCalendarAccessToken &&
      !!therapist.googleCalendarRefreshToken;

    // Format the last synced date if available
    let lastSynced = null;
    if (therapist.googleCalendarIntegrationDate) {
      lastSynced = createDate(therapist.googleCalendarIntegrationDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    }

    const response = {
      success: true,
      therapistId: therapist.id,
      email: therapist.email,
      isConnected,
      calendarEmail: therapist.googleCalendarEmail || null,
      integrationStatus: therapist.googleCalendarIntegrationStatus,
      lastSynced,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
