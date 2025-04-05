import * as dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

// Load environment variables based on the environment
const envPath = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envPath });

// Type definitions for Calendly API responses
interface CalendlyTokenResponse {
  access_token: string;
}

interface CalendlyAvailabilitySchedule {
  default: boolean;
  rules: CalendlyAvailabilityRule[];
}

interface CalendlyAvailabilityRule {
  type: 'wday' | 'date';
  wday?: string;
  intervals: Array<{
    from: string;
    to: string;
  }>;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
}

// Add new interface for the full availability schedule response
interface CalendlyAvailabilityScheduleResponse {
  collection: CalendlyAvailabilitySchedule[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Try to get user from query parameter, fallback to environment variable
  const userParam = searchParams.get('user') || process.env.CALENDLY_USER_URI;

  if (!userParam) {
    return NextResponse.json(
      {
        error: 'No user specified',
        message:
          'Please provide a user URI via query parameter or CALENDLY_USER_URI environment variable',
      },
      { status: 400 },
    );
  }

  try {
    console.log('Fetching availability from Calendly');

    // Obtain access token using server-side environment variables
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.CALENDLY_CLIENT_ID,
        client_secret: process.env.CALENDLY_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain Calendly access token');
    }

    const { access_token: accessToken } = (await tokenResponse.json()) as CalendlyTokenResponse;

    // Fetch availability schedules
    const availabilityResponse = await fetch(
      `https://api.calendly.com/user_availability_schedules?user=${encodeURIComponent(userParam)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!availabilityResponse.ok) {
      // Log the full error response for debugging
      const errorBody = await availabilityResponse.text();
      console.error('Availability Fetch Error:', {
        status: availabilityResponse.status,
        body: errorBody,
      });

      throw new Error(
        `Failed to fetch Calendly availability schedules. Status: ${availabilityResponse.status}`,
      );
    }

    const availabilityData =
      (await availabilityResponse.json()) as CalendlyAvailabilityScheduleResponse;

    // If no schedules found, return an informative message
    if (!availabilityData.collection || availabilityData.collection.length === 0) {
      return NextResponse.json(
        {
          message: 'No availability schedules found for the specified user',
          user: userParam,
        },
        { status: 404 },
      );
    }

    // If no user parameter is provided, generate slots from the default schedule
    const defaultSchedule = availabilityData.collection.find(
      (schedule: CalendlyAvailabilitySchedule) => schedule.default,
    );

    if (defaultSchedule) {
      const slots = generateAvailableSlots(defaultSchedule);
      return NextResponse.json({
        availabilitySchedules: availabilityData.collection,
        defaultSlots: slots,
      });
    }

    // Return all availability schedules if no default schedule is found
    return NextResponse.json(availabilityData);
  } catch (error) {
    console.error('Calendly availability fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

function generateAvailableSlots(schedule: CalendlyAvailabilitySchedule): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const now = new Date();

  // Generate slots for the next 7 days
  for (let i = 1; i <= 7; i++) {
    const baseDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = baseDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Find rules for this day of the week
    const dayRules = schedule.rules.filter(
      (rule: CalendlyAvailabilityRule) => rule.type === 'wday' && rule.wday === dayOfWeek,
    );

    dayRules.forEach((rule: CalendlyAvailabilityRule) => {
      rule.intervals.forEach((interval) => {
        const [fromHours, fromMinutes] = interval.from.split(':').map(Number);
        const [toHours, toMinutes] = interval.to.split(':').map(Number);

        const startSlot = new Date(baseDate);
        startSlot.setHours(fromHours, fromMinutes, 0, 0);

        const endSlot = new Date(baseDate);
        endSlot.setHours(toHours, toMinutes, 0, 0);

        // Break the time range into 1-hour slots
        let currentSlotStart = new Date(startSlot);
        while (currentSlotStart < endSlot) {
          const slotEnd = new Date(currentSlotStart.getTime() + 60 * 60 * 1000);

          if (slotEnd <= endSlot) {
            slots.push({
              startTime: currentSlotStart.toISOString(),
              endTime: slotEnd.toISOString(),
            });
          }

          currentSlotStart = slotEnd;
        }
      });
    });
  }

  return slots;
}
