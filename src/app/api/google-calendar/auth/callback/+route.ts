import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// GET handler for OAuth callback
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Therapist ID should be passed in state (as JSON string for demo)
  let therapistId: number | null = null;
  if (state) {
    try {
      const parsed = JSON.parse(state);
      therapistId = parsed.therapistId;
    } catch {
      // fallback: state is not JSON
      therapistId = Number(state);
    }
  }

  if (!code || !therapistId) {
    return NextResponse.redirect('/google-calendar/error?reason=missing_code_or_id');
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

    // Redirect to success page
    return NextResponse.redirect('/google-calendar/success');
  } catch (error) {
    console.error('Google Calendar OAuth callback error:', error);
    return NextResponse.redirect('/google-calendar/error?reason=oauth_error');
  }
}
