'use server';

import { Resend } from 'resend';
import { BookingConfirmationEmailTemplate } from '../components/BookingConfirmationEmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailParams {
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  timezone: string;
}

export async function sendBookingConfirmationEmail({
  clientName,
  sessionDate,
  sessionTime,
  timezone,
}: BookingEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Renavest Booking <booking@renavestapp.com>',
      to: ['stanley@renavestapp.com'],
      subject: 'New Therapy Session Booked',
      react: BookingConfirmationEmailTemplate({
        clientName,
        therapistName: '', // Not used in the current template
        sessionDate,
        sessionTime,
        timezone,
      }),
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      return { success: false, error };
    }

    console.log('Booking confirmation email sent successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error in sending booking confirmation email:', error);
    return { success: false, error };
  }
}
