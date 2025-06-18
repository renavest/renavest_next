import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { createTokenManager } from '@/src/features/google-calendar/utils/tokenManager';
import { createDate } from '@/src/utils/timezone';

// Validation schema
const GoogleCalendarAuthSchema = z.object({
  therapistId: z.number(),
  code: z.string(),
});

// Create token manager instance
const tokenManager = createTokenManager(db);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get therapistId from query string
    const { searchParams } = new URL(req.url);
    const therapistId = searchParams.get('therapistId');

    if (!therapistId) {
      return NextResponse.json({ error: 'Therapist ID is required' }, { status: 400 });
    }

    // Generate authorization URL using token manager
    const authUrl = tokenManager.generateAuthUrl(therapistId);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate authorization URL' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request body
    const { therapistId, code } = GoogleCalendarAuthSchema.parse(body);

    // Exchange authorization code for tokens using token manager
    const tokenInfo = await tokenManager.exchangeCodeForTokens(code);

    // Create a temporary OAuth2 client to get user info
    const tempClient = tokenManager.createAuthClient();
    tempClient.setCredentials({
      access_token: tokenInfo.access_token,
      refresh_token: tokenInfo.refresh_token,
    });

    // Fetch user's email from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: tempClient });
    const userInfo = await oauth2.userinfo.get();
    const calendarEmail = userInfo.data.email;

    // Update therapist record with Google Calendar credentials
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

    return NextResponse.json({
      success: true,
      message: 'Google Calendar successfully integrated',
      calendarEmail,
    });
  } catch (error) {
    console.error('Google Calendar integration error:', error);

    // If validation fails or other errors occur
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
        message: 'Failed to integrate Google Calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
