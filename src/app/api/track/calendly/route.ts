import { NextRequest, NextResponse } from 'next/server';

import PostHogClient from '@/posthog'; // Adjust path as needed
import { db } from '@/src/db'; // Import database client

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, therapistId, therapistName, eventData, userEmail } = body;

    // Find user by email to get consistent identification
    const user = userEmail
      ? await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, userEmail),
        })
      : null;

    // Initialize server-side PostHog client
    const posthogClient = PostHogClient();
    console.log('eventType', eventType);

    // Track the event
    posthogClient.capture({
      distinctId: user?.clerkId || therapistId || 'unknown_user',
      event: eventType,
      properties: {
        $set_once: user
          ? {
              email: userEmail,
              first_name: user.firstName,
              last_name: user.lastName,
              clerk_id: user.clerkId,
            }
          : {},
        therapist_id: therapistId,
        therapist_name: therapistName,
        event_details: eventData,
        user_email: userEmail,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Event tracked successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error tracking Calendly event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to track event',
      },
      { status: 500 },
    );
  }
}

// Server-side tracking function for session search
export async function trackSessionSearch(params: {
  therapistId: string;
  therapistName: string;
  userId: string;
  userEmail: string;
}) {
  try {
    const posthogClient = PostHogClient();

    // Find user to get consistent identification
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, params.userEmail),
    });

    posthogClient.capture({
      distinctId: user?.clerkId || params.userId,
      event: 'session_search_initiated',
      properties: {
        $set_once: user
          ? {
              email: params.userEmail,
              first_name: user.firstName,
              last_name: user.lastName,
              clerk_id: user.clerkId,
            }
          : {},
        therapist_id: params.therapistId,
        therapist_name: params.therapistName,
        user_id: params.userId,
        user_email: params.userEmail,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking session search:', error);
    return { success: false };
  }
}
