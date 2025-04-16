import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Validation schema for the connection request
const GoogleCalendarConnectSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Validate the request parameters
    const validatedData = GoogleCalendarConnectSchema.parse({
      code,
      state,
    });

    // Verify the user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(validatedData.code);
    oauth2Client.setCredentials(tokens);

    // Get the user's Google Calendar email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const calendarEmail = userInfo.data.email;

    // Find the therapist by their Google Calendar email
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.googleCalendarEmail, calendarEmail || ''),
    });

    if (!therapist) {
      return NextResponse.json(
        {
          success: false,
          message: 'Therapist not found',
        },
        { status: 404 },
      );
    }

    // Update therapist's Google Calendar credentials
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
      .where(eq(therapists.id, therapist.id));

    // Redirect to the success page
    return NextResponse.redirect(new URL('/employee', req.url));
  } catch (error) {
    console.error('Google Calendar connection error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request parameters',
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect Google Calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Initialize connection
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to initialize Google Calendar connection:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize Google Calendar connection',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
