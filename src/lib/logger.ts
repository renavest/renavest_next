export interface LogContext {
  userId?: string;
  therapistId?: number;
  sessionId?: number;
  paymentIntentId?: string;
  stripeAccountId?: string;
  amount?: number;
  timestamp?: string;
  requestId?: string;
}

export interface PaymentEvent {
  event: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context: LogContext;
  metadata?: Record<string, unknown>;
  error?: Error;
}

class PaymentLogger {
  private logEvent(event: PaymentEvent): void {
    const logData = {
      ...event,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PAYMENT_${event.level.toUpperCase()}]`, logData);
    }

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service (DataDog, LogRocket, etc.)
      console.log(JSON.stringify(logData));
    }
  }

  sessionCreated(context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'session_created',
      level: 'info',
      message: `Session created for therapist ${context.therapistId}`,
      context,
      metadata,
    });
  }

  paymentIntentCreated(context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'payment_intent_created',
      level: 'info',
      message: `Payment intent created: ${context.paymentIntentId}`,
      context,
      metadata,
    });
  }

  sessionCompleted(context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'session_completed',
      level: 'info',
      message: `Session ${context.sessionId} completed by therapist ${context.therapistId}`,
      context,
      metadata,
    });
  }

  paymentCaptured(context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'payment_captured',
      level: 'info',
      message: `Payment captured for session ${context.sessionId}`,
      context,
      metadata,
    });
  }

  stripeConnectAccountCreated(context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'stripe_connect_account_created',
      level: 'info',
      message: `Stripe Connect account created: ${context.stripeAccountId}`,
      context,
      metadata,
    });
  }

  revenueSplitProcessed(context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'revenue_split_processed',
      level: 'info',
      message: `Revenue split processed for session ${context.sessionId}`,
      context,
      metadata,
    });
  }

  error(
    message: string,
    context: LogContext,
    error: Error,
    metadata?: Record<string, unknown>,
  ): void {
    this.logEvent({
      event: 'payment_error',
      level: 'error',
      message,
      context,
      error,
      metadata: {
        ...metadata,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }

  warn(message: string, context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'payment_warning',
      level: 'warn',
      message,
      context,
      metadata,
    });
  }

  debug(message: string, context: LogContext, metadata?: Record<string, unknown>): void {
    this.logEvent({
      event: 'payment_debug',
      level: 'debug',
      message,
      context,
      metadata,
    });
  }

  // Specific payment flow logging methods
  bookingFlowStarted(context: LogContext): void {
    this.logEvent({
      event: 'booking_flow_started',
      level: 'info',
      message: `User ${context.userId} started booking with therapist ${context.therapistId}`,
      context,
    });
  }

  billingCheckPerformed(context: LogContext, result: boolean): void {
    this.logEvent({
      event: 'billing_check_performed',
      level: 'info',
      message: `Billing check for user ${context.userId}: ${result ? 'passed' : 'failed'}`,
      context,
      metadata: { billingCheckResult: result },
    });
  }

  subsidyCalculated(context: LogContext, subsidyAmount: number, outOfPocket: number): void {
    this.logEvent({
      event: 'subsidy_calculated',
      level: 'info',
      message: `Subsidy calculated for session ${context.sessionId}`,
      context,
      metadata: { subsidyAmount, outOfPocket },
    });
  }

  therapistEarningsCalculated(context: LogContext, earnings: number, platformFee: number): void {
    this.logEvent({
      event: 'therapist_earnings_calculated',
      level: 'info',
      message: `Earnings calculated for therapist ${context.therapistId}`,
      context,
      metadata: { earnings, platformFee },
    });
  }
}

export const paymentLogger = new PaymentLogger();
