'use server';

import { Resend } from 'resend';

import { BookingConfirmationEmailTemplate } from '../components/EmailTemplates/BookingConfirmationEmailTemplate';
import { TherapistBookingNotificationEmailTemplate } from '../components/EmailTemplates/TherapistBookingNotificationEmailTemplate';
import { TimezoneIdentifier, SUPPORTED_TIMEZONES } from '../utils/dateTimeUtils';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailParams {
  clientName: string;
  clientEmail: string;
  therapistName: string;
  therapistEmail: string;
  sessionDate: string;
  sessionTime: string;
  timezone: TimezoneIdentifier;
  googleMeetLink?: string;
}

export async function sendBookingConfirmationEmail({
  clientName,
  clientEmail,
  therapistName,
  therapistEmail,
  sessionDate,
  sessionTime,
  timezone,
  googleMeetLink,
}: BookingEmailParams) {
  try {
    // Validate inputs to prevent sending if any required field is missing
    if (!clientEmail || !therapistEmail || !sessionDate || !sessionTime) {
      console.error('Missing required email parameters', {
        clientEmail,
        therapistEmail,
        sessionDate,
        sessionTime,
      });
      return {
        success: false,
        error: 'Missing required email parameters',
      };
    }

    // Format timezone for display
    const displayTimezone = SUPPORTED_TIMEZONES[timezone];

    // Send email to client
    const clientEmailResult = await resend.emails.send({
      from: 'Renavest Booking <booking@booking.renavestapp.com>',
      to: [clientEmail],
      subject: 'Your Therapy Session is Confirmed - Renavest',
      react: await BookingConfirmationEmailTemplate({
        clientName,
        therapistName,
        sessionDate,
        sessionTime: `${sessionTime} ${displayTimezone}`,
        timezone: displayTimezone,
        googleMeetLink,
      }),
    });

    // Wait for 1 second to help with rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send email to therapist (to therapist and Stanley only)
    const therapistEmailResult = await resend.emails.send({
      from: 'Renavest Booking <booking@booking.renavestapp.com>',
      to: [therapistEmail, 'stanley@renavestapp.com'],
      subject: 'New Client Session Scheduled - Renavest',
      react: await TherapistBookingNotificationEmailTemplate({
        therapistName,
        clientName,
        sessionDate,
        sessionTime: `${sessionTime} ${displayTimezone}`,
        timezone: displayTimezone,
        googleMeetLink,
      }),
    });

    // Check for errors in either email
    if (clientEmailResult.error) {
      console.error('Failed to send client booking confirmation email:', clientEmailResult.error);
      return { success: false, error: clientEmailResult.error };
    }

    if (therapistEmailResult.error) {
      console.error(
        'Failed to send therapist booking notification email:',
        therapistEmailResult.error,
      );
      return { success: false, error: therapistEmailResult.error };
    }

    console.log('Booking confirmation emails sent successfully');
    return {
      success: true,
      clientEmailData: clientEmailResult.data,
      therapistEmailData: therapistEmailResult.data,
    };
  } catch (error) {
    console.error('Error in sending booking confirmation emails:', error);
    return { success: false, error };
  }
}
