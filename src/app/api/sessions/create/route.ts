import { auth, currentUser } from '@clerk/nextjs/server';
import { calendar_v3, google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import { sendBookingConfirmationEmail } from '@/src/features/booking/actions/sendBookingConfirmationEmail';
import { TimezoneManager } from '@/src/features/booking/utils/timezoneManager';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Validation schema for booking creation
const CreateBookingSchema = z.object({
  therapistId: z.number(),
  sessionDate: z.string(),
  sessionTime: z.string(),
  clientTimezone: z.string(),
});

// Helper function to get therapist's timezone from Google Calendar
async function getTherapistTimezone(calendar: calendar_v3.Calendar): Promise<string> {
  try {
    const calendarSettings = await calendar.settings.get({
      setting: 'timezone',
    });
    return calendarSettings.data.value || 'UTC';
  } catch (error) {
    console.error('Error getting therapist timezone:', error);
    return 'UTC';
  }
}

// Helper function to check slot availability
async function checkSlotAvailability(
  calendar: calendar_v3.Calendar,
  startTime: Date,
  endTime: Date,
): Promise<boolean> {
  try {
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
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

    // Prevent therapists from booking themselves
    if (therapist.userId === user.id) {
      return NextResponse.json(
        {
          error: 'Therapists cannot book sessions with themselves',
          message: 'You cannot book a session with yourself',
        },
        { status: 400 },
      );
    }

    // Get timezone manager instance
    const timezoneManager = TimezoneManager.getInstance();

    // Validate client timezone by checking if it's in supported list
    const supportedTimezones = timezoneManager.getSupportedTimezones();
    const clientTimezone = supportedTimezones.find(
      (tz) => tz.value === validatedData.clientTimezone,
    )?.value;
    if (!clientTimezone) {
      return NextResponse.json({ error: 'Invalid client timezone' }, { status: 400 });
    }

    // Set up Google Calendar client
    if (!therapist.googleCalendarAccessToken) {
      return NextResponse.json(
        { error: 'Therapist Google Calendar not connected' },
        { status: 400 },
      );
    }

    oauth2Client.setCredentials({
      access_token: therapist.googleCalendarAccessToken,
      refresh_token: therapist.googleCalendarRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get therapist's timezone from Google Calendar
    const therapistTimezone = await getTherapistTimezone(calendar);
    const validatedTherapistTimezone =
      supportedTimezones.find((tz) => tz.value === therapistTimezone)?.value || 'UTC';

    // Convert booking slot for storage using TimezoneManager
    const bookingSlot = timezoneManager.convertBookingSlotForStorage(
      validatedData.sessionDate,
      validatedData.sessionTime,
      clientTimezone,
      validatedTherapistTimezone,
    );

    if (!bookingSlot) {
      return NextResponse.json({ error: 'Invalid booking time' }, { status: 400 });
    }

    // Check slot availability
    const isSlotAvailable = await checkSlotAvailability(
      calendar,
      bookingSlot.startTime.toJSDate(),
      bookingSlot.endTime.toJSDate(),
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

    // Create booking session
    const bookingResult = await db
      .insert(bookingSessions)
      .values({
        userId: user.id,
        therapistId: therapist.id,
        sessionDate: bookingSlot.startTime.toJSDate(),
        sessionStartTime: bookingSlot.startTime.toJSDate(),
        sessionEndTime: bookingSlot.endTime.toJSDate(),
        status: 'pending',
        metadata: {
          clientTimezone,
          therapistTimezone: validatedTherapistTimezone,
        },
      })
      .returning();

    const booking = bookingResult[0];

    // Create Google Calendar event
    let calendarResult = null;
    if (therapist.googleCalendarIntegrationStatus === 'connected') {
      try {
        const eventRequestBody = {
          summary: `Therapy Session with ${user.firstName || ''} ${user.lastName || ''}`.trim(),
          description: 'Therapy session booked through Renavest',
          start: {
            dateTime: bookingSlot.startTime.toISO(),
            timeZone: validatedTherapistTimezone,
          },
          end: {
            dateTime: bookingSlot.endTime.toISO(),
            timeZone: validatedTherapistTimezone,
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

        calendarResult = {
          eventId: event.data.id || '',
          eventLink: event.data.htmlLink || '',
          googleMeetLink:
            event.data.conferenceData?.entryPoints?.find(
              (ep) => ep.entryPointType === 'video' && ep.uri?.includes('meet.google.com'),
            )?.uri || '',
        };
      } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Continue without calendar event
      }
    }

    // Send confirmation emails
    try {
      const emailData = timezoneManager.formatForEmail(booking.sessionDate, clientTimezone);
      await sendBookingConfirmationEmail({
        clientEmail: user.email,
        therapistEmail: therapist.googleCalendarEmail || '',
        sessionDate: emailData.date,
        sessionTime: emailData.time,
        clientTimezone,
        therapistTimezone: validatedTherapistTimezone,
        googleMeetLink: calendarResult?.googleMeetLink,
        therapistName: therapist.name,
        clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Continue without email
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        sessionDate: booking.sessionDate,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        status: booking.status,
        clientTimezone,
        therapistTimezone: validatedTherapistTimezone,
        googleCalendarEventId: calendarResult?.eventId || null,
        googleCalendarEventLink: calendarResult?.eventLink || null,
        googleMeetLink: calendarResult?.googleMeetLink || null,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
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
