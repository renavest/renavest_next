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

    console.log(
      'Received callback with code:',
      code ? 'present' : 'missing',
      'state:',
      state || 'missing',
    );

    // Therapist ID should be passed in state
    let therapistId: number | null = null;
    if (state) {
      try {
        const parsed = JSON.parse(state);
        const parsedId = parseInt(parsed.therapistId);
        if (isNaN(parsedId)) {
          console.error('Invalid therapist ID format in state:', state);
          return NextResponse.redirect(
            `${origin}/google-calendar/error?reason=invalid_therapist_id`,
          );
        }
        therapistId = parsedId;
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
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

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
          googleCalendarIntegrationDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(therapists.id, therapistId));

      console.log('Successfully connected Google Calendar for therapist:', therapistId);
      return NextResponse.redirect(`${origin}/google-calendar/success`);
    } catch (error) {
      console.error('Failed to exchange code or update therapist:', error);
      return NextResponse.redirect(`${origin}/google-calendar/error?reason=token_exchange_failed`);
    }
  } catch (error) {
    console.error('Unexpected error in Google Calendar callback:', error);
    return NextResponse.redirect(`${origin}/google-calendar/error?reason=unexpected_error`);
  }
}
