import { eq, and, lte } from 'drizzle-orm';

import { db } from '@/src/db';
import { bookingSessions, sessionPayments } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

import { stripe } from './stripe-client';

/**
 * Service for managing session completion and payment processing
 */
export class SessionCompletionService {
  /**
   * Mark a session as completed by therapist confirmation
   */
  static async markSessionCompleted(
    sessionId: number,
    therapistId: number,
    completedByTherapist = true,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Verify the session belongs to the therapist
      const session = await db.query.bookingSessions.findFirst({
        where: and(eq(bookingSessions.id, sessionId), eq(bookingSessions.therapistId, therapistId)),
      });

      if (!session) {
        return { success: false, message: 'Session not found or unauthorized' };
      }

      if (session.status === 'completed') {
        return { success: false, message: 'Session already completed' };
      }

      // Update session status
      await db
        .update(bookingSessions)
        .set({
          status: 'completed',
          metadata: {
            ...(session.metadata as object),
            completedByTherapist,
            completedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(bookingSessions.id, sessionId));

      // Process any pending payments for this session
      await this.processSessionPayment(sessionId);

      return { success: true };
    } catch (error) {
      console.error('Error marking session completed:', error);
      return { success: false, message: 'Failed to mark session as completed' };
    }
  }

  /**
   * Process payment for a completed session
   */
  static async processSessionPayment(sessionId: number): Promise<void> {
    try {
      // Find any pending payment intents for this session
      const payment = await db.query.sessionPayments.findFirst({
        where: and(
          eq(sessionPayments.bookingSessionId, sessionId),
          eq(sessionPayments.status, 'pending'),
        ),
      });

      if (!payment) {
        console.log(`No pending payments found for session ${sessionId}`);
        return;
      }

      // Check if payment intent exists and capture it
      if (payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith('subsidy_')) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

          if (paymentIntent.status === 'requires_capture') {
            await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
            console.log(
              `Captured payment intent ${payment.stripePaymentIntentId} for session ${sessionId}`,
            );
          } else if (paymentIntent.status === 'succeeded') {
            console.log(`Payment intent ${payment.stripePaymentIntentId} already succeeded`);
          }
        } catch (stripeError) {
          console.error(`Error processing Stripe payment for session ${sessionId}:`, stripeError);
        }
      }
    } catch (error) {
      console.error(`Error processing session payment for session ${sessionId}:`, error);
    }
  }

  /**
   * Get sessions that are eligible for auto-completion (24+ hours after session time)
   */
  static async getEligibleSessionsForAutoCompletion(): Promise<
    Array<{
      id: number;
      therapistId: number;
      sessionEndTime: Date;
      status: string;
    }>
  > {
    const twentyFourHoursAgo = createDate(new Date()).minus({ hours: 24 }).toJSDate();

    return await db
      .select({
        id: bookingSessions.id,
        therapistId: bookingSessions.therapistId,
        sessionEndTime: bookingSessions.sessionEndTime,
        status: bookingSessions.status,
      })
      .from(bookingSessions)
      .where(
        and(
          eq(bookingSessions.status, 'confirmed'),
          lte(bookingSessions.sessionEndTime, twentyFourHoursAgo),
        ),
      );
  }

  /**
   * Auto-complete sessions that are 24+ hours past their end time
   * This should be called by a scheduled job
   */
  static async autoCompleteEligibleSessions(): Promise<{
    processed: number;
    completed: number;
    errors: Array<{ sessionId: number; error: string }>;
  }> {
    const eligibleSessions = await this.getEligibleSessionsForAutoCompletion();
    const results = {
      processed: eligibleSessions.length,
      completed: 0,
      errors: [] as Array<{ sessionId: number; error: string }>,
    };

    for (const session of eligibleSessions) {
      try {
        const result = await this.markSessionCompleted(
          session.id,
          session.therapistId,
          false, // Not completed by therapist, auto-completed
        );

        if (result.success) {
          results.completed++;
          console.log(`Auto-completed session ${session.id}`);
        } else {
          results.errors.push({
            sessionId: session.id,
            error: result.message || 'Unknown error',
          });
        }
      } catch (error) {
        results.errors.push({
          sessionId: session.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Auto-completion results:`, results);
    return results;
  }

  /**
   * Get sessions for a therapist that can be manually marked as completed
   */
  static async getCompletableSessionsForTherapist(therapistId: number): Promise<
    Array<{
      id: number;
      sessionDate: Date;
      sessionStartTime: Date;
      sessionEndTime: Date;
      status: string;
      clientName?: string;
    }>
  > {
    // Get sessions that are confirmed and have ended (but not yet completed)
    const now = new Date();

    const sessions = await db.query.bookingSessions.findMany({
      where: and(
        eq(bookingSessions.therapistId, therapistId),
        eq(bookingSessions.status, 'confirmed'),
        lte(bookingSessions.sessionEndTime, now),
      ),
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: (bookingSessions, { desc }) => [desc(bookingSessions.sessionDate)],
    });

    return sessions.map((session) => ({
      id: session.id,
      sessionDate: session.sessionDate,
      sessionStartTime: session.sessionStartTime,
      sessionEndTime: session.sessionEndTime,
      status: session.status,
      clientName: session.user
        ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim()
        : undefined,
    }));
  }
}
