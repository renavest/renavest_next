/**
 * Simple Calendly Webhook Handler
 * 
 * IMPORTANT: The webhook URL should be: https://your-domain.com/api/calendly
 * 
 * To set up in Calendly:
 * curl --request POST \
 *   --url https://api.calendly.com/webhook_subscriptions \
 *   --header 'Content-Type: application/json' \
 *   --header 'authorization: Bearer <YOUR_PERSONAL_TOKEN>' \
 *   --data '{
 *     "url":"https://your-domain.com/api/calendly",
 *     "events":["invitee.created", "invitee.canceled"],
 *     "scope":"organization",
 *     "organization":"https://api.calendly.com/organizations/<ORG_UUID>"
 *   }'
 */

import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { bookedSessions, users } from '@/src/db/schema';
import financialTherapists from '@/src/features/employee-dashboard/components/therapistCatalog/financial_therapists.json';

interface TherapistJson {
  id: number;
  name: string;
  bookingurl: string;
  demourl?: string;
  demo_url?: string; // Support both field names for backward compatibility
  therapist_email?: string;
}

interface CalendlyWebhookEvent {
  event?: string;
  type?: string;
  action?: string;
  payload?: {
    name?: string;
    email?: string;
    uri?: string;
    cancellation?: {
      reason?: string;
    };
    scheduled_event?: {
      uri?: string;
      name?: string;
      start_time?: string;
      end_time?: string;
      event_memberships?: Array<{
        user?: string;
        user_email?: string;
        user_name?: string;
      }>;
    };
  };
  created_by?: string;
  [key: string]: unknown;
}

/**
 * Extract Calendly username from a booking URL
 * Examples:
 * - "https://calendly.com/stanley-renavestapp/60min" -> "stanley-renavestapp"
 * - "https://calendly.com/paigevic98/one-on-one" -> "paigevic98"
 */
