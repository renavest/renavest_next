import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useEffect } from 'react';

import { selectedRoleSignal } from '../state/authState';

export function usePostHogIdentify() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const userEmail = user.emailAddresses[0]?.emailAddress;
      const userRole = selectedRoleSignal.value;

      if (userEmail) {
        posthog.identify(user.id, {
          email: userEmail,
          role: userRole,
          is_staff: ['employee', 'therapist', 'employer'].includes(userRole || ''),
        });

        // Additional tracking for session replay distinction
        posthog.capture('user_authenticated', {
          email: userEmail,
          role: userRole,
          is_staff: ['employee', 'therapist', 'employer'].includes(userRole || ''),
        });
      }
    }
  }, [user]);
}

export default usePostHogIdentify;
