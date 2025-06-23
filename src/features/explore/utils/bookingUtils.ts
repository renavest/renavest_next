import { toast } from 'sonner';

import type { Advisor } from '@/src/shared/types';

/**
 * Utility functions for advisor booking functionality
 */

/**
 * Determine if a user can book a session with themselves
 *
 * @param currentUserTherapistId - Current user's therapist ID
 * @param advisor - The advisor being booked
 * @returns Whether self-booking is being attempted
 */
export function isBookingSelf(currentUserTherapistId: number | null, advisor: Advisor): boolean {
  return !!(currentUserTherapistId && advisor.therapistId === currentUserTherapistId);
}

/**
 * Get appropriate booking button text based on advisor and user state
 *
 * @param advisor - The advisor being booked
 * @param isChecking - Whether integration status is being checked
 * @param isConnected - Whether advisor has calendar integration
 * @param isSelfBooking - Whether user is trying to book themselves
 * @returns Appropriate button text
 */
export function getBookingButtonText(
  advisor: Advisor,
  isChecking: boolean,
  isConnected: boolean | null,
  isSelfBooking: boolean,
): string {
  if (isSelfBooking) return 'Cannot Book Yourself';
  if (isChecking) return 'Loading...';
  if (advisor.isPending) return 'Book via External Calendar';
  if (isConnected) return 'Book a Session';
  return 'Book via External Calendar';
}

/**
 * Send booking notification email to therapist
 *
 * @param therapistId - ID of the therapist to notify
 * @param bookingType - Type of booking (e.g., 'External Calendar', 'Pending Therapist')
 * @returns Promise that resolves when notification is sent
 */
export async function sendBookingNotification(
  therapistId: string,
  bookingType: string,
): Promise<void> {
  try {
    // First get therapist details
    const therapistResponse = await fetch(`/api/therapist/details/${therapistId}`);
    if (!therapistResponse.ok) {
      console.error('Failed to fetch therapist details');
      toast.error('Unable to notify therapist. Please contact them directly.');
      return;
    }

    const therapistData = await therapistResponse.json();

    // Send notification email using the unified API
    const notificationResponse = await fetch('/api/booking/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        therapistName: therapistData.name,
        therapistEmail: therapistData.email,
        bookingType: bookingType,
      }),
    });

    if (notificationResponse.ok) {
      console.log('Booking notification sent successfully');
      toast.success(`${therapistData.name} has been notified of your booking interest!`);
    } else {
      const errorData = await notificationResponse.json();
      console.error('Failed to send booking notification:', errorData.error);
      toast.error('Unable to notify therapist. Please contact them directly.');
    }
  } catch (error) {
    console.error('Error sending booking notification:', error);
    toast.error('Unable to notify therapist. Please contact them directly.');
  }
}

/**
 * Check if billing setup is required for internal booking
 *
 * @returns Promise<boolean> - Whether billing setup is complete
 */
export async function checkBillingSetup(): Promise<boolean> {
  try {
    const billingResponse = await fetch('/api/stripe/billing-setup-check');

    if (billingResponse.ok) {
      const billingData = await billingResponse.json();
      return billingData.hasPaymentMethod;
    } else {
      console.warn('Could not check billing setup, proceeding with booking');
      return true; // Assume setup is complete if check fails
    }
  } catch (error) {
    console.error('Error checking billing setup:', error);
    return true; // Continue with booking if billing check fails
  }
}

/**
 * Get integration status indicator text and color
 *
 * @param advisor - The advisor to check
 * @param isConnected - Whether calendar is connected
 * @param isSelfBooking - Whether user is booking themselves
 * @returns Object with status text and CSS class
 */
export function getIntegrationStatus(
  advisor: Advisor,
  isConnected: boolean | null,
  isSelfBooking: boolean,
): { text: string; className: string } {
  if (isSelfBooking) {
    return {
      text: '⚠️ This is your own profile',
      className: 'text-red-600',
    };
  }

  if (advisor.isPending) {
    return {
      text: '⏳ Pending therapist - External booking',
      className: 'text-blue-600',
    };
  }

  if (isConnected) {
    return {
      text: '✓ Direct booking available',
      className: 'text-green-600',
    };
  }

  return {
    text: 'External calendar booking',
    className: 'text-orange-600',
  };
}
