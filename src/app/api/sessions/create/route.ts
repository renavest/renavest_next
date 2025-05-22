import { auth, currentUser } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import { sendBookingConfirmationEmail } from '@/src/features/booking/actions/sendBookingConfirmationEmail';
import { timezoneManager, SupportedTimezone } from '@/src/features/booking/utils/timezoneManager';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Enhanced validation schema with timezone support
const CreateBookingSchema = z.object({
  therapistId: z.number(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  sessionTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  clientTimezone: z
    .string()
    .refine(
      (tz) => timezoneManager.getSupportedTimezones().some((t) => t.value === tz),
      'Unsupported timezone',
    ),
});

// Helper function to get therapist's timezone from Google Calendar
async function getTherapistTimezone(
  calendar: ReturnType<typeof google.calendar>,
): Promise<SupportedTimezone> {
  try {
    const calendarSettings = await calendar.settings.get({
      setting: 'timezone',
    });
    const detectedTimezone = calendarSettings.data.value || 'UTC';

    // Map to supported timezone
    const supportedTimezones = timezoneManager.getSupportedTimezones();
    const matchedTimezone = supportedTimezones.find((tz) => tz.value === detectedTimezone);

    return matchedTimezone?.value || 'America/New_York';
  } catch (error) {
    console.error('Error getting therapist timezone:', error);
    return 'America/New_York';
  }
}

// Helper function to check slot availability
async function checkSlotAvailability(
  calendar: ReturnType<typeof google.calendar>,
  startTime: Date,
  endTime: Date,
  timezone: SupportedTimezone,
): Promise<boolean> {
  try {
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        timeZone: timezone,
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = freeBusyResponse.data.calendars?.primary?.busy || [];
    return busySlots.length === 0;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
}

// Create a new booking with robust timezone handling
export async function POST(req: NextRequest) {
  try {
    auth.protect();
    const currentUserData = await currentUser();
    if (!currentUserData?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateBookingSchema.parse(body);

    // Get user from database
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, currentUserData.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get therapist from database
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, validatedData.therapistId),
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Validate Google Calendar integration
    if (
      !therapist.googleCalendarAccessToken ||
      therapist.googleCalendarIntegrationStatus !== 'connected'
    ) {
      return NextResponse.json(
        { error: 'Therapist does not have Google Calendar integration enabled' },
        { status: 400 },
      );
    }

    // Set up Google Calendar client
    oauth2Client.setCredentials({
      access_token: therapist.googleCalendarAccessToken,
      refresh_token: therapist.googleCalendarRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get therapist's timezone
    const therapistTimezone = await getTherapistTimezone(calendar);

    // Convert booking slot using timezone manager
    const bookingSlot = timezoneManager.convertBookingSlotForStorage(
      validatedData.sessionDate,
      validatedData.sessionTime,
      validatedData.clientTimezone as SupportedTimezone,
      therapistTimezone,
    );

    // Verify the slot is still available
    const isSlotAvailable = await checkSlotAvailability(
      calendar,
      bookingSlot.startTime.toJSDate(),
      bookingSlot.endTime.toJSDate(),
      therapistTimezone,
    );

    if (!isSlotAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: 'The selected time slot is no longer available',
        },
        { status: 409 },
      );
    }

    // Create Google Calendar event first
    let googleMeetLink = '';
    let googleEventId = '';

    try {
      const eventRequestBody = {
        summary: `Therapy Session with ${user.firstName || ''} ${user.lastName || ''}`.trim(),
        description: 'Therapy session booked through Renavest',
        start: {
          dateTime: bookingSlot.startTime.toISO(),
          timeZone: therapistTimezone,
        },
        end: {
          dateTime: bookingSlot.endTime.toISO(),
          timeZone: therapistTimezone,
        },
        attendees: [{ email: therapist.googleCalendarEmail || '' }, { email: user.email }],
        conferenceData: {
          createRequest: { requestId: `renavest-${Date.now()}` },
        },
      };

      const event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: eventRequestBody,
      });

      googleEventId = event.data.id || '';
      googleMeetLink =
        event.data.conferenceData?.entryPoints?.find(
          (ep) => ep.entryPointType === 'video' && ep.uri?.includes('meet.google.com'),
        )?.uri || '';
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    // Create booking session with proper timezone metadata
    const bookingResult = await db
      .insert(bookingSessions)
      .values({
        userId: user.id,
        therapistId: therapist.id,
        sessionDate: bookingSlot.startTime.toJSDate(),
        sessionStartTime: bookingSlot.startTime.toJSDate(),
        sessionEndTime: bookingSlot.endTime.toJSDate(),
        status: 'confirmed',
        googleEventId,
        metadata: {
          clientTimezone: bookingSlot.clientTimezone,
          therapistTimezone: bookingSlot.therapistTimezone,
          originalClientDate: validatedData.sessionDate,
          originalClientTime: validatedData.sessionTime,
          googleMeetLink,
        },
      })
      .returning();

    const booking = bookingResult[0];

    // Send confirmation emails with proper timezone formatting
    const clientEmailData = timezoneManager.formatForEmail(
      bookingSlot.startTime,
      bookingSlot.clientTimezone,
    );

    await sendBookingConfirmationEmail({
      clientEmail: user.email,
      therapistEmail: therapist.googleCalendarEmail || '',
      sessionDate: clientEmailData.date,
      sessionTime: clientEmailData.time,
      clientTimezone: bookingSlot.clientTimezone,
      therapistTimezone: bookingSlot.therapistTimezone,
      googleMeetLink,
      therapistName: therapist.name || 'Therapist',
      clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        sessionDate: booking.sessionDate,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        status: booking.status,
        clientTimezone: bookingSlot.clientTimezone,
        therapistTimezone: bookingSlot.therapistTimezone,
        googleEventId,
        googleMeetLink,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid booking data',
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create booking',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
