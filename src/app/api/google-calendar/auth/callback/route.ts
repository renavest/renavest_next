import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { createTokenManager } from '@/src/features/google-calendar/utils/tokenManager';
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
    // Create token manager instance
    const tokenManager = createTokenManager(db);

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
      // Exchange authorization code for tokens using token manager
      const tokenInfo = await tokenManager.exchangeCodeForTokens(code);

      // Create temporary OAuth2Client to get user info
      const tempClient = tokenManager.createAuthClient();
      tempClient.setCredentials({
        access_token: tokenInfo.access_token,
        refresh_token: tokenInfo.refresh_token,
      });

      // Fetch user's email from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: tempClient });
      const userInfo = await oauth2.userinfo.get();
      const calendarEmail = userInfo.data.email;

      // Update therapist record
      await db
        .update(therapists)
        .set({
          googleCalendarAccessToken: tokenInfo.access_token,
          googleCalendarRefreshToken: tokenInfo.refresh_token,
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
      const calendar = google.calendar({ version: 'v3', auth: tempClient });
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

      return NextResponse.redirect(`${origin}/therapist/integrations`);
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
