import posthog from 'posthog-js';
import { useCallback } from 'react';
import { useCalendlyEventListener } from 'react-calendly';

import { CalendlyEventDetails, BookingDetails, parseBookingDetails } from '../utils/calendlyTypes';

interface UseCalendlyEventsProps {
  advisorId?: string;
  advisorName?: string;
  onEventScheduled: (bookingDetails: BookingDetails) => void;
}

export const useCalendlyEvents = ({
  advisorId,
  advisorName,
  onEventScheduled,
}: UseCalendlyEventsProps) => {
  const handleEventScheduled = useCallback(
    (e: { data: { payload: { event: CalendlyEventDetails; invitee?: { uri?: string } } } }) => {
      try {
        const eventDetails = e.data.payload.event;
        const parsedBookingInfo = parseBookingDetails(eventDetails);

        onEventScheduled(parsedBookingInfo);

        posthog.capture('therapist_session_booked', {
          therapist_id: advisorId,
          therapist_name: advisorName,
          booking_method: 'calendly',
          invitee_uri: e.data.payload.invitee?.uri,
          event_uri: eventDetails.uri,
        });
      } catch (error) {
        console.error('Error processing booking details:', error);
        posthog.capture('booking_details_error', { error: String(error) });
      }
    },
    [advisorId, advisorName, onEventScheduled],
  );

  useCalendlyEventListener({
    onProfilePageViewed: () => {
      posthog.capture('calendly_profile_viewed', {
        therapist_id: advisorId,
        therapist_name: advisorName,
      });
    },
    onDateAndTimeSelected: () => {
      posthog.capture('calendly_date_time_selected', {
        therapist_id: advisorId,
        therapist_name: advisorName,
      });
    },
    onEventTypeViewed: () => {
      posthog.capture('calendly_event_type_viewed', {
        therapist_id: advisorId,
        therapist_name: advisorName,
      });
    },
    onEventScheduled: handleEventScheduled,
  });
};
