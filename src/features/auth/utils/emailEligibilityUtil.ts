import { ALLOWED_EMAILS, EMPLOYER_EMAIL_MAP } from '@/src/constants';

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

export const checkEmailEligibility = async (email: string) => {
  // Input validation
  if (!validateEmail(email)) {
    return false;
  }

  const normalizedEmail = sanitizeEmail(email);
  const emailDomain = normalizedEmail.split('@')[1];

  // Quick local checks first (avoid API call if possible)
  if (ALLOWED_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  if (EMPLOYER_EMAIL_MAP[normalizedEmail] || (emailDomain && EMPLOYER_EMAIL_MAP[emailDomain])) {
    return true;
  }

  // Call API endpoint for database checks
  try {
    const response = await fetch('/api/auth/check-email-eligibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    if (response.status === 429) {
      console.warn('Rate limit exceeded for email eligibility check');
      return false;
    }

    if (!response.ok) {
      console.error('Email eligibility API error:', response.status);
      return false;
    }

    const result = await response.json();
    return result.eligible === true;
  } catch (error) {
    console.error('Error checking email eligibility:', error);
    // Fail safely - return true for individual consumers if API is unavailable
    return true;
  }
};
