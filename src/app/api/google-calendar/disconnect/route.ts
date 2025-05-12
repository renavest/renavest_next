import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function POST(_req: NextRequest) {
  try {
    auth.protect();
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.log('=== Google Calendar Disconnect ===');
    console.log('User ID:', userId);

    // Find therapist by userId
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.email, user.emailAddresses[0]?.emailAddress),
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
        updatedAt: createDate().toJSDate(),
      })
      .where(eq(therapists.id, therapist.id));
    await (
      await clerkClient()
    ).users.updateUserMetadata(userId, {
      publicMetadata: {
        googleCalendarConnected: false,
        googleCalendarIntegrationStatus: 'not_connected',
        googleCalendarIntegrationDate: null,
      },
    });
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
