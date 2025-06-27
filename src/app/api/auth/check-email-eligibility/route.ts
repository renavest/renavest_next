import { NextRequest, NextResponse } from 'next/server';

import { ALLOWED_EMAILS, EMPLOYER_EMAIL_MAP } from '@/src/constants';
import { db } from '@/src/db';
import { pendingTherapists } from '@/src/db/schema';

// Simple in-memory rate limiting cache
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 20; // Max 20 email checks per 5 minutes per IP

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (limit.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  limit.count++;
  return false;
}

function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false; // RFC 5321 limit

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // Rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email } = body;

    // Input validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { eligible: false, reason: 'Invalid email format' },
        { status: 400 },
      );
    }

    const normalizedEmail = sanitizeEmail(email);
    const emailDomain = normalizedEmail.split('@')[1];

    // Check against allowed emails (internal staff, etc.)
    if (ALLOWED_EMAILS.includes(normalizedEmail)) {
      return NextResponse.json({ eligible: true, reason: 'Authorized email' });
    }

    // Check against employer domain mappings
    if (EMPLOYER_EMAIL_MAP[normalizedEmail] || (emailDomain && EMPLOYER_EMAIL_MAP[emailDomain])) {
      return NextResponse.json({ eligible: true, reason: 'Partner organization' });
    }

    // Check against pending therapist emails from database with timeout
    try {
      const queryPromise = db
        .select({ clerkEmail: pendingTherapists.clerkEmail })
        .from(pendingTherapists);

      // Add 5 second timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000);
      });

      const pendingTherapistResult = await Promise.race([queryPromise, timeoutPromise]);

      const pendingTherapistEmails = pendingTherapistResult
        .map((therapist) => therapist.clerkEmail?.toLowerCase().trim())
        .filter((email) => email !== null && email !== undefined);

      if (pendingTherapistEmails.includes(normalizedEmail)) {
        return NextResponse.json({ eligible: true, reason: 'Pending therapist' });
      }
    } catch (error) {
      console.error('Error checking pending therapists:', error);
      // Fail safely - continue with check completion
      // In production, you might want to return false here for security
    }

    // Email not found in any eligible lists - allow as individual consumer (B2C user)
    return NextResponse.json({ eligible: true, reason: 'Individual consumer' });
  } catch (error) {
    console.error('Error in email eligibility check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