function extractCalendlyUsername(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const match = url.match(/calendly\.com\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Find therapist from JSON file by matching:
 * 1. Calendly username in booking URLs
 * 2. Email from eventMemberships against therapist_email
 * 3. Name from eventMemberships against name
 */
function findTherapistFromJson(
  calendlyUserId: string | null,
  scheduledEventUri: string | null | undefined,
  eventMemberships?: Array<{
    user?: string;
    user_email?: string;
    user_name?: string;
  }>,
): {
  therapistJsonId: number | null;
  therapistName: string | null;
  therapist?: TherapistJson | null;
} {
  const therapists = financialTherapists as TherapistJson[];

  // Try to extract username from scheduled event URI if provided
  let usernameToMatch: string | null = null;
  if (scheduledEventUri) {
    usernameToMatch = extractCalendlyUsername(scheduledEventUri);
  }

  // Extract email and name from eventMemberships for matching
  const membershipEmail = eventMemberships?.[0]?.user_email?.toLowerCase().trim();
  const membershipName = eventMemberships?.[0]?.user_name?.trim();

  // Search through therapists to find a match
  for (const therapist of therapists) {
    // Method 1: Match by Calendly username from booking URLs
    const bookingUsername = extractCalendlyUsername(therapist.bookingurl);
    if (bookingUsername && usernameToMatch && bookingUsername === usernameToMatch) {
      return {
        therapistJsonId: therapist.id,
        therapistName: therapist.name,
        therapist,
      };
    }

    // Check demo URL if available (support both field names)
    const demoUrl = therapist.demo_url || therapist.demourl;
    if (demoUrl) {
      const demoUsername = extractCalendlyUsername(demoUrl);
      if (demoUsername && usernameToMatch && demoUsername === usernameToMatch) {
        return {
          therapistJsonId: therapist.id,
          therapistName: therapist.name,
          therapist,
        };
      }
    }

    // Method 2: Match by email (therapist_email from JSON vs user_email from eventMemberships)
    if (membershipEmail && therapist.therapist_email) {
      const therapistEmail = therapist.therapist_email.toLowerCase().trim();
      if (therapistEmail === membershipEmail) {
        console.info('Matched therapist by email:', {
          therapistId: therapist.id,
          therapistName: therapist.name,
          email: membershipEmail,
        });
        return {
          therapistJsonId: therapist.id,
          therapistName: therapist.name,
          therapist,
        };
      }
    }

    // Method 3: Match by name (name from JSON vs user_name from eventMemberships)
    if (membershipName && therapist.name) {
      const therapistName = therapist.name.trim();
      if (therapistName === membershipName) {
        console.info('Matched therapist by name:', {
          therapistId: therapist.id,
          therapistName: therapist.name,
          name: membershipName,
        });
        return {
          therapistJsonId: therapist.id,
          therapistName: therapist.name,
          therapist,
        };
      }
    }
  }

  // If we couldn't match by any method, return null
  console.warn('Could not match therapist:', {
    usernameToMatch,
    membershipEmail,
    membershipName,
  });
  return { therapistJsonId: null, therapistName: null, therapist: null };
}

/**
 * Determine session type by matching event URI with therapist booking URLs
 * Returns 'free' if matches demo_url, 'regular' if matches bookingurl, null otherwise
 */
function determineSessionType(
  eventUri: string | null,
  therapist: TherapistJson | null,
): 'free' | 'regular' | null {
  if (!eventUri || !therapist) {
    return null;
  }

  const normalizedEventUri = eventUri.toLowerCase().split('?')[0].replace(/\/$/, '');

  // Support both field names for demo URL
  const demoUrl = therapist.demo_url || therapist.demourl;
  if (demoUrl) {
    const normalizedDemoUrl = demoUrl.toLowerCase().split('?')[0].replace(/\/$/, '');
    if (
      normalizedEventUri.includes(normalizedDemoUrl) ||
      normalizedDemoUrl.includes(normalizedEventUri) ||
      extractCalendlyUsername(eventUri) === extractCalendlyUsername(demoUrl)
    ) {
      return 'free';
    }
  }

  if (therapist.bookingurl) {
    const normalizedBookingUrl = therapist.bookingurl.toLowerCase().split('?')[0].replace(/\/$/, '');
    if (
      normalizedEventUri.includes(normalizedBookingUrl) ||
      normalizedBookingUrl.includes(normalizedEventUri) ||
      extractCalendlyUsername(eventUri) === extractCalendlyUsername(therapist.bookingurl)
    ) {
      return 'regular';
    }
  }

  return null;
}

/**
 * Look up user and therapist info from Calendly webhook data
 */
async function lookupUserAndTherapist(
  inviteeEmail: string,
  calendlyUserId: string | null | undefined,
  scheduledEventUri: string | null | undefined,
  eventMemberships?: Array<{
    user?: string;
    user_email?: string;
    user_name?: string;
  }>,
): Promise<{
  userId: number | null;
  therapistJsonId: number | null;
  therapistName: string | null;
  therapist: TherapistJson | null;
}> {
  let userId: number | null = null;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, inviteeEmail),
      columns: { id: true },
    });

    if (user) {
      userId = user.id;
      console.info('Found user by email:', { email: inviteeEmail, userId: user.id });
    } else {
      console.warn('User not found for email:', inviteeEmail);
    }
  } catch (dbError) {
    console.error('Database lookup error:', dbError);
  }

  // Find therapist from JSON file by matching Calendly username, email, or name
  const therapistInfo = findTherapistFromJson(
    calendlyUserId ?? null,
    scheduledEventUri ?? null,
    eventMemberships,
  );

  if (therapistInfo.therapistJsonId) {
    console.info('Found therapist from JSON:', {
      therapistJsonId: therapistInfo.therapistJsonId,
      therapistName: therapistInfo.therapistName,
      scheduledEventUri,
      matchedBy: eventMemberships?.[0]?.user_email ? 'email/name' : 'username',
    });
  }

  return {
    userId,
    therapistJsonId: therapistInfo.therapistJsonId,
    therapistName: therapistInfo.therapistName,
    therapist: therapistInfo.therapist || null,
  };
}

/**
 * Create a booked session entry from Calendly webhook data
 */
