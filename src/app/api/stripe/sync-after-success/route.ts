import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import { stripe, syncStripeDataToKV } from '@/src/features/stripe';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Get the Stripe customer ID for this user
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userId))
      .limit(1);

    if (customerRecord.length === 0) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const stripeCustomerId = customerRecord[0].stripeCustomerId;

    // Eagerly sync the customer data to ensure consistency
    // This prevents race conditions where the user sees the success page
    // before webhooks have fully processed
    const syncedData = await syncStripeDataToKV(stripeCustomerId);

    console.log(`[SYNC AFTER SUCCESS] Synced data for customer ${stripeCustomerId}:`, syncedData);

    return NextResponse.json({
      success: true,
      message: 'Subscription data synced successfully',
      subscriptionStatus: syncedData.status,
    });
  } catch (error) {
    console.error('[SYNC AFTER SUCCESS] Error syncing customer data:', error);
    return NextResponse.json({ error: 'Failed to sync subscription data' }, { status: 500 });
  }
}
