import { paymentLogger } from '@/src/lib/logger';
import { retryService } from '@/src/lib/retry';

export interface SessionNotification {
  sessionId: number;
  clientEmail: string;
  clientName: string;
  therapistName: string;
  sessionDate: Date;
  sessionAmount?: number;
  paymentRequired: boolean;
  completedByTherapist: boolean;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

class SessionNotificationService {
  /**
   * Send session completion notification to client
   */
  async notifySessionCompleted(notification: SessionNotification): Promise<NotificationResult> {
    const logContext = {
      sessionId: notification.sessionId,
      userId: notification.clientEmail,
    };

    try {
      paymentLogger.debug('Sending session completion notification', logContext, {
        clientEmail: notification.clientEmail,
        therapistName: notification.therapistName,
        paymentRequired: notification.paymentRequired,
      });

      // Send email notification with retry logic
      const emailResult = await retryService.executeWithRetry(
        async () => {
          return this.sendSessionCompletionEmail(notification);
        },
        logContext,
        'send_session_completion_email',
      );

      if (!emailResult.success) {
        paymentLogger.error(
          'Failed to send session completion email',
          logContext,
          emailResult.error!,
        );
        return {
          success: false,
          error: 'Failed to send notification email',
        };
      }

      // Send in-app notification if applicable
      await this.sendInAppNotification(notification);

      paymentLogger.debug('Session completion notification sent successfully', logContext, {
        notificationId: emailResult.data?.id,
        attempts: emailResult.attempts,
      });

      return {
        success: true,
        notificationId: emailResult.data?.id,
      };
    } catch (error) {
      paymentLogger.error(
        'Unexpected error sending session completion notification',
        logContext,
        error as Error,
      );
      return {
        success: false,
        error: 'Unexpected error occurred',
      };
    }
  }

  /**
   * Send session completion email
   */
  private async sendSessionCompletionEmail(
    notification: SessionNotification,
  ): Promise<{ id: string }> {
    const emailData = {
      to: notification.clientEmail,
      subject: `Session Completed - ${notification.therapistName}`,
      template: 'session-completion',
      data: {
        clientName: notification.clientName,
        therapistName: notification.therapistName,
        sessionDate: notification.sessionDate.toLocaleDateString(),
        sessionTime: notification.sessionDate.toLocaleTimeString(),
        paymentRequired: notification.paymentRequired,
        sessionAmount: notification.sessionAmount,
        completedByTherapist: notification.completedByTherapist,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/employee`,
      },
    };

    // Use your email service (e.g., Resend, SendGrid, etc.)
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return response.json();
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(notification: SessionNotification): Promise<void> {
    try {
      const notificationData = {
        userId: notification.clientEmail, // or user ID
        type: 'session_completed',
        title: 'Session Completed',
        message: `Your session with ${notification.therapistName} has been completed.`,
        metadata: {
          sessionId: notification.sessionId,
          therapistName: notification.therapistName,
          paymentRequired: notification.paymentRequired,
        },
      };

      // Send to your in-app notification service
      await fetch('/api/notifications/in-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      // Don't fail the main notification if in-app notification fails
      paymentLogger.warn(
        'Failed to send in-app notification',
        { sessionId: notification.sessionId },
        { error: error instanceof Error ? error.message : 'Unknown error' },
      );
    }
  }

  /**
   * Send payment reminder to client
   */
  async notifyPaymentRequired(notification: SessionNotification): Promise<NotificationResult> {
    const logContext = {
      sessionId: notification.sessionId,
      userId: notification.clientEmail,
    };

    try {
      paymentLogger.debug('Sending payment required notification', logContext);

      const emailData = {
        to: notification.clientEmail,
        subject: `Payment Required - Session with ${notification.therapistName}`,
        template: 'payment-required',
        data: {
          clientName: notification.clientName,
          therapistName: notification.therapistName,
          sessionAmount: notification.sessionAmount,
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/employee/payments?session=${notification.sessionId}`,
        },
      };

      const emailResult = await retryService.executeWithRetry(
        async () => {
          const response = await fetch('/api/notifications/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send payment reminder');
          }

          return response.json();
        },
        logContext,
        'send_payment_reminder_email',
      );

      if (emailResult.success) {
        paymentLogger.debug('Payment reminder sent successfully', logContext);
        return {
          success: true,
          notificationId: emailResult.data?.id,
        };
      } else {
        return {
          success: false,
          error: 'Failed to send payment reminder',
        };
      }
    } catch (error) {
      paymentLogger.error('Error sending payment reminder', logContext, error as Error);
      return {
        success: false,
        error: 'Unexpected error occurred',
      };
    }
  }

  /**
   * Send session receipt to client
   */
  async sendSessionReceipt(
    notification: SessionNotification & { receiptUrl: string },
  ): Promise<NotificationResult> {
    const logContext = {
      sessionId: notification.sessionId,
      userId: notification.clientEmail,
    };

    try {
      paymentLogger.debug('Sending session receipt', logContext);

      const emailData = {
        to: notification.clientEmail,
        subject: `Receipt - Session with ${notification.therapistName}`,
        template: 'session-receipt',
        data: {
          clientName: notification.clientName,
          therapistName: notification.therapistName,
          sessionDate: notification.sessionDate.toLocaleDateString(),
          sessionAmount: notification.sessionAmount,
          receiptUrl: notification.receiptUrl,
        },
      };

      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error('Failed to send receipt');
      }

      const result = await response.json();
      paymentLogger.debug('Session receipt sent successfully', logContext);

      return {
        success: true,
        notificationId: result.id,
      };
    } catch (error) {
      paymentLogger.error('Error sending session receipt', logContext, error as Error);
      return {
        success: false,
        error: 'Failed to send receipt',
      };
    }
  }
}

export const sessionNotificationService = new SessionNotificationService();
