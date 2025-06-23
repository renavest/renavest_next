import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import type { ChatContext } from '../types';

export function useChatContext(): ChatContext {
  const { user, isLoaded } = useUser();
  const [chatContext, setChatContext] = useState<ChatContext>({
    userRole: null,
    therapistId: null,
    userId: null,
    isLoading: true,
  });

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has therapist role in metadata
      const therapistId = user.publicMetadata?.therapistId as number | undefined;

      setChatContext({
        userRole: therapistId ? 'therapist' : 'prospect',
        therapistId: therapistId || null,
        userId: null, // We'll need to get this from the database if needed
        isLoading: false,
      });
    } else if (isLoaded) {
      setChatContext({
        userRole: null,
        therapistId: null,
        userId: null,
        isLoading: false,
      });
    }
  }, [user, isLoaded]);

  return chatContext;
}
