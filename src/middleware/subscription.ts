import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import { getSubscriptionStatus } from '@/src/features/stripe';

/**
 * Middleware to check if user has an active subscription
 * Used to protect premium API routes like chat functionality
 */
export async function requireActiveSubscription(_request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    // Get user record from database
    const userRecord = await db
      .select({
        id: users.id,
        subscriptionStatus: users.subscriptionStatus,
        employerId: users.employerId,
      })
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 },
      );
    }

    const userData = userRecord[0];
    let hasActiveSubscription = false;

    // Check individual subscription status
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userData.id))
      .limit(1);

    if (customerRecord.length > 0) {
      try {
        const subscriptionData = await getSubscriptionStatus(customerRecord[0].stripeCustomerId);
        hasActiveSubscription = Boolean(
          subscriptionData.status && ['active', 'trialing'].includes(subscriptionData.status),
        );
      } catch (error) {
        console.error('[SUBSCRIPTION MIDDLEWARE] Error checking subscription:', error);
        // Fallback to database status
        hasActiveSubscription = Boolean(
          userData.subscriptionStatus &&
            ['active', 'trialing'].includes(userData.subscriptionStatus),
        );
      }
    }

    // Check for employer-sponsored benefits if no individual subscription
    if (!hasActiveSubscription && userData.employerId) {
      try {
        // Check employer sponsorship eligibility
        const sponsorshipResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/subscriptions/sponsored`,
        );

        if (sponsorshipResponse.ok) {
          const sponsorshipData = await sponsorshipResponse.json();
          hasActiveSubscription = sponsorshipData.eligible;
        }
      } catch (error) {
        console.error('[SUBSCRIPTION MIDDLEWARE] Error checking employer benefits:', error);
      }
    }

    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: 'Active subscription required',
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'This feature requires an active Renavest subscription.',
          upgradeUrl: '/billing',
        },
        { status: 403 },
      );
    }

    // User has active subscription, continue to the protected route
    return null; // null means continue processing
  } catch (error) {
    console.error('[SUBSCRIPTION MIDDLEWARE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

/**
 * Helper function to check subscription status without blocking the request
 * Returns subscription details for conditional feature access
 */
export async function getSubscriptionInfo() {
  try {
    const user = await currentUser();

    if (!user) {
      return { hasActiveSubscription: false, subscriptionSource: 'none' };
    }

    const userRecord = await db
      .select({
        id: users.id,
        subscriptionStatus: users.subscriptionStatus,
        employerId: users.employerId,
      })
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return { hasActiveSubscription: false, subscriptionSource: 'none' };
    }

    const userData = userRecord[0];
    let hasActiveSubscription = false;
    let subscriptionSource = 'none';

    // Check individual subscription
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userData.id))
      .limit(1);

    if (customerRecord.length > 0) {
      try {
        const subscriptionData = await getSubscriptionStatus(customerRecord[0].stripeCustomerId);
        hasActiveSubscription = Boolean(
          subscriptionData.status && ['active', 'trialing'].includes(subscriptionData.status),
        );
        if (hasActiveSubscription) {
          subscriptionSource = 'individual';
        }
      } catch (error) {
        console.error('[SUBSCRIPTION INFO] Error checking subscription:', error);
        hasActiveSubscription = Boolean(
          userData.subscriptionStatus &&
            ['active', 'trialing'].includes(userData.subscriptionStatus),
        );
        if (hasActiveSubscription) {
          subscriptionSource = 'individual';
        }
      }
    }

    // Check employer benefits
    if (!hasActiveSubscription && userData.employerId) {
      // Note: In practice, you might want to cache this check
      subscriptionSource = 'employer_eligible';
    }

    return {
      hasActiveSubscription,
      subscriptionSource,
      userId: userData.id,
    };
  } catch (error) {
    console.error('[SUBSCRIPTION INFO] Error:', error);
    return { hasActiveSubscription: false, subscriptionSource: 'error' };
  }
}
