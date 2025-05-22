import { ALLOWED_EMAILS } from '@/src/constants';
import { therapistList } from '@/therapistList';

export const checkEmailEligibility = async (email: string) => {
  // Check against allowed emails
  if (ALLOWED_EMAILS.includes(email)) {
    return true;
  }

  // Check against therapist emails, filtering out null emails
  const therapistEmails = therapistList
    .map((therapist) => therapist.email)
    .filter((therapistEmail) => therapistEmail !== null);

  if (therapistEmails.includes(email)) {
    return true;
  }

  return false;
};
