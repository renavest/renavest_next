'use server';

import { Resend } from 'resend';

import { BookingConfirmationEmailTemplate } from '../components/EmailTemplates/BookingConfirmationEmailTemplate';
import { TherapistBookingNotificationEmailTemplate } from '../components/EmailTemplates/TherapistBookingNotificationEmailTemplate';
import { TherapistCalendlyEmail } from '../components/EmailTemplates/TherapistCalendlyEmail';
import { SupportedTimezone } from '../utils/timezoneManager';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailParams {
  clientName: string;
  clientEmail: string;
  therapistName: string;
  therapistEmail: string;
  sessionDate: string;
  sessionTime: string;
  therapistSessionDate?: string;
  therapistSessionTime?: string;
  clientTimezone: SupportedTimezone;
  therapistTimezone: SupportedTimezone;
  googleMeetLink?: string;
}

export async function sendBookingConfirmationEmail({
  clientName,
  clientEmail,
  therapistName,
  therapistEmail,
  sessionDate,
  sessionTime,
  therapistSessionDate,
  therapistSessionTime,
  clientTimezone,
  therapistTimezone,
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

    // Pass formatted date and time directly to templates
    const clientEmailResult = await resend.emails.send({
      from: 'Renavest Booking <booking@booking.renavestapp.com>',
      to: [clientEmail],
      subject: 'Your Therapy Session is Confirmed - Renavest',
      react: await BookingConfirmationEmailTemplate({
        clientName,
        therapistName,
        sessionDate,
        sessionTime,
        clientTimezone,
        therapistTimezone,
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
        sessionDate: therapistSessionDate || sessionDate,
        sessionTime: therapistSessionTime || sessionTime,
        clientTimezone,
        therapistTimezone,
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

interface TherapistCalendlyEmailParams {
  therapistName: string;
  therapistEmail: string;
  clientName: string;
  clientEmail: string;
}

/**
 * Sends a notification email to a therapist when a client books them through Calendly
 * This is used when we only have the client name and no session details
 */
export async function sendTherapistCalendlyEmail({
  therapistName,
  therapistEmail,
  clientName,
  clientEmail,
}: TherapistCalendlyEmailParams) {
  try {
    // Validate inputs to prevent sending if any required field is missing
    if (!therapistEmail || !therapistName || !clientName) {
      console.error('Missing required email parameters', {
        therapistEmail,
        therapistName,
        clientName,
        clientEmail,
      });
      return {
        success: false,
        error: 'Missing required email parameters',
      };
    }

    // Send email to therapist (to therapist and Stanley only)
    const therapistEmailResult = await resend.emails.send({
      from: 'Renavest Booking <booking@booking.renavestapp.com>',
      to: ['sethmorton05@gmail.com', 'stanley@renavestapp.com'],
      subject: 'New Client Booking Notification - Renavest',
      react: await TherapistCalendlyEmail({
        therapistName,
        clientName,
        clientEmail,
      }),
    });

    // Check for errors in the email
    if (therapistEmailResult.error) {
      console.error(
        'Failed to send therapist Calendly notification email:',
        therapistEmailResult.error,
      );
      return { success: false, error: therapistEmailResult.error };
    }

    console.log('Therapist Calendly notification email sent successfully');
    return {
      success: true,
      therapistEmailData: therapistEmailResult.data,
    };
  } catch (error) {
    console.error('Error in sending therapist Calendly notification email:', error);
    return { success: false, error };
  }
}
