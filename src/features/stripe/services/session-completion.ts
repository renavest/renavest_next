import { eq, and, lte } from 'drizzle-orm';

import { db } from '@/src/db';
import { bookingSessions, sessionPayments } from '@/src/db/schema';
import { sessionNotificationService } from '@/src/features/notifications/services/session-notifications';
import { paymentLogger } from '@/src/lib/logger';
import { retryService } from '@/src/lib/retry';
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
    const logContext = { sessionId, therapistId };

    try {
      paymentLogger.debug('Starting session completion process', logContext);

      // Verify the session belongs to the therapist
      const session = await db.query.bookingSessions.findFirst({
        where: and(eq(bookingSessions.id, sessionId), eq(bookingSessions.therapistId, therapistId)),
        with: {
          user: {
            columns: {
              id: true,
              clerkId: true,
            },
          },
        },
      });

      if (!session) {
        paymentLogger.warn('Session completion failed: unauthorized or not found', logContext);
        return { success: false, message: 'Session not found or unauthorized' };
      }

      const enhancedContext = {
        ...logContext,
        userId: session.user?.clerkId,
        amount:
          session.metadata && typeof session.metadata === 'object' && 'amount' in session.metadata
            ? Number((session.metadata as Record<string, unknown>).amount) || undefined
            : undefined,
      };

      if (session.status === 'completed') {
        paymentLogger.warn('Session completion failed: already completed', enhancedContext);
        return { success: false, message: 'Session already completed' };
      }

      // Validate session timing
      const now = new Date();
      if (session.sessionEndTime > now) {
        paymentLogger.warn(
          'Session completion failed: session has not ended yet',
          enhancedContext,
          {
            sessionEndTime: session.sessionEndTime,
            currentTime: now,
          },
        );
        return { success: false, message: 'Session has not ended yet' };
      }

      paymentLogger.debug('Session validation passed, updating status', enhancedContext);

      // Update session status with retry logic
      const updateResult = await retryService.executeWithRetry(
        async () => {
          return db
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
        },
        enhancedContext,
        'update_session_status',
      );

      if (!updateResult.success) {
        paymentLogger.error(
          'Failed to update session status',
          enhancedContext,
          updateResult.error!,
        );
        return { success: false, message: 'Failed to update session status' };
      }

      paymentLogger.sessionCompleted(enhancedContext, {
        completedByTherapist,
        attempts: updateResult.attempts,
      });

      // Process any pending payments for this session
      await this.processSessionPayment(sessionId, enhancedContext);

      return { success: true };
    } catch (error) {
      paymentLogger.error('Unexpected error in session completion', logContext, error as Error);
      return { success: false, message: 'Failed to mark session as completed' };
    }
  }

  /**
   * Process payment for a completed session
   */
  static async processSessionPayment(sessionId: number, logContext?: any): Promise<void> {
    const context = logContext || { sessionId };

    try {
      paymentLogger.debug('Starting payment processing for completed session', context);

      // Find any pending payment intents for this session
      const payment = await db.query.sessionPayments.findFirst({
        where: and(
          eq(sessionPayments.bookingSessionId, sessionId),
          eq(sessionPayments.status, 'pending'),
        ),
      });

      if (!payment) {
        paymentLogger.debug('No pending payments found for session', context);
        return;
      }

      const enhancedContext = {
        ...context,
        paymentIntentId: payment.stripePaymentIntentId,
        amount: payment.totalAmountCents,
      };

      paymentLogger.debug('Found pending payment, processing', enhancedContext);

      // Check if payment intent exists and capture it
      if (payment.stripePaymentIntentId && !payment.stripePaymentIntentId.startsWith('subsidy_')) {
        const captureResult = await retryService.capturePaymentIntent(async () => {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            payment.stripePaymentIntentId!,
          );

          if (paymentIntent.status === 'requires_capture') {
            paymentLogger.debug('Capturing payment intent', enhancedContext);
            const captured = await stripe.paymentIntents.capture(payment.stripePaymentIntentId!);

            // Update payment status in database
            await db
              .update(sessionPayments)
              .set({
                status: 'succeeded',
                updatedAt: new Date(),
              })
              .where(eq(sessionPayments.id, payment.id));

            return captured;
          } else if (paymentIntent.status === 'succeeded') {
            paymentLogger.debug('Payment intent already succeeded', enhancedContext);

            // Update payment status in database
            await db
              .update(sessionPayments)
              .set({
                status: 'succeeded',
                updatedAt: new Date(),
              })
              .where(eq(sessionPayments.id, payment.id));

            return paymentIntent;
          } else {
            throw new Error(`Payment intent in unexpected status: ${paymentIntent.status}`);
          }
        }, enhancedContext);

        if (captureResult.success) {
          paymentLogger.paymentCaptured(enhancedContext, {
            attempts: captureResult.attempts,
            totalTime: captureResult.totalTime,
          });
        } else {
          paymentLogger.error(
            'Failed to capture payment after retries',
            enhancedContext,
            captureResult.error!,
          );
        }
      } else if (payment.stripePaymentIntentId?.startsWith('subsidy_')) {
        paymentLogger.debug('Payment is fully subsidized, marking as completed', enhancedContext);

        // Update payment status for subsidized payments
        await db
          .update(sessionPayments)
          .set({
            status: 'succeeded',
            updatedAt: new Date(),
          })
          .where(eq(sessionPayments.id, payment.id));
      }
    } catch (error) {
      paymentLogger.error('Error processing session payment', context, error as Error);
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
