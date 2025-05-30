import { ALLOWED_EMAILS, EMPLOYER_EMAIL_MAP } from '@/src/constants';
import { therapistList } from '@/therapistList';

export const checkEmailEligibility = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const emailDomain = normalizedEmail.split('@')[1];

  // Check against allowed emails (internal staff, etc.)
  if (ALLOWED_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  // Check against therapist emails, filtering out null emails
  const therapistEmails = therapistList
    .map((therapist) => therapist.email)
    .filter((therapistEmail) => therapistEmail !== null);

  if (therapistEmails.includes(normalizedEmail)) {
    return true;
  }

  // NEW: Check against employer domain mappings (allows employees from partner companies)
  if (EMPLOYER_EMAIL_MAP[normalizedEmail] || (emailDomain && EMPLOYER_EMAIL_MAP[emailDomain])) {
    return true;
  }

  return false;
};
