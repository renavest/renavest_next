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
) {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setError(null);
    try {
      const startDateTime = timezoneManager.createDateTime(selectedSlotSignal.value?.start);
      const date = startDateTime.toISODate() || '';
      const startTime = startDateTime.toFormat('HH:mm') || '';

      const result = await onConfirm({
        date,
        startTime,
        therapistId: advisorId,
        timezone: timezoneManager.getUserTimezone(),
      });

      toast.success('Session booked successfully!');

      router.push(`/book/confirmation?bookingId=${String(result.sessionId)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book session');
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  return { isBooking, error, handleConfirmBooking, setError };
}
