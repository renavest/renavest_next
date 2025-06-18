import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { paymentLogger } from '@/src/lib/logger';
import { retryService } from '@/src/lib/retry';
import type { EmailRequest, EmailResponse } from '@/src/features/notifications/types/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest): Promise<NextResponse<EmailResponse>> {
  const logContext = { requestId: crypto.randomUUID() };

  try {
    const body: EmailRequest = await req.json();
    const { to, subject, template, html, text, data } = body;

    if (!to || !subject) {
      paymentLogger.warn('Email request missing required fields', logContext, { to, subject });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject', id: '' },
        { status: 400 }
      );
    }

    paymentLogger.debug('Processing email send request', logContext, {
      to,
      subject,
      hasTemplate: !!template,
      hasHtml: !!html,
      hasText: !!text,
    });

    // Determine email content
    let emailContent: { html?: string; text?: string } = {};
    
    if (template && data) {
      // Generate email content based on template
      emailContent = generateEmailContent(template, data);
    } else if (html || text) {
      emailContent = { html, text };
    } else {
      paymentLogger.warn('No email content provided', logContext);
      return NextResponse.json(
        { success: false, error: 'No email content provided', id: '' },
        { status: 400 }
      );
    }

    // Send email with retry logic
    const emailResult = await retryService.executeWithRetry(
      async () => {
        const { data: emailData, error } = await resend.emails.send({
          from: `Renavest <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
          to: [to],
          subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          throw new Error(`Resend API error: ${JSON.stringify(error)}`);
        }

        return emailData;
      },
      logContext,
      'send_email_with_resend'
    );

    if (!emailResult.success) {
      paymentLogger.error('Failed to send email after retries', logContext, emailResult.error!);
      return NextResponse.json(
        { success: false, error: 'Failed to send email', id: '' },
        { status: 500 }
      );
    }

    paymentLogger.debug('Email sent successfully', logContext, {
      emailId: emailResult.data?.id,
      attempts: emailResult.attempts,
      totalTime: emailResult.totalTime,
    });

    return NextResponse.json({
      success: true,
      id: emailResult.data?.id || '',
    });

  } catch (error) {
    paymentLogger.error('Unexpected error in email API', logContext, error as Error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', id: '' },
      { status: 500 }
    );
  }
}

function generateEmailContent(template: string, data: Record<string, unknown>): { html: string; text: string } {
  switch (template) {
    case 'session-completion':
      return generateSessionCompletionEmail(data);
    case 'payment-required':
      return generatePaymentRequiredEmail(data);
    case 'session-receipt':
      return generateSessionReceiptEmail(data);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

function generateSessionCompletionEmail(data: Record<string, unknown>): { html: string; text: string } {
  const {
    clientName,
    therapistName,
    sessionDate,
    sessionTime,
    paymentRequired,
    sessionAmount,
    completedByTherapist,
    dashboardUrl,
  } = data;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1f2937;">Session Completed</h1>
      <p>Hi ${clientName},</p>
      <p>Your therapy session with <strong>${therapistName}</strong> on ${sessionDate} at ${sessionTime} has been completed.</p>
      
      ${completedByTherapist 
        ? '<p>Your therapist has confirmed the session completion.</p>'
        : '<p>The session has been automatically marked as completed.</p>'
      }
      
      ${paymentRequired && sessionAmount 
        ? `<div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
             <h3 style="color: #92400e; margin: 0 0 8px 0;">Payment Required</h3>
             <p style="margin: 0;">Session fee: $${(sessionAmount / 100).toFixed(2)}</p>
             <p style="margin: 8px 0 0 0;">Please complete your payment in your dashboard.</p>
           </div>`
        : '<p style="color: #059669;">✓ No payment required for this session.</p>'
      }
      
      <p>
        <a href="${dashboardUrl}" style="background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View in Dashboard
        </a>
      </p>
      
      <p>Thank you for using Renavest!</p>
      <p>Best regards,<br>The Renavest Team</p>
    </div>
  `;

  const text = `
    Session Completed
    
    Hi ${clientName},
    
    Your therapy session with ${therapistName} on ${sessionDate} at ${sessionTime} has been completed.
    
    ${completedByTherapist 
      ? 'Your therapist has confirmed the session completion.'
      : 'The session has been automatically marked as completed.'
    }
    
    ${paymentRequired && sessionAmount 
      ? `Payment Required: $${(sessionAmount / 100).toFixed(2)} - Please complete your payment in your dashboard.`
      : 'No payment required for this session.'
    }
    
    View in Dashboard: ${dashboardUrl}
    
    Thank you for using Renavest!
    Best regards,
    The Renavest Team
  `;

  return { html, text };
}

function generatePaymentRequiredEmail(data: Record<string, unknown>): { html: string; text: string } {
  const { clientName, therapistName, sessionAmount, paymentUrl } = data;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Payment Required</h1>
      <p>Hi ${clientName},</p>
      <p>Your session with <strong>${therapistName}</strong> requires payment.</p>
      
      <div style="background-color: #fee2e2; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="color: #dc2626; margin: 0 0 8px 0;">Amount Due</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0;">$${(sessionAmount as number / 100).toFixed(2)}</p>
      </div>
      
      <p>
        <a href="${paymentUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Payment
        </a>
      </p>
      
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The Renavest Team</p>
    </div>
  `;

  const text = `
    Payment Required
    
    Hi ${clientName},
    
    Your session with ${therapistName} requires payment.
    
    Amount Due: $${(sessionAmount as number / 100).toFixed(2)}
    
    Complete Payment: ${paymentUrl}
    
    If you have any questions, please contact our support team.
    
    Best regards,
    The Renavest Team
  `;

  return { html, text };
}

function generateSessionReceiptEmail(data: Record<string, unknown>): { html: string; text: string } {
  const { clientName, therapistName, sessionDate, sessionAmount, receiptUrl } = data;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #059669;">Payment Receipt</h1>
      <p>Hi ${clientName},</p>
      <p>Thank you for your payment! Here's your receipt for the session with <strong>${therapistName}</strong> on ${sessionDate}.</p>
      
      <div style="background-color: #d1fae5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="color: #059669; margin: 0 0 8px 0;">Payment Successful</h3>
        <p style="margin: 0;">Amount: $${(sessionAmount as number / 100).toFixed(2)}</p>
        <p style="margin: 8px 0 0 0;">Therapist: ${therapistName}</p>
      </div>
      
      <p>
        <a href="${receiptUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Download Receipt
        </a>
      </p>
      
      <p>Thank you for using Renavest!</p>
      <p>Best regards,<br>The Renavest Team</p>
    </div>
  `;

  const text = `
    Payment Receipt
    
    Hi ${clientName},
    
    Thank you for your payment! Here's your receipt for the session with ${therapistName} on ${sessionDate}.
    
    Payment Successful
    Amount: $${(sessionAmount as number / 100).toFixed(2)}
    Therapist: ${therapistName}
    
    Download Receipt: ${receiptUrl}
    
    Thank you for using Renavest!
    Best regards,
    The Renavest Team
  `;

  return { html, text };
} 