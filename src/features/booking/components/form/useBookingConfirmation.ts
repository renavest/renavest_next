import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface TimeSlot {
  start: string;
  end: string;
}

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
  selectedSlot: TimeSlot | null,
  advisorId: string,
) {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    setError(null);
    try {
      const date = new Date(selectedSlot.start).toISOString().split('T')[0];
      const startTime = new Date(selectedSlot.start).toTimeString().split(' ')[0];
      const result = await onConfirm({
        date,
        startTime,
        therapistId: advisorId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      toast.success('Session booked successfully!');
      if (result.success && result.sessionId) {
        fetch('/api/google-calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingSessionId: result.sessionId }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              toast.error(data.message || 'Failed to create Google Calendar event');
            }
          })
          .catch(() => {
            toast.error('Failed to create Google Calendar event');
          });
      }
      router.push(`/booking/confirmation?bookingId=${String(result.sessionId)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book session');
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  return { isBooking, error, handleConfirmBooking, setError };
}
