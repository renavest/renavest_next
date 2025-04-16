import { eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// Validation schema for disconnecting Google Calendar
const DisconnectGoogleCalendarSchema = z.object({
  therapistId: z.number(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Validate request body
    const { therapistId } = DisconnectGoogleCalendarSchema.parse(req.body);

    // Disconnect Google Calendar integration
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
      .where(eq(therapists.id, therapistId));

    return res.status(200).json({
      success: true,
      message: 'Google Calendar integration disconnected',
    });
  } catch (error) {
    console.error('Google Calendar disconnection error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: error.errors,
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Failed to disconnect Google Calendar',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
