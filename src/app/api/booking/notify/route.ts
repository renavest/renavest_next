import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { sendBookingInterestNotification } from '@/src/features/booking/actions/sendBookingConfirmationEmail';

// Simple in-memory rate limiting (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: 3 requests per 10 minutes per IP/user
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
        { status: 429 }
      );
    }

    const body = await request.json();
    const { therapistName, therapistEmail, bookingType } = body;

    if (!therapistName || !therapistEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: therapistName, therapistEmail' },
        { status: 400 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || 'User';

    // Use the existing email infrastructure
    const result = await sendBookingInterestNotification({
      therapistName,
      therapistEmail,
      clientName: userName,
      clientEmail: userEmail || '',
      bookingType: bookingType || 'External Calendar',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send notification emails' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking interest notification sent successfully',
    });

  } catch (error) {
    console.error('Error sending booking notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
