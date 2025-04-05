import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';

import { UserType } from '../types/auth';

interface ClerkUserMetadata {
  role?: UserType | null;
  onboardingComplete?: boolean;
  [key: string]: unknown;
}

/**
 * Centralized method for updating Clerk user metadata client-side
 * @param metadata Metadata to update
 */
export function useClerkUserMetadata() {
  const { user } = useUser();

  const updateUserMetadata = async (metadata: ClerkUserMetadata): Promise<void> => {
    if (!user) {
      console.warn('No user found to update metadata');
      return;
    }

    try {
      await user.update({
        unsafeMetadata: metadata,
      });

      posthog.capture('user_metadata_updated', {
        metadataKeys: Object.keys(metadata),
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to update user metadata:', error);

      posthog.capture('user_metadata_update_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: Object.keys(metadata),
        userId: user.id,
      });

      throw error;
    }
  };

  const updateUserRole = async (role: UserType | null): Promise<void> => {
    if (!role) {
      console.warn('No role provided to update');
      return;
    }

    await updateUserMetadata({
      role,
      onboardingComplete: role !== null,
    });
  };

  return {
    updateUserMetadata,
    updateUserRole,
  };
}
