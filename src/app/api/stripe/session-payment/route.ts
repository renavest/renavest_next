import { currentUser } from '@clerk/nextjs/server';
import { eq, and, gte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import {
  users,
  therapists,
  bookingSessions,
  sessionPayments,
  employerSubsidies,
  stripeCustomers,
} from '@/src/db/schema';
import { stripe, getOrCreateStripeCustomer } from '@/src/features/stripe';

// POST - Create PaymentIntent for session payment
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

    // Check for available employer subsidies
    const availableSubsidies = await db
      .select()
      .from(employerSubsidies)
      .where(
        and(
          eq(employerSubsidies.userId, userId),
          gte(employerSubsidies.remainingCents, 1),
          // Only unexpired subsidies
          eq(employerSubsidies.expiresAt, null), // TODO: Add proper expiry check
        ),
      )
      .orderBy(employerSubsidies.createdAt); // Use oldest first

    // Calculate subsidy usage
    let subsidyUsedCents = 0;
    const subsidiesToUpdate: Array<{ id: number; remainingCredit: number }> = [];

    for (const subsidy of availableSubsidies) {
      const remainingToSubsidize = totalAmountCents - subsidyUsedCents;
      if (remainingToSubsidize <= 0) break;

      const subsidyToUse = Math.min(subsidy.remainingCents, remainingToSubsidize);
      subsidyUsedCents += subsidyToUse;

      const remainingCredit = subsidy.remainingCents - subsidyToUse;
      subsidiesToUpdate.push({ id: subsidy.id, remainingCredit });
    }

    const outOfPocketCents = totalAmountCents - subsidyUsedCents;

    // If fully subsidized, no payment needed
    if (outOfPocketCents <= 0) {
      // Create a record showing the session was paid via subsidy
      await db.transaction(async (tx) => {
        // Update subsidies
        for (const update of subsidiesToUpdate) {
          if (update.remainingCredit <= 0) {
            await tx.delete(employerSubsidies).where(eq(employerSubsidies.id, update.id));
          } else {
            await tx
              .update(employerSubsidies)
              .set({ remainingCents: update.remainingCredit })
              .where(eq(employerSubsidies.id, update.id));
          }
        }

        // Create session payment record
        await tx.insert(sessionPayments).values({
          bookingSessionId,
          userId,
          stripePaymentIntentId: `subsidy_${bookingSessionId}_${Date.now()}`,
          totalAmountCents,
          subsidyUsedCents,
          outOfPocketCents: 0,
          status: 'succeeded',
          chargedAt: new Date(),
        });

        // Update booking session
        await tx
          .update(bookingSessions)
          .set({ status: 'completed' })
          .where(eq(bookingSessions.id, bookingSessionId));
      });

      return NextResponse.json({
        fullySubsidized: true,
        totalAmount: totalAmountCents,
        subsidyUsed: subsidyUsedCents,
        outOfPocket: 0,
      });
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // Calculate platform fee (10% of total amount)
    const applicationFeeAmount = Math.round(totalAmountCents * 0.1);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: outOfPocketCents,
      currency: 'usd',
      customer: stripeCustomerId,
      capture_method: 'manual', // 36-hour delay
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: therapistData.stripeAccountId,
      },
      metadata: {
        bookingSessionId: bookingSessionId.toString(),
        userId: userId.toString(),
        therapistId: therapistData.id.toString(),
        subsidyUsedCents: subsidyUsedCents.toString(),
        totalAmountCents: totalAmountCents.toString(),
      },
    });

    // Store payment record and update subsidies in transaction
    await db.transaction(async (tx) => {
      // Update subsidies
      for (const update of subsidiesToUpdate) {
        if (update.remainingCredit <= 0) {
          await tx.delete(employerSubsidies).where(eq(employerSubsidies.id, update.id));
        } else {
          await tx
            .update(employerSubsidies)
            .set({ remainingCents: update.remainingCredit })
            .where(eq(employerSubsidies.id, update.id));
        }
      }

      // Create session payment record
      await tx.insert(sessionPayments).values({
        bookingSessionId,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        totalAmountCents,
        subsidyUsedCents,
        outOfPocketCents,
        status: 'pending',
      });
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: totalAmountCents,
      subsidyUsed: subsidyUsedCents,
      outOfPocket: outOfPocketCents,
      paymentIntentId: paymentIntent.id,
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
