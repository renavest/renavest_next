import type { PaymentMethodsResponse, SetupIntentResponse } from '../types';

/**
 * PaymentMethodsService
 *
 * Service class for managing payment methods through Stripe API.
 * Handles fetching, creating, and removing payment methods.
 */
export class PaymentMethodsService {
  static async fetchPaymentMethods(): Promise<PaymentMethodsResponse> {
    const response = await fetch('/api/stripe/payment-methods');

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return await response.json();
  }

  static async createSetupIntent(): Promise<SetupIntentResponse> {
    const response = await fetch('/api/stripe/setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create setup intent');
    }

    return await response.json();
  }

  static async removePaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await fetch('/api/stripe/payment-methods', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentMethodId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove payment method');
    }
  }
}
