import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { timezoneManager } from '../../utils/timezoneManager';
import { selectedSlotSignal } from '../TherapistAvailability/useTherapistAvailability';

interface BookingDetails {
  date: string;
  startTime: string;
  therapistId: string;
  timezone: string;
}

export function useBookingConfirmation(
  onConfirm: (details: BookingDetails) => Promise<{
    sessionId?: number | string;
    success: boolean;
    message?: string;
    emailSent?: boolean;
  }>,
  advisorId: string,
  advisorPricing?: number,
) {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPricing = advisorPricing && advisorPricing > 0;

  const setupPaymentIntent = async (bookingSessionId: number) => {
    try {
      const response = await fetch('/api/stripe/session-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingSessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup payment');
      }

      const paymentData = await response.json();

      if (paymentData.fullySubsidized) {
        // If fully subsidized, no payment needed
        toast.success('Session booked successfully! Fully covered by your employer benefits.');
        return { requiresPayment: false };
      } else {
        // Payment will be processed after session completion
        toast.success('Session booked successfully! Payment will be processed after your session.');
        return {
          requiresPayment: true,
          clientSecret: paymentData.clientSecret,
          outOfPocket: paymentData.outOfPocket,
        };
      }
    } catch (error) {
      console.error('Payment setup failed:', error);
      // Don't fail the booking if payment setup fails - can be handled later
      toast.warning('Session booked, but payment setup needs attention. Please contact support.');
      return { requiresPayment: false };
    }
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setError(null);
    try {
      const startDateTime = timezoneManager.createDateTime(selectedSlotSignal.value?.start);
      const date = startDateTime.toISODate() || '';
      const startTime = startDateTime.toFormat('HH:mm') || '';

      // First, create the booking
      const result = await onConfirm({
        date,
        startTime,
        therapistId: advisorId,
        timezone: timezoneManager.getUserTimezone(),
      });

      if (!result.success || !result.sessionId) {
        throw new Error(result.message || 'Failed to create booking');
      }

      // If therapist has pricing, setup payment
      if (hasPricing) {
        const paymentResult = await setupPaymentIntent(Number(result.sessionId));

        // Redirect to confirmation page with payment status
        router.push(
          `/book/confirmation?bookingId=${String(result.sessionId)}&payment=${paymentResult.requiresPayment ? 'pending' : 'none'}`,
        );
      } else {
        // No payment needed, just show success
        toast.success('Session booked successfully!');
        router.push(`/book/confirmation?bookingId=${String(result.sessionId)}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book session');
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  return { isBooking, error, handleConfirmBooking, setError };
}
