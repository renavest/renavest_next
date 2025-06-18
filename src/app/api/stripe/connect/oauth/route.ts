import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import { hasRole } from '@/src/features/auth/utils/routeMapping';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// GET - Initiate Stripe Connect OAuth flow for therapist
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has therapist role using the auth utilities
    if (!hasRole(user, 'therapist')) {
      return NextResponse.json(
        { error: 'Only therapists can access this endpoint' },
        { status: 403 },
      );
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Get therapist record
    const therapistRecord = await db
      .select({
        id: therapists.id,
        name: therapists.name,
        stripeAccountId: therapists.stripeAccountId,
      })
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapist = therapistRecord[0];

    // If already connected, check status
    if (therapist.stripeAccountId) {
      try {
        const account = await stripe.accounts.retrieve(therapist.stripeAccountId);

        if (account.charges_enabled && account.payouts_enabled) {
          return NextResponse.json({
            connected: true,
            message: 'Bank account already connected and active',
          });
        }

        // If account exists but needs completion, create account link
        const accountLink = await stripe.accountLinks.create({
          account: therapist.stripeAccountId,
          refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/therapist/integrations?tab=stripe&refresh=true`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/therapist/integrations?tab=stripe&success=true`,
          type: 'account_onboarding',
        });

        return NextResponse.json({
          connected: false,
          url: accountLink.url,
          message: 'Complete your bank account setup',
        });
      } catch (error) {
        console.error('Error retrieving existing account:', error);
        // Continue to create new account
      }
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // TODO: Make this dynamic based on therapist location
      email: user.emailAddresses[0]?.emailAddress,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual', // Most therapists will be individuals
      individual: {
        email: user.emailAddresses[0]?.emailAddress,
        first_name: user.firstName || undefined,
        last_name: user.lastName || undefined,
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'daily', // Faster payouts for therapists
          },
        },
      },
      metadata: {
        therapist_id: therapist.id.toString(),
        user_id: userId.toString(),
      },
    });

    // Save the Stripe account ID to our database
    await db
      .update(therapists)
      .set({
        stripeAccountId: account.id,
        onboardingStatus: 'pending',
      })
      .where(eq(therapists.id, therapist.id));

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/therapist/integrations?tab=stripe&refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/therapist/integrations?tab=stripe&success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      connected: false,
      url: accountLink.url,
      accountId: account.id,
      message: 'Bank account setup initiated',
    });
  } catch (error) {
    console.error('[STRIPE CONNECT OAUTH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
