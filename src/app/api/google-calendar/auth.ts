import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Validation schema
const GoogleCalendarAuthSchema = z.object({
  therapistId: z.number(),
  code: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Generate authorization URL
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Enables refresh token
      scope: scopes,
      prompt: 'consent', // Always ask for consent to get refresh token
    });

    return res.status(200).json({ authUrl: url });
  }

  if (req.method === 'POST') {
    try {
      // Validate request body
      const { therapistId, code } = GoogleCalendarAuthSchema.parse(req.body);

      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);

      // Set credentials
      oauth2Client.setCredentials(tokens);

      // Fetch user's email from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const calendarEmail = userInfo.data.email;

      // Update therapist record with Google Calendar credentials
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

      return res.status(200).json({
        success: true,
        message: 'Google Calendar successfully integrated',
        calendarEmail,
      });
    } catch (error) {
      console.error('Google Calendar integration error:', error);

      // If validation fails or other errors occur
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to integrate Google Calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
