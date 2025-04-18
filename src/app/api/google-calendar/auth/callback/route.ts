import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// GET handler for OAuth callback
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const origin = url.origin;

    console.log('=== Google Calendar OAuth Callback ===');
    console.log('Received callback params:', {
      code: code ? 'present' : 'missing',
      state: state || 'missing',
      origin,
    });

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

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    try {
      console.log('Exchanging code for tokens...');
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      console.log('Successfully obtained tokens:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      });

      // Fetch user's email from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const calendarEmail = userInfo.data.email;
      console.log('Fetched Google Calendar email:', calendarEmail);

      // Update therapist record
      console.log('Updating therapist record in database...');
      await db
        .update(therapists)
        .set({
          googleCalendarAccessToken: tokens.access_token,
          googleCalendarRefreshToken: tokens.refresh_token,
          googleCalendarEmail: calendarEmail,
          googleCalendarIntegrationStatus: 'connected',
          googleCalendarIntegrationDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(therapists.id, therapistId));

      console.log('Successfully connected Google Calendar for therapist:', {
        therapistId,
        calendarEmail,
        integrationDate: new Date().toISOString(),
      });

      // Verify the connection by fetching calendar events
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      console.log('Fetching calendar events to verify connection...');
      const events = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: oneWeekFromNow.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log('Successfully fetched calendar events:', {
        eventCount: events.data.items?.length || 0,
        timeRange: `${now.toISOString()} to ${oneWeekFromNow.toISOString()}`,
      });

      return NextResponse.redirect(`${origin}/google-calendar/success?therapistId=${therapistId}`);
    } catch (error) {
      console.error('Failed to exchange code or update therapist:', error);
      return NextResponse.redirect(`${origin}/google-calendar/error?reason=token_exchange_failed`);
    }
  } catch (error) {
    console.error('Unexpected error in Google Calendar callback:', error);
    return NextResponse.redirect(`${origin}/google-calendar/error?reason=unexpected_error`);
  }
}
