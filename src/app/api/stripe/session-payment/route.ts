import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists, bookingSessions, sessionPayments } from '@/src/db/schema';
import { stripe, getOrCreateStripeCustomer } from '@/src/features/stripe';
import {
  calculateSessionSubsidies,
  applySubsidies,
  type SubsidyApplicationData,
} from '@/src/services/subsidyCalculation';

// POST - Create PaymentIntent for session payment with comprehensive subsidy logic
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingSessionId } = body;

    if (!bookingSessionId) {
      return NextResponse.json({ error: 'Booking session ID is required' }, { status: 400 });
    }

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

    // Get the booking session
    const bookingSession = await db
      .select({
        id: bookingSessions.id,
        therapistId: bookingSessions.therapistId,
        sessionDate: bookingSessions.sessionDate,
        status: bookingSessions.status,
      })
      .from(bookingSessions)
      .where(
        and(
          eq(bookingSessions.id, bookingSessionId),
          eq(bookingSessions.userId, userId),
          eq(bookingSessions.status, 'confirmed'),
        ),
      )
      .limit(1);

    if (bookingSession.length === 0) {
      return NextResponse.json(
        { error: 'Booking session not found or not eligible for payment' },
        { status: 404 },
      );
    }

    const session = bookingSession[0];

    // Get therapist details
    const therapist = await db
      .select({
        id: therapists.id,
        stripeAccountId: therapists.stripeAccountId,
        hourlyRateCents: therapists.hourlyRateCents,
      })
      .from(therapists)
      .where(eq(therapists.id, session.therapistId))
      .limit(1);

    if (therapist.length === 0 || !therapist[0].stripeAccountId) {
      return NextResponse.json(
        { error: 'Therapist not found or not set up for payments' },
        { status: 400 },
      );
    }

    const therapistData = therapist[0];

    // Calculate session cost (assuming 1-hour sessions)
    const totalAmountCents = therapistData.hourlyRateCents || 0;

    if (totalAmountCents <= 0) {
      return NextResponse.json({ error: 'Invalid session cost' }, { status: 400 });
    }

    // Calculate subsidies using the comprehensive subsidy service
    const subsidyData: SubsidyApplicationData = {
      userId,
      totalSessionCostCents: totalAmountCents,
      bookingSessionId,
    };

    const subsidyResult = await calculateSessionSubsidies(subsidyData);

    // If fully subsidized, no payment needed
    if (subsidyResult.fullySubsidized) {
      // Apply subsidies and create records within a transaction
      await db.transaction(async (tx) => {
        // Apply all subsidy updates
        await applySubsidies(subsidyResult, subsidyData, tx);

        // Create session payment record
        await tx.insert(sessionPayments).values({
          bookingSessionId,
          userId,
          totalAmountCents: subsidyResult.totalAmountCents,
          subsidyUsedCents: subsidyResult.totalSubsidyUsedCents,
          outOfPocketCents: 0,
          status: 'succeeded',
          chargedAt: new Date(),
        });

        // Update booking session status
        await tx
          .update(bookingSessions)
          .set({ status: 'completed' })
          .where(eq(bookingSessions.id, bookingSessionId));
      });

      return NextResponse.json({
        fullySubsidized: true,
        totalAmount: subsidyResult.totalAmountCents,
        subsidyBreakdown: {
          fromSponsoredGroup: subsidyResult.subsidyFromGroupCents,
          fromDirectEmployerSubsidy: subsidyResult.subsidyFromEmployerDirectCents,
          fromEmployerPercentage: subsidyResult.subsidyFromEmployerPercentageCents,
          total: subsidyResult.totalSubsidyUsedCents,
        },
        outOfPocket: 0,
        sponsoringGroupId: subsidyResult.sponsoringGroupId,
      });
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // Calculate platform fee (10% of total amount)
    const applicationFeeAmount = Math.round(totalAmountCents * 0.1);

    // Create PaymentIntent for the out-of-pocket amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: subsidyResult.outOfPocketCents,
      currency: 'usd',
      customer: stripeCustomerId,
      capture_method: 'manual', // Use manual capture to delay payment until session completion
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Prevent redirects for therapy session payments
      },
      application_fee_amount: Math.round(
        applicationFeeAmount * (subsidyResult.outOfPocketCents / totalAmountCents),
      ), // Proportional fee
      transfer_data: {
        destination: therapistData.stripeAccountId!,
      },
      metadata: {
        bookingSessionId: bookingSessionId.toString(),
        userId: userId.toString(),
        therapistId: therapistData.id.toString(),
        totalAmountCents: subsidyResult.totalAmountCents.toString(),
        subsidyFromGroupCents: subsidyResult.subsidyFromGroupCents.toString(),
        subsidyFromEmployerDirectCents: subsidyResult.subsidyFromEmployerDirectCents.toString(),
        subsidyFromEmployerPercentageCents:
          subsidyResult.subsidyFromEmployerPercentageCents.toString(),
        totalSubsidyUsedCents: subsidyResult.totalSubsidyUsedCents.toString(),
        sponsoringGroupId: subsidyResult.sponsoringGroupId?.toString() || '',
      },
    });

    // Store payment record and apply subsidies in transaction
    await db.transaction(async (tx) => {
      // Apply all subsidy updates
      await applySubsidies(subsidyResult, subsidyData, tx);

      // Create session payment record
      await tx.insert(sessionPayments).values({
        bookingSessionId,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        totalAmountCents: subsidyResult.totalAmountCents,
        subsidyUsedCents: subsidyResult.totalSubsidyUsedCents,
        outOfPocketCents: subsidyResult.outOfPocketCents,
        status: 'pending',
      });
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: subsidyResult.totalAmountCents,
      subsidyBreakdown: {
        fromSponsoredGroup: subsidyResult.subsidyFromGroupCents,
        fromDirectEmployerSubsidy: subsidyResult.subsidyFromEmployerDirectCents,
        fromEmployerPercentage: subsidyResult.subsidyFromEmployerPercentageCents,
        total: subsidyResult.totalSubsidyUsedCents,
      },
      outOfPocket: subsidyResult.outOfPocketCents,
      paymentIntentId: paymentIntent.id,
      sponsoringGroupId: subsidyResult.sponsoringGroupId,
    });
  } catch (error) {
    console.error('[SESSION PAYMENT API] Error creating payment intent:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}

// PATCH - Capture PaymentIntent (backend only)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    // Capture the payment intent
    const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return NextResponse.json({
      success: true,
      paymentIntentId: capturedPaymentIntent.id,
      status: capturedPaymentIntent.status,
    });
  } catch (error) {
    console.error('[SESSION PAYMENT API] Error capturing payment intent:', error);
    return NextResponse.json({ error: 'Failed to capture payment intent' }, { status: 500 });
  }
}
