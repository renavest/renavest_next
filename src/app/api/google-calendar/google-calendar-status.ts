import { eq } from 'drizzle-orm';
import type { NextApiRequest, NextApiResponse } from 'next';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID',
    });
  }

  try {
    // Find the therapist associated with the user
    const therapist = await db.query.therapists.findFirst({
      where: eq(therapists.userId, parseInt(userId)),
      columns: {
        googleCalendarEmail: true,
        googleCalendarIntegrationStatus: true,
      },
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found',
      });
    }

    return res.status(200).json({
      success: true,
      isConnected: therapist.googleCalendarIntegrationStatus === 'connected',
      calendarEmail: therapist.googleCalendarEmail || null,
    });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check Google Calendar integration status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
