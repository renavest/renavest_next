import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import { getSubscriptionStatus } from '@/src/features/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/user/subscription-status
 *
 * Returns detailed subscription status for the current user
 * Includes subscription validity, employer subsidies, and feature access
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', hasActiveSubscription: false },
        { status: 401 },
      );
    }

    // Get the internal user record
    const userRecord = await db
      .select({
        id: users.id,
        role: users.role,
        employerId: users.employerId,
        subscriptionStatus: users.subscriptionStatus,
        stripeSubscriptionId: users.stripeSubscriptionId,
        subscriptionEndDate: users.subscriptionEndDate,
        cancelAtPeriodEnd: users.cancelAtPeriodEnd,
      })
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found', hasActiveSubscription: false },
        { status: 404 },
      );
    }

    const userData = userRecord[0];

    // Check if user has a Stripe customer record
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userData.id))
      .limit(1);

    let subscriptionData = null;
    let hasActiveSubscription = false;
    let subscriptionSource = 'none';

    if (customerRecord.length > 0) {
      // Get real-time subscription status from Stripe
      try {
        subscriptionData = await getSubscriptionStatus(customerRecord[0].stripeCustomerId);
        hasActiveSubscription = Boolean(
          subscriptionData.status && ['active', 'trialing'].includes(subscriptionData.status),
        );
        if (hasActiveSubscription) {
          subscriptionSource = 'individual';
        }
      } catch (error) {
        console.error('[SUBSCRIPTION STATUS] Error fetching from Stripe:', error);
        // Fallback to database record
        hasActiveSubscription = Boolean(
          userData.subscriptionStatus &&
            ['active', 'trialing'].includes(userData.subscriptionStatus),
        );
        if (hasActiveSubscription) {
          subscriptionSource = 'individual';
        }
      }
    }

    // Check for employer-sponsored subscription benefits
    let employerBenefits = null;
    if (userData.employerId) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/subscriptions/sponsored`,
          {
            headers: {
              Authorization: `Bearer ${await user.getToken()}`,
            },
          },
        );

        if (response.ok) {
          employerBenefits = await response.json();
          if (employerBenefits.eligible && !hasActiveSubscription) {
            hasActiveSubscription = true;
            subscriptionSource = 'employer';
          }
        }
      } catch (error) {
        console.error('[SUBSCRIPTION STATUS] Error checking employer benefits:', error);
      }
    }

    // Determine feature access levels
    const featureAccess = {
      chat: hasActiveSubscription,
      prioritySupport: hasActiveSubscription,
      aiMatching: hasActiveSubscription,
      sessionBooking: true, // Basic feature for all users
      billingManagement: hasActiveSubscription,
    };

    return NextResponse.json({
      hasActiveSubscription,
      subscriptionSource,
      subscription: subscriptionData,
      employerBenefits,
      featureAccess,
      user: {
        id: userData.id,
        role: userData.role,
        hasEmployer: Boolean(userData.employerId),
      },
    });
  } catch (error) {
    console.error('[SUBSCRIPTION STATUS API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        hasActiveSubscription: false,
      },
      { status: 500 },
    );
  }
}
