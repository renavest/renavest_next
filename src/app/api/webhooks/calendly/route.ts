/**
 * Simple Calendly Webhook Handler
 * 
 * To set up in Calendly:
 * curl --request POST \
 *   --url https://api.calendly.com/webhook_subscriptions \
 *   --header 'Content-Type: application/json' \
 *   --header 'authorization: Bearer <YOUR_PERSONAL_TOKEN>' \
 *   --data '{
 *     "url":"https://your-domain.com/api/webhooks/calendly",
 *     "events":["invitee.created", "invitee.canceled"],
 *     "scope":"organization",
 *     "organization":"https://api.calendly.com/organizations/<ORG_UUID>"
 *   }'
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin emails to notify
const ADMIN_EMAILS = ['stanley@renavestapp.com', 'seth@renavestapp.com'];

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // Calendly pings this once to verify the webhook
    if (event && event.event === 'ping') {
      console.info('Calendly webhook ping received');
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    console.info('Calendly Event Received:', event);

    // Handle new bookings
    if (event.event === 'invitee.created') {
      const invitee = event.payload?.invitee;
      const eventDetails = event.payload?.event;
      const eventType = event.payload?.event_type;
      const questionsAndAnswers = event.payload?.questions_and_answers;

      console.info('New Calendly Booking:', {
        inviteeName: invitee?.name,
        inviteeEmail: invitee?.email,
        eventType: eventType?.name,
        startTime: eventDetails?.start_time,
      });

      // Send admin notification email
      if (invitee && eventDetails && eventType) {
        const startTime = new Date(eventDetails.start_time);
        const date = startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const time = startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        });

        const meetingLink =
          eventDetails.location?.join_url ||
          eventDetails.location?.location ||
          'Not specified';

        // Build Q&A section if available
        let qaHtml = '';
        if (questionsAndAnswers && questionsAndAnswers.length > 0) {
          qaHtml = `
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 16px;">
              <h3 style="margin-top: 0;">Additional Information:</h3>
              ${questionsAndAnswers.map((qa: { question: string; answer: string }) => `
                <p><strong>${qa.question}</strong><br/>${qa.answer}</p>
              `).join('')}
            </div>
          `;
        }

        await resend.emails.send({
          from: 'Renavest Calendly <calendly@booking.renavestapp.com>',
          to: ADMIN_EMAILS,
          subject: `New Booking: ${invitee.name} - ${eventType.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #9071FF;">📅 New Calendly Booking</h1>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Client Details</h2>
                <p><strong>Name:</strong> ${invitee.name}</p>
                <p><strong>Email:</strong> ${invitee.email}</p>
                ${invitee.timezone ? `<p><strong>Timezone:</strong> ${invitee.timezone}</p>` : ''}
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Session Details</h2>
                <p><strong>Event Type:</strong> ${eventType.name}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Duration:</strong> ${eventType.duration} minutes</p>
                <p><strong>Meeting Link:</strong> ${
                  typeof meetingLink === 'string' && meetingLink.startsWith('http')
                    ? `<a href="${meetingLink}">${meetingLink}</a>`
                    : meetingLink
                }</p>
              </div>
              
              ${qaHtml}
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
                Event ID: ${eventDetails.uuid}
              </p>
            </div>
          `,
        });

        console.info('Admin notification sent successfully');
      }
    }

    // Handle cancellations
    if (event.event === 'invitee.canceled') {
      const invitee = event.payload?.invitee;
      const eventDetails = event.payload?.event;
      const eventType = event.payload?.event_type;

      console.info('Calendly Booking Canceled:', {
        inviteeName: invitee?.name,
        inviteeEmail: invitee?.email,
        cancelReason: eventDetails?.cancel_reason,
      });

      // Send cancellation notification
      if (invitee && eventDetails && eventType) {
        await resend.emails.send({
          from: 'Renavest Calendly <calendly@booking.renavestapp.com>',
          to: ADMIN_EMAILS,
          subject: `Booking Canceled: ${invitee.name} - ${eventType.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc2626;">🚫 Booking Canceled</h1>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Client:</strong> ${invitee.name} (${invitee.email})</p>
                <p><strong>Event:</strong> ${eventType.name}</p>
                ${eventDetails.cancel_reason ? `<p><strong>Reason:</strong> ${eventDetails.cancel_reason}</p>` : ''}
              </div>
              
              <p style="color: #6b7280; font-size: 12px;">Event ID: ${eventDetails.uuid}</p>
            </div>
          `,
        });

        console.info('Cancellation notification sent successfully');
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

