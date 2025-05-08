import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';
// GET handler for OAuth callback
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const origin = url.origin;

    // Therapist ID should be passed in state
    let therapistId: number | null = null;
    if (state) {
      try {
        const parsed = JSON.parse(state);
        const parsedId = parseInt(parsed.therapistId);
        if (isNaN(parsedId)) {
          console.error('Invalid therapist ID format:', { state, parsedId });
          return NextResponse.redirect(
            `${origin}/google-calendar/error?reason=invalid_therapist_id`,
          );
        }
        therapistId = parsedId;
        console.log('Successfully parsed therapist ID:', therapistId);
      } catch (e) {
        console.error('Failed to parse state:', e);
        return NextResponse.redirect(`${origin}/google-calendar/error?reason=invalid_state`);
      }
    }

    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.redirect(`${origin}/google-calendar/error?reason=missing_code`);
    }

    if (!therapistId) {
      console.error('Missing therapist ID');
      return NextResponse.redirect(`${origin}/google-calendar/error?reason=missing_therapist_id`);
    }

    const { userId } = await auth();
    if (!userId) {
      console.error('Missing user ID');
      return NextResponse.redirect(`${origin}/google-calendar/error?reason=missing_user_id`);
    }
    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    // Find therapist to ensure they exist
    const existingTherapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, therapistId),
      columns: {
        id: true,
      },
    });

    if (!existingTherapist) {
      console.error('Therapist not found:', therapistId);
      return NextResponse.redirect(`${origin}/google-calendar/error?reason=therapist_not_found`);
    }

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // If we don't have a refresh token, that's a problem since we need offline access
      if (!tokens.refresh_token) {
        console.warn('No refresh token received! Setting integration status to error.');
        await db
          .update(therapists)
          .set({
            googleCalendarIntegrationStatus: 'error',
            updatedAt: createDate().toJSDate(),
          })
          .where(eq(therapists.id, therapistId));

        return NextResponse.redirect(`${origin}/google-calendar/error?reason=no_refresh_token`);
      }

      // Fetch user's email from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const calendarEmail = userInfo.data.email;

      // Update therapist record
      await db
        .update(therapists)
        .set({
          googleCalendarAccessToken: tokens.access_token,
          googleCalendarRefreshToken: tokens.refresh_token,
          googleCalendarEmail: calendarEmail,
          googleCalendarIntegrationStatus: 'connected',
          googleCalendarIntegrationDate: createDate().toJSDate(),
          updatedAt: createDate().toJSDate(),
        })
        .where(eq(therapists.id, therapistId));
      await (
        await clerkClient()
      ).users.updateUserMetadata(userId, {
        publicMetadata: {
          googleCalendarConnected: true,
          googleCalendarIntegrationStatus: 'connected',
          googleCalendarIntegrationDate: createDate().toJSDate(),
        },
      });
      // Verify the connection by fetching calendar events

      // Verify the connection by fetching calendar events
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const now = createDate();
      const oneWeekLater = now.plus({ days: 7 });

      try {
        const events = await calendar.events.list({
          calendarId: 'primary',
          timeMin: now.toISO(),
          timeMax: oneWeekLater.toISO(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });

        console.log('Successfully fetched calendar events:', {
          eventCount: events.data.items?.length || 0,
          timeRange: `${now.toISO()} to ${oneWeekLater.toISO()}`,
        });
      } catch (error) {
        console.error('Error fetching calendar events, but continuing anyway:', error);
        // Don't fail the connection just because we couldn't fetch events
      }

      return NextResponse.redirect(`${origin}/therapist/`);
    } catch (error) {
      console.error('Failed to exchange code or update therapist:', error);

      // Update therapist record to indicate error
      await db
        .update(therapists)
        .set({
          googleCalendarIntegrationStatus: 'error',
          updatedAt: createDate().toJSDate(),
        })
        .where(eq(therapists.id, therapistId));

      return NextResponse.redirect(`${origin}/google-calendar/error?reason=token_exchange_failed`);
    }
  } catch (error) {
    console.error('Unexpected error in Google Calendar callback:', error);
    return NextResponse.redirect(`${origin}/google-calendar/error?reason=unexpected_error`);
  }
}
