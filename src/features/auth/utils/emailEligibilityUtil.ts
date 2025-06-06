import { ALLOWED_EMAILS, EMPLOYER_EMAIL_MAP } from '@/src/constants';
import { db } from '@/src/db';
import { pendingTherapists } from '@/src/db/schema';

export const checkEmailEligibility = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const emailDomain = normalizedEmail.split('@')[1];

  // Check against allowed emails (internal staff, etc.)
  if (ALLOWED_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  // Check against pending therapist emails from database
  try {
    const pendingTherapistResult = await db
      .select({ clerkEmail: pendingTherapists.clerkEmail })
      .from(pendingTherapists);

    const pendingTherapistEmails = pendingTherapistResult
      .map((therapist) => therapist.clerkEmail?.toLowerCase().trim())
      .filter((email) => email !== null && email !== undefined);

    if (pendingTherapistEmails.includes(normalizedEmail)) {
      return true;
    }
  } catch (error) {
    console.error('Error checking pending therapists:', error);
    // Continue with other checks if database query fails
  }

  // Check against employer domain mappings (allows employees from partner companies)
  if (EMPLOYER_EMAIL_MAP[normalizedEmail] || (emailDomain && EMPLOYER_EMAIL_MAP[emailDomain])) {
    return true;
  }

  return false;
};
