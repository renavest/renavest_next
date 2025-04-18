import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('=== Google Calendar Disconnect ===');
    console.log('User ID:', userId);

    // Find therapist by userId
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.userId, userId),
      columns: {
        id: true,
        googleCalendarAccessToken: true,
        googleCalendarRefreshToken: true,
        googleCalendarEmail: true,
      },
    });

    if (!therapist) {
      console.error('Therapist not found for userId:', userId);
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    console.log('Found therapist:', {
      id: therapist.id,
      hasAccessToken: !!therapist.googleCalendarAccessToken,
      hasRefreshToken: !!therapist.googleCalendarRefreshToken,
      email: therapist.googleCalendarEmail,
    });

    // If there's an access token, try to revoke it
    if (therapist.googleCalendarAccessToken) {
      try {
        oauth2Client.setCredentials({
          access_token: therapist.googleCalendarAccessToken,
          refresh_token: therapist.googleCalendarRefreshToken || undefined,
        });
        await oauth2Client.revokeToken(therapist.googleCalendarAccessToken);
        console.log('Successfully revoked Google Calendar access token');
      } catch (error) {
        // Don't fail if token revocation fails (token might be expired)
        console.warn('Failed to revoke token, continuing with disconnection:', error);
      }
    }

    // Update therapist record to remove Google Calendar integration
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

    console.log('Successfully disconnected Google Calendar for therapist:', therapist.id);

    return NextResponse.json({
      success: true,
      message: 'Google Calendar successfully disconnected',
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to disconnect Google Calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
