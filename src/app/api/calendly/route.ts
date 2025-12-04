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

const ADMIN_EMAILS = ['stanley@renavestapp.com',];

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
      const payload = event.payload;
      const scheduledEvent = payload?.scheduled_event;
      const questionsAndAnswers = payload?.questions_and_answers;

      const inviteeName = payload?.name;
      const inviteeEmail = payload?.email;
      const inviteeTimezone = payload?.timezone;

      const eventName = scheduledEvent?.name;
      const startTimeStr = scheduledEvent?.start_time;
      const endTimeStr = scheduledEvent?.end_time;
      const location = scheduledEvent?.location;

      const createdBy = event.created_by;
      const eventMemberships = scheduledEvent?.event_memberships || [];

      console.info('Event Memberships (detailed):', JSON.stringify(eventMemberships, null, 2));

      console.info('New Calendly Booking:', {
        inviteeName,
        inviteeEmail,
        eventName,
        startTime: startTimeStr,
        therapistUri: createdBy,
        eventMemberships,
      });

      if (inviteeName && inviteeEmail && scheduledEvent && startTimeStr) {
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);
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
        const endTimeFormatted = endTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short',
        });

        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        const meetingLink =
          location?.join_url ||
          location?.location ||
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

        // Extract therapist user ID from URI
        const therapistUserId = createdBy ? createdBy.split('/').pop() : 'Unknown';

        await resend.emails.send({
          from: 'Renavest Calendly <calendly@booking.renavestapp.com>',
          to: ADMIN_EMAILS,
          subject: `New Booking: ${inviteeName} - ${eventName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #9071FF;">📅 New Calendly Booking</h1>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Client Details</h2>
                <p><strong>Name:</strong> ${inviteeName}</p>
                <p><strong>Email:</strong> ${inviteeEmail}</p>
                ${inviteeTimezone ? `<p><strong>Timezone:</strong> ${inviteeTimezone}</p>` : ''}
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Session Details</h2>
                <p><strong>Event Type:</strong> ${eventName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time} - ${endTimeFormatted}</p>
                <p><strong>Duration:</strong> ${durationMinutes} minutes</p>
                <p><strong>Meeting Link:</strong> ${
                  typeof meetingLink === 'string' && meetingLink.startsWith('http')
                    ? `<a href="${meetingLink}">${meetingLink}</a>`
                    : meetingLink
                }</p>
              </div>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h2 style="margin-top: 0;">Therapist/Host Info</h2>
                <p><strong>Calendly User ID:</strong> ${therapistUserId}</p>
                <p style="font-size: 12px; color: #6b7280;">Full URI: ${createdBy}</p>
                <div style="margin-top: 16px;">
                  <p style="margin: 0 0 8px 0;"><strong>Event Memberships:</strong></p>
                  <pre style="background: white; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 11px; margin: 0;">${JSON.stringify(eventMemberships, null, 2)}</pre>
                </div>
              </div>
              
              ${qaHtml}
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
                Event ID: ${scheduledEvent.uri}
              </p>
            </div>
          `,
        });

        console.info('Admin notification sent successfully');
      }
    }

    // Handle cancellations
    if (event.event === 'invitee.canceled') {
      const payload = event.payload;
      const scheduledEvent = payload?.scheduled_event;

      const inviteeName = payload?.name;
      const inviteeEmail = payload?.email;
      const cancelReason = payload?.cancellation?.reason;
      const eventName = scheduledEvent?.name;

      const createdBy = event.created_by;
      const therapistUserId = createdBy ? createdBy.split('/').pop() : 'Unknown';

      console.info('Calendly Booking Canceled:', {
        inviteeName,
        inviteeEmail,
        cancelReason,
        therapistUri: createdBy,
      });

      // Send cancellation notification
      if (inviteeName && inviteeEmail && scheduledEvent) {
        await resend.emails.send({
          from: 'Renavest Calendly <calendly@booking.renavestapp.com>',
          to: ADMIN_EMAILS,
          subject: `Booking Canceled: ${inviteeName} - ${eventName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc2626;">🚫 Booking Canceled</h1>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Client:</strong> ${inviteeName} (${inviteeEmail})</p>
                <p><strong>Event:</strong> ${eventName}</p>
                <p><strong>Therapist User ID:</strong> ${therapistUserId}</p>
                ${cancelReason ? `<p><strong>Reason:</strong> ${cancelReason}</p>` : ''}
              </div>
              
              <p style="color: #6b7280; font-size: 12px;">Event ID: ${scheduledEvent.uri}</p>
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
