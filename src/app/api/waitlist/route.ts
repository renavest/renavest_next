import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting for email submissions (simple in-memory store)
const submitAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function getRateLimitKey(ip: string): string {
  return `waitlist_${ip}`;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real.trim();
  }

  return 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempt = submitAttempts.get(key);

  if (!attempt) {
    submitAttempts.set(key, { count: 1, lastAttempt: now });
    return false;
  }

  // Reset if window has passed
  if (now - attempt.lastAttempt > RATE_LIMIT_WINDOW) {
    submitAttempts.set(key, { count: 1, lastAttempt: now });
    return false;
  }

  // Check if limit exceeded
  if (attempt.count >= MAX_ATTEMPTS) {
    return true;
  }

  // Increment counter
  submitAttempts.set(key, { count: attempt.count + 1, lastAttempt: now });
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitKey = getRateLimitKey(clientIP);

    // Check rate limiting
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Send notification email to the team
    const teamEmailResult = await resend.emails.send({
      from: 'Renavest Waitlist <waitlist@renavestapp.com>',
      to: ['seth@renavestapp.com', 'stanley@renavestapp.com'],
      subject: 'New Waitlist Signup - Renavest',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9071FF; font-size: 28px; font-weight: bold; margin: 0;">New Waitlist Signup</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #9071FF10 0%, #faf9f6 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #9071FF20;">
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 0; margin-bottom: 16px;">
              📧 New Email Subscription
            </h2>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0; color: #374151;">
                <strong style="color: #9071FF;">Email:</strong> ${email}
              </p>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px;">
              <p style="margin: 0; color: #374151;">
                <strong style="color: #9071FF;">Timestamp:</strong> ${new Date().toLocaleString(
                  'en-US',
                  {
                    timeZone: 'America/New_York',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  },
                )} EST
              </p>
            </div>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 12px;">📊 Next Steps</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Add to email marketing platform</li>
              <li style="margin-bottom: 8px;">Consider follow-up engagement</li>
              <li style="margin-bottom: 8px;">Track conversion metrics</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              This email was sent automatically from the Renavest waitlist page.
            </p>
          </div>
        </div>
      `,
    });

    // Send welcome email to the user
    const userEmailResult = await resend.emails.send({
      from: 'Renavest <hello@renavestapp.com>',
      to: [email],
      subject: 'Welcome to the Renavest Waitlist! 🎉',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: #9071FF; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">🎉</span>
            </div>
            <h1 style="color: #1f2937; font-size: 32px; font-weight: bold; margin: 0; line-height: 1.2;">
              You're on the list!
            </h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #9071FF10 0%, #faf9f6 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #9071FF20;">
            <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0;">
              Thank you for joining the <strong style="color: #9071FF;">Renavest waitlist</strong>! 
              You're now part of an exclusive group that will be the first to experience the future of financial wellness.
            </p>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 0; margin-bottom: 16px;">
              🌟 What to expect:
            </h2>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li style="margin-bottom: 8px;"><strong>Early access</strong> to our platform before anyone else</li>
              <li style="margin-bottom: 8px;"><strong>Exclusive updates</strong> on our development progress</li>
              <li style="margin-bottom: 8px;"><strong>Special pricing</strong> and perks for early adopters</li>
              <li style="margin-bottom: 8px;"><strong>Direct input</strong> on features and functionality</li>
            </ul>
          </div>
          
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-radius: 12px; padding: 20px; border: 1px solid #bbf7d0; margin-bottom: 24px;">
            <h3 style="color: #065f46; margin-top: 0; margin-bottom: 12px;">
              💡 While you wait...
            </h3>
            <p style="color: #047857; margin: 0; line-height: 1.6;">
              Follow us on social media or visit our website to stay updated on the latest financial wellness insights and our journey toward transforming how people relate to money.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://renavestapp.com" style="display: inline-block; background: #9071FF; color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(144, 113, 255, 0.3); transition: all 0.3s ease;">
              Visit Our Website
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0; line-height: 1.6;">
              Thank you for believing in our mission to revolutionize financial wellness.<br>
              Together, we're building something extraordinary.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
              © ${new Date().getFullYear()} Renavest. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    // Check for errors
    if (teamEmailResult.error) {
      console.error('Failed to send team notification email:', teamEmailResult.error);
      return NextResponse.json(
        { error: 'Failed to process request. Please try again.' },
        { status: 500 },
      );
    }

    if (userEmailResult.error) {
      console.error('Failed to send user welcome email:', userEmailResult.error);
      // Still consider this a success since the main notification went through
    }

    console.log('Waitlist signup processed successfully:', email);

    return NextResponse.json({
      success: true,
      message: 'Thank you for joining our waitlist!',
    });
  } catch (error) {
    console.error('Error processing waitlist signup:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    );
  }
}
