'use client';

import { Calendar, Clock, User, X, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState, useEffect } from 'react';

import { CalendarGrid } from '@/src/features/booking/components/calendar/CalendarGrid';
import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { TimezoneManager, SupportedTimezone } from '@/src/features/booking/utils/timezoneManager';
import { trackTherapistSessions } from '@/src/features/posthog/therapistTracking';
import {
  isScheduleSessionModalOpenSignal,
  scheduleSessionClientSignal,
  sessionSchedulingLoadingSignal,
  sessionSchedulingErrorSignal,
  closeScheduleSessionModal,
  refreshUpcomingSessions,
  therapistIdSignal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

interface TimeSlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

// Simple timezone selector component
const TimezoneSelector = ({
  selectedTimezone,
  onTimezoneChange,
}: {
  selectedTimezone: SupportedTimezone;
  onTimezoneChange: (timezone: SupportedTimezone) => void;
}) => {
  const timezoneManager = TimezoneManager.getInstance();
  const supportedTimezones = timezoneManager.getSupportedTimezones();

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
        <Globe className='w-4 h-4 text-purple-600' />
        Timezone
      </label>
      <select
        value={selectedTimezone}
        onChange={(e) => onTimezoneChange(e.target.value as SupportedTimezone)}
        className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-700'
      >
        {supportedTimezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export function ScheduleSessionModal() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timezone, setTimezone] = useState<SupportedTimezone>('America/New_York');
  const [sessionNotes, setSessionNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentMonth, setCurrentMonth] = useState<DateTime>(DateTime.now());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());

  // Get values from signals
  const isOpen = isScheduleSessionModalOpenSignal.value;
  const client = scheduleSessionClientSignal.value;
  const isLoading = sessionSchedulingLoadingSignal.value;
  const error = sessionSchedulingErrorSignal.value;
  const therapistId = therapistIdSignal.value;

  // Initialize timezone manager
  useEffect(() => {
    const timezoneManager = TimezoneManager.getInstance();
    setTimezone(timezoneManager.getUserTimezone());
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setSelectedTime('');
      setAvailableSlots([]);
      setSessionNotes('');
      setSuccessMessage('');
      setCurrentMonth(DateTime.now());
      setAvailableDates(new Set());
      sessionSchedulingErrorSignal.value = null;
    }
  }, [isOpen]);

  // Fetch available dates for the current month
  useEffect(() => {
    if (isOpen && therapistId) {
      fetchAvailableDates();
    }
  }, [isOpen, therapistId, currentMonth, timezone]);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate && client && therapistId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, client, therapistId, timezone]);

  const fetchAvailableDates = async () => {
    if (!therapistId) return;

    try {
      const startDate = currentMonth.startOf('month').toISODate();
      const endDate = currentMonth.endOf('month').toISODate();

      const response = await fetch(
        `/api/sessions/availability?therapistId=${therapistId}&startDate=${startDate}&endDate=${endDate}&timezone=${timezone}&view=month`,
      );

      if (response.ok) {
        const data = await response.json();
        const dates = new Set<string>();
        (data.slots || []).forEach((slot: any) => {
          const slotDate = createDate(slot.start, timezone);
          dates.add(slotDate.toISODate()!);
        });
        setAvailableDates(dates);
      }
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !therapistId) return;

    setLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISODate();
      const response = await fetch(
        `/api/sessions/availability?date=${dateStr}&therapistId=${therapistId}&timezone=${timezone}`,
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } else {
        console.error('Failed to fetch availability');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!selectedDate || !selectedTime || !client || !therapistId) return;

    sessionSchedulingLoadingSignal.value = true;
    sessionSchedulingErrorSignal.value = null;

    try {
      const sessionDateTime = createDate(
        `${selectedDate.toISODate()}T${selectedTime}`,
        timezone,
      ).toISO();

      const response = await fetch('/api/therapist/sessions/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(client.id, 10),
          sessionDateTime,
          timezone,
          notes: sessionNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Track successful scheduling
        if (therapistId) {
          trackTherapistSessions.sessionScheduled(therapistId, parseInt(client.id, 10), {
            user_id: `therapist_${therapistId}`,
            session_date: sessionDateTime,
            timezone,
          });
        }

        setSuccessMessage('Session scheduled successfully!');

        // Refresh sessions data
        await refreshUpcomingSessions();

        // Close modal after a brief delay to show success message
        setTimeout(() => {
          closeScheduleSessionModal();
        }, 1500);
      } else {
        sessionSchedulingErrorSignal.value = data.error || 'Failed to schedule session';
      }
    } catch (error) {
      console.error('Error scheduling session:', error);
      sessionSchedulingErrorSignal.value = 'An unexpected error occurred';
    } finally {
      sessionSchedulingLoadingSignal.value = false;
    }
  };

  const isFormValid = selectedDate && selectedTime && client;

  if (!isOpen || !client) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-sm'
        onClick={closeScheduleSessionModal}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className={`${COLORS.WARM_PURPLE.bg} text-white p-6`}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                <Calendar className='w-6 h-6' />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>Schedule Session</h2>
                <p className='text-purple-100'>
                  Book a session with {client.firstName} {client.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={closeScheduleSessionModal}
              className='p-2 hover:bg-white/20 rounded-lg transition-colors'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className='bg-green-50 border-l-4 border-green-400 p-4 m-6 rounded-lg'>
            <div className='flex items-center'>
              <CheckCircle className='w-5 h-5 text-green-400 mr-3' />
              <p className='text-green-800 font-medium'>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 p-4 m-6 rounded-lg'>
            <div className='flex items-center'>
              <AlertCircle className='w-5 h-5 text-red-400 mr-3' />
              <p className='text-red-800 font-medium'>{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {/* Client Info Card */}
          <div className='bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200'>
            <div className='flex items-center gap-3'>
              <User className='w-8 h-8 text-purple-600' />
              <div>
                <h3 className='font-semibold text-purple-900'>
                  {client.firstName} {client.lastName}
                </h3>
                <p className='text-purple-700 text-sm'>{client.email}</p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left Column - Calendar */}
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Calendar className='w-5 h-5 text-purple-600' />
                  Select Date
                </h3>
                <CalendarGrid
                  selectedDate={selectedDate || DateTime.now()}
                  onDateSelect={setSelectedDate}
                  availableDates={availableDates}
                  timezone={timezone}
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                />
              </div>

              <TimezoneSelector selectedTimezone={timezone} onTimezoneChange={setTimezone} />
            </div>

            {/* Right Column - Time Selection & Details */}
            <div className='space-y-6'>
              {/* Time Selection */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-purple-600' />
                  Select Time
                </h3>

                {!selectedDate ? (
                  <div className='text-center py-8 text-gray-500'>
                    <Calendar className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>Please select a date first</p>
                  </div>
                ) : loadingSlots ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-3'></div>
                    <p className='text-gray-600'>Loading available times...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <Clock className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No available times for this date</p>
                    <p className='text-sm'>Please select a different date</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-3 max-h-64 overflow-y-auto'>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedTime === slot.time
                            ? `${COLORS.WARM_PURPLE.bg} text-white shadow-md`
                            : slot.available
                              ? 'bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={slot.conflictReason}
                      >
                        {
                          formatDateTime(
                            createDate(`2024-01-01T${slot.time}`, timezone).toISO() || '',
                            timezone,
                          ).time
                        }
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Session Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Session Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder='Add any notes about this session...'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
                  rows={3}
                />
              </div>

              {/* Selected Session Summary */}
              {selectedDate && selectedTime && (
                <div className='bg-green-50 rounded-xl p-4 border border-green-200'>
                  <h4 className='font-semibold text-green-900 mb-2'>Session Summary</h4>
                  <div className='space-y-1 text-sm text-green-800'>
                    <p>
                      <span className='font-medium'>Date:</span>{' '}
                      {selectedDate.toLocaleString(DateTime.DATE_FULL)}
                    </p>
                    <p>
                      <span className='font-medium'>Time:</span>{' '}
                      {
                        formatDateTime(
                          createDate(`2024-01-01T${selectedTime}`, timezone).toISO() || '',
                          timezone,
                        ).time
                      }{' '}
                      ({timezone})
                    </p>
                    <p>
                      <span className='font-medium'>Client:</span> {client.firstName}{' '}
                      {client.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-gray-200 p-6 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <button
              onClick={closeScheduleSessionModal}
              className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleSession}
              disabled={!isFormValid || isLoading}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                isFormValid && !isLoading
                  ? `${COLORS.WARM_PURPLE.bg} hover:${COLORS.WARM_PURPLE.hover} text-white shadow-md`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                  Scheduling...
                </div>
              ) : (
                'Schedule Session'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
