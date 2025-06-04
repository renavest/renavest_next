import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { users, employers, sponsoredGroups, sponsoredGroupMembers } from '@/src/db/schema';
import { stripe, getOrCreateStripeCustomer } from '@/src/features/stripe';

const SponsoredSubscriptionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

// POST - Create immediate subscription with employer sponsorship
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, successUrl, cancelUrl } = SponsoredSubscriptionSchema.parse(body);

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Check if user has employer sponsorship
    const userWithEmployer = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        employer: true,
      },
    });

    if (!userWithEmployer?.employer) {
      return NextResponse.json(
        {
          error: 'No employer sponsorship available. Please use regular subscription flow.',
        },
        { status: 400 },
      );
    }

    // Check if employer allows sponsored subscriptions (this could be a company-wide benefit)
    const employer = userWithEmployer.employer;

    // Check if user is in any sponsored groups that could cover subscriptions
    const sponsoredGroupMembership = await db.query.sponsoredGroupMembers.findFirst({
      where: and(
        eq(sponsoredGroupMembers.userId, userId),
        eq(sponsoredGroupMembers.isActive, true),
      ),
      with: {
        group: true,
      },
    });

    let paymentSource = 'company_wide';
    let sponsorName = employer.name;

    if (sponsoredGroupMembership?.group) {
      paymentSource = 'sponsored_group';
      sponsorName = `${employer.name} (${sponsoredGroupMembership.group.name})`;
    }

    // Get or create Stripe customer for the user
    const userStripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // For employer-sponsored subscriptions, we create a direct subscription
    // The employer's payment method would be set up separately in their admin panel
    const subscription = await stripe.subscriptions.create({
      customer: userStripeCustomerId,
      items: [
        {
          price: priceId,
        },
      ],
      metadata: {
        userId: userId.toString(),
        employerId: employer.id.toString(),
        sponsorshipType: paymentSource,
        sponsoredBy: sponsorName,
      },
      // For sponsored subscriptions, we can enable immediate activation
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Note: In a production environment, you'd want to:
    // 1. Set up the employer's payment method as the default for these subscriptions
    // 2. Handle billing coordination between employer and employee
    // 3. Track usage/costs for employer billing

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      status: subscription.status,
      sponsorInfo: {
        name: sponsorName,
        type: paymentSource,
      },
      redirectUrl:
        successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?sponsored=true`,
    });
  } catch (error) {
    console.error('[SPONSORED SUBSCRIPTION API] Error creating sponsored subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to create sponsored subscription' }, { status: 500 });
  }
}

// GET - Check if user is eligible for employer sponsorship
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Check employer relationship
    const userWithEmployer = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        employer: true,
      },
    });

    if (!userWithEmployer?.employer) {
      return NextResponse.json({
        eligible: false,
        reason: 'No employer relationship',
      });
    }

    // Check for sponsored group memberships
    const sponsoredGroups = await db.query.sponsoredGroupMembers.findMany({
      where: and(
        eq(sponsoredGroupMembers.userId, userId),
        eq(sponsoredGroupMembers.isActive, true),
      ),
      with: {
        group: true,
      },
    });

    const employer = userWithEmployer.employer;

    return NextResponse.json({
      eligible: true,
      employer: {
        id: employer.id,
        name: employer.name,
        allowsSponsorship: true, // This could be a database field
      },
      sponsoredGroups: sponsoredGroups.map((membership) => ({
        id: membership.group.id,
        name: membership.group.name,
        type: membership.group.groupType,
      })),
      defaultSubsidyPercentage: employer.defaultSubsidyPercentage,
    });
  } catch (error) {
    console.error('[SPONSORED SUBSCRIPTION API] Error checking eligibility:', error);
    return NextResponse.json({ error: 'Failed to check sponsorship eligibility' }, { status: 500 });
  }
}
