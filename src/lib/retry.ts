import { paymentLogger, LogContext } from './logger';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // in milliseconds
  maxDelay: number;
  exponentialFactor: number;
  retryableErrors: (string | RegExp)[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

class RetryService {
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    exponentialFactor: 2,
    retryableErrors: [
      'rate_limit',
      'api_connection_error',
      'api_error',
      /connection.*timeout/i,
      /network.*error/i,
      /temporary.*unavailable/i,
    ],
  };

  private stripeConfig: RetryConfig = {
    ...this.defaultConfig,
    maxAttempts: 5,
    baseDelay: 500,
    retryableErrors: [
      'rate_limit',
      'api_connection_error',
      'api_error',
      'lock_timeout',
      /connection.*timeout/i,
      /network.*error/i,
      /temporary.*unavailable/i,
      /too.*many.*requests/i,
      /service.*unavailable/i,
    ],
  };

  private isRetryableError(error: Error, retryableErrors: (string | RegExp)[]): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorType = (error as any).type?.toLowerCase() || '';

    return retryableErrors.some((pattern) => {
      if (typeof pattern === 'string') {
        return errorMessage.includes(pattern) || errorType.includes(pattern);
      }
      return pattern.test(errorMessage) || pattern.test(errorType);
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.exponentialFactor, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: LogContext,
    operationName: string,
    config: RetryConfig = this.defaultConfig,
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        paymentLogger.debug(
          `Attempting ${operationName} (attempt ${attempt}/${config.maxAttempts})`,
          context,
        );

        const result = await operation();
        const totalTime = Date.now() - startTime;

        if (attempt > 1) {
          paymentLogger.warn(`${operationName} succeeded after ${attempt} attempts`, context, {
            totalTime,
            attempts: attempt,
          });
        }

        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime,
        };
      } catch (error) {
        lastError = error as Error;

        paymentLogger.error(`${operationName} failed on attempt ${attempt}`, context, lastError, {
          attempt,
          maxAttempts: config.maxAttempts,
        });

        // Check if this is the last attempt or if error is not retryable
        if (
          attempt === config.maxAttempts ||
          !this.isRetryableError(lastError, config.retryableErrors)
        ) {
          break;
        }

        // Calculate delay and wait before next attempt
        const delay = this.calculateDelay(attempt, config);
        paymentLogger.debug(`Retrying ${operationName} in ${delay}ms`, context, {
          delay,
          nextAttempt: attempt + 1,
        });

        await this.sleep(delay);
      }
    }

    const totalTime = Date.now() - startTime;

    paymentLogger.error(`${operationName} failed after all retry attempts`, context, lastError!, {
      totalAttempts: config.maxAttempts,
      totalTime,
    });

    return {
      success: false,
      error: lastError!,
      attempts: config.maxAttempts,
      totalTime,
    };
  }

  // Specific retry methods for common Stripe operations
  async stripeOperation<T>(
    operation: () => Promise<T>,
    context: LogContext,
    operationName: string,
  ): Promise<RetryResult<T>> {
    return this.executeWithRetry(operation, context, operationName, this.stripeConfig);
  }

  async createPaymentIntent(
    operation: () => Promise<any>,
    context: LogContext,
  ): Promise<RetryResult<any>> {
    return this.stripeOperation(operation, context, 'create_payment_intent');
  }

  async capturePaymentIntent(
    operation: () => Promise<any>,
    context: LogContext,
  ): Promise<RetryResult<any>> {
    return this.stripeOperation(operation, context, 'capture_payment_intent');
  }

  async createStripeAccount(
    operation: () => Promise<any>,
    context: LogContext,
  ): Promise<RetryResult<any>> {
    return this.stripeOperation(operation, context, 'create_stripe_account');
  }

  async retrieveStripeAccount(
    operation: () => Promise<any>,
    context: LogContext,
  ): Promise<RetryResult<any>> {
    return this.stripeOperation(operation, context, 'retrieve_stripe_account');
  }

  async createAccountLink(
    operation: () => Promise<any>,
    context: LogContext,
  ): Promise<RetryResult<any>> {
    return this.stripeOperation(operation, context, 'create_account_link');
  }

  async processTransfer(
    operation: () => Promise<any>,
    context: LogContext,
  ): Promise<RetryResult<any>> {
    return this.stripeOperation(operation, context, 'process_transfer');
  }
}

export const retryService = new RetryService();
