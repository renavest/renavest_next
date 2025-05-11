import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { toast } from 'sonner';

import { UserType } from '../types/auth';

/**
 * Centralized method for updating Clerk user metadata client-side
 * @param metadata Metadata to update
 */

export function identifyAndGroupUser(
  userId: string,
  role: UserType,
  email: string,
  companyId?: string,
  companyName?: string,
) {
  posthog.identify(userId, {
    role,
    email,
    email_domain: email?.split('@')[1],
  });
  if (companyId) {
    posthog.group('company', companyId, { name: companyName });
  }
}
