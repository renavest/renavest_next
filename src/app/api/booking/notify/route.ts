import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiting (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: 3 requests per 10 minutes per IP
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 3;

function getRateLimitKey(ip: string, userId?: string): string {
  return userId ? `user:${userId}` : `ip:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = getRateLimitKey(clientIP, userId);

    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { therapistName, therapistEmail, therapistId, bookingType } = body;

    if (!therapistName || !therapistEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: therapistName, therapistEmail' },
        { status: 400 },
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || 'User';

    // Email to therapist
    const therapistEmailContent = {
      from: 'Renavest <noreply@renavestapp.com>',
      to: therapistEmail,
      subject: 'New Booking Interest - Renavest',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New Booking Interest</h2>
          <p>Hello ${therapistName},</p>
          <p>A user has expressed interest in booking a session with you through Renavest.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">User Details:</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Booking Type:</strong> ${bookingType || 'External Calendar'}</p>
          </div>
          
          <p>Please reach out to them directly to schedule a session or provide them with your booking link.</p>
          
          <p>Best regards,<br>The Renavest Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent because a user clicked "Book" on your Renavest profile.
          </p>
        </div>
      `,
    };

    // Email to Renavest team
    const teamEmailContent = {
      from: 'Renavest <noreply@renavestapp.com>',
      to: 'seth@renavestapp.com', // Replace with your team email
      subject: 'Booking Interest Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Booking Interest Notification</h2>
          <p>A user has expressed interest in booking with a therapist.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Details:</h3>
            <p><strong>User:</strong> ${userName} (${userEmail})</p>
            <p><strong>Therapist:</strong> ${therapistName} (${therapistEmail})</p>
            <p><strong>Therapist ID:</strong> ${therapistId || 'N/A'}</p>
            <p><strong>Booking Type:</strong> ${bookingType || 'External Calendar'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <p>The therapist has been notified and should reach out to the user directly.</p>
        </div>
      `,
    };

    // Send both emails
    const [therapistEmailResult, teamEmailResult] = await Promise.allSettled([
      resend.emails.send(therapistEmailContent),
      resend.emails.send(teamEmailContent),
    ]);

    // Check if emails were sent successfully
    const therapistEmailSuccess = therapistEmailResult.status === 'fulfilled';
    const teamEmailSuccess = teamEmailResult.status === 'fulfilled';

    if (!therapistEmailSuccess && !teamEmailSuccess) {
      console.error('Both emails failed:', {
        therapistError:
          therapistEmailResult.status === 'rejected' ? therapistEmailResult.reason : null,
        teamError: teamEmailResult.status === 'rejected' ? teamEmailResult.reason : null,
      });
      return NextResponse.json({ error: 'Failed to send notification emails' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking interest notification sent successfully',
      emailsSent: {
        therapist: therapistEmailSuccess,
        team: teamEmailSuccess,
      },
    });
  } catch (error) {
    console.error('Error sending booking notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