async function createBookedSession(
  userId: number | null,
  userEmail: string,
  therapistJsonId: number | null,
  therapistName: string | null,
  eventName: string | null,
  startTime: Date,
  endTime: Date,
  eventUri: string,
  inviteeUri: string | null,
  sessionType: 'free' | 'regular' | null,
): Promise<void> {
  try {
    await db.insert(bookedSessions).values({
      userId: userId || null,
      userEmail,
      therapistId: null, // Not using therapists table currently
      therapistJsonId,
      therapistName,
      name: eventName || null,
      type: sessionType,
      startTime,
      endTime,
      cancelled: false,
      calendlyEventUri: eventUri,
      calendlyInviteeUri: inviteeUri || null,
      updatedAt: new Date(),
    });

    console.info('Booked session created successfully:', {
      userId,
      userEmail,
      therapistJsonId,
      therapistName,
      sessionType,
      eventUri,
    });
  } catch (insertError) {
    console.error('Error creating booked session:', insertError);
    throw insertError;
  }
}

/**
 * Update booked session to mark as cancelled
 */
async function cancelBookedSession(
  eventUri: string,
  inviteeEmail: string | null,
  therapistJsonId: number | null,
  startTime: string | null,
  cancelReason: string | null,
): Promise<void> {
  try {
    // Try to find the booking by Calendly event URI first
    const existingBooking = await db.query.bookedSessions.findFirst({
      where: eq(bookedSessions.calendlyEventUri, eventUri),
      columns: { id: true },
    });

    if (existingBooking) {
      await db
        .update(bookedSessions)
        .set({
          cancelled: true,
          cancelledReason: cancelReason || null,
          updatedAt: new Date(),
        })
        .where(eq(bookedSessions.id, existingBooking.id));

      console.info('Booked session marked as cancelled:', {
        bookingId: existingBooking.id,
        eventUri,
      });
      return;
    }

    // Fallback: try to find by invitee email + therapist JSON ID + start time
    if (inviteeEmail && therapistJsonId && startTime) {
      const startTimeDate = new Date(startTime);
      const booking = await db.query.bookedSessions.findFirst({
        where: (bookedSessions, { and, eq }) =>
          and(
            eq(bookedSessions.userEmail, inviteeEmail),
            eq(bookedSessions.therapistJsonId, therapistJsonId),
            eq(bookedSessions.startTime, startTimeDate),
          ),
        columns: { id: true },
      });

      if (booking) {
        await db
          .update(bookedSessions)
          .set({
            cancelled: true,
            cancelledReason: cancelReason || null,
            updatedAt: new Date(),
          })
          .where(eq(bookedSessions.id, booking.id));

        console.info('Booked session marked as cancelled (fallback lookup):', {
          bookingId: booking.id,
        });
        return;
      }
    }

    console.warn('Could not find booking to cancel:', {
      eventUri,
      inviteeEmail,
      therapistJsonId,
      startTime,
    });
  } catch (updateError) {
    console.error('Error updating booked session cancellation:', updateError);
    throw updateError;
  }
}



