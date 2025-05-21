import { ALLOWED_EMAILS } from '@/src/constants';

export const checkEmailEligibility = async (email: string) => {
  if (ALLOWED_EMAILS.includes(email)) {
    return true;
  }
  return false;
};