export async function POST(req: NextRequest) {
  console.info('CALENDLY WEBHOOK RECEIVED');
  try {
    // Log raw request info for debugging
    const contentType = req.headers.get('content-type');
    console.info('[CALENDLY WEBHOOK] Request received', {
      contentType,
      method: req.method,
      url: req.url,
    });

    // Get raw body text first to handle ping events that might not be JSON
    let bodyText: string;
    try {
      bodyText = await req.text();
      console.info('[CALENDLY WEBHOOK] Raw body length:', bodyText.length);
      
      // Check for empty body (some ping events might be empty)
      if (!bodyText || bodyText.trim() === '') {
        console.info('[CALENDLY WEBHOOK] Empty body received - treating as ping');
        return NextResponse.json({ ok: true }, { status: 200 });
      }
    } catch (textError) {
      console.error('[CALENDLY WEBHOOK] Error reading body:', textError);
      // If we can't read the body, still try to respond with 200 for ping
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Parse JSON
    let event: CalendlyWebhookEvent | null = null;
    try {
      event = JSON.parse(bodyText) as CalendlyWebhookEvent;
      console.info('[CALENDLY WEBHOOK] Parsed event:', {
        hasEvent: !!event,
        eventType: event?.event,
        keys: event ? Object.keys(event) : [],
      });
    } catch (parseError) {
      console.error('[CALENDLY WEBHOOK] Error parsing JSON:', parseError);
      console.info('[CALENDLY WEBHOOK] Raw body:', bodyText.substring(0, 200));
      // If it's not valid JSON, it might be a ping - return 200
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Calendly pings this once to verify the webhook
    // Check multiple possible ping formats
    if (
      (event && event.event === 'ping') ||
      (event && event.type === 'ping') ||
      (event && event.action === 'ping') ||
      (bodyText.toLowerCase().includes('ping')) ||
      (!event || Object.keys(event).length === 0)
    ) {
      console.info('[CALENDLY WEBHOOK] Ping event detected and handled');
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Handle new bookings
    if (event.event === 'invitee.created') {
      const payload = event.payload;
      const scheduledEvent = payload?.scheduled_event;

      const inviteeName = payload?.name;
      const inviteeEmail = payload?.email;

      const eventName = scheduledEvent?.name;
      const startTimeStr = scheduledEvent?.start_time;
      const endTimeStr = scheduledEvent?.end_time;

      const createdBy = event.created_by;
      const eventMemberships = scheduledEvent?.event_memberships || [];

      console.info('Event Memberships (detailed):', JSON.stringify(eventMemberships, null, 2));

      console.info('New Calendly Booking:', {
        inviteeName,
        inviteeEmail,
        eventName,
        startTime: startTimeStr,
        therapistUri: createdBy,
        eventMemberships,
      });

      if (inviteeName && inviteeEmail && scheduledEvent && startTimeStr && endTimeStr) {
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);
        const therapistUserId = createdBy ? createdBy.split('/').pop() : null;

        // Look up user by email and therapist from JSON
        // Pass scheduled event URI and eventMemberships to help match therapist
        const eventUri: string | null = scheduledEvent.uri || null;
        const { userId, therapistJsonId, therapistName, therapist } =
          await lookupUserAndTherapist(inviteeEmail, therapistUserId, eventUri, eventMemberships);

        // Get therapist name from event if available (for redundancy)
        // Try to get from event memberships or use a default
        const finalTherapistName =
          therapistName ||
          eventMemberships?.[0]?.user_name ||
          eventMemberships?.[0]?.user_email ||
          'Unknown Therapist';

        // Determine session type by matching event URI with booking URLs
        const sessionType = determineSessionType(scheduledEvent?.uri || null, therapist);

        // Create bookedSessions entry if we have userEmail and eventUri
        if (inviteeEmail && scheduledEvent?.uri) {
          try {
            const inviteeUri = payload?.uri;
            await createBookedSession(
              userId,
              inviteeEmail,
              therapistJsonId,
              finalTherapistName,
              eventName || null,
              startTime,
              endTime,
              scheduledEvent.uri,
              inviteeUri || null,
              sessionType,
            );
          } catch (insertError) {
            console.error('Error creating booked session:', insertError);
          }
        } else {
          console.warn('Skipping bookedSessions creation - missing required data:', {
            hasUserEmail: !!inviteeEmail,
            hasEventUri: !!scheduledEvent?.uri,
          });
        }
      }
    }

    // Handle cancellations
    if (event.event === 'invitee.canceled') {
      const payload = event.payload;
      const scheduledEvent = payload?.scheduled_event;

      const inviteeName = payload?.name;
      const inviteeEmail = payload?.email;
      const cancelReason = payload?.cancellation?.reason;

      const createdBy = event.created_by;
      const therapistUserId = createdBy ? createdBy.split('/').pop() : null;
      const inviteeUri = payload?.uri;
      const eventUri = scheduledEvent?.uri;

      console.info('Calendly Booking Canceled:', {
        inviteeName,
        inviteeEmail,
        cancelReason,
        therapistUri: createdBy,
        eventUri,
        inviteeUri,
      });

      // Find therapist from JSON for cancellation lookup
      const eventUriForLookup: string | null = eventUri ?? null;
      const eventMemberships = scheduledEvent?.event_memberships || [];
      const { therapistJsonId } = findTherapistFromJson(
        therapistUserId ?? null,
        eventUriForLookup,
        eventMemberships,
      );

      // Update bookedSessions entry to mark as cancelled
      if (eventUri) {
        try {
          await cancelBookedSession(
            eventUri,
            inviteeEmail || null,
            therapistJsonId,
            scheduledEvent?.start_time || null,
            cancelReason || null,
          );
        } catch (updateError) {
          console.error('Error updating booked session cancellation:', updateError);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
