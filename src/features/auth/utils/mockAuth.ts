import { signal } from '@preact-signals/safe-react';

interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  publicMetadata: {
    role?: string;
  };
}

const mockUserSignal = signal<MockUser>({
  id: 'mock_user_id',
  firstName: 'Demo',
  lastName: 'User',
  emailAddress: 'demo@example.com',
  publicMetadata: {},
});

export const mockAuth = {
  isLoaded: true,
  isSignedIn: true,
  user: mockUserSignal.value,
  signIn: {
    authenticateWithRedirect: async ({ redirectUrlComplete }: { redirectUrlComplete: string }) => {
      // Simulate a delay to make it feel more realistic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.location.href = redirectUrlComplete;
      return {};
    },
    create: async (params: { emailAddress: string; password: string }) => {
      // Simulate a delay to make it feel more realistic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      mockUserSignal.value = {
        ...mockUserSignal.value,
        emailAddress: params.emailAddress,
      };
      return { status: 'complete' };
    },
  },
  setActive: async () => {
    return { status: 'complete' };
  },
};

export const setMockUserRole = (role: string) => {
  mockUserSignal.value = {
    ...mockUserSignal.value,
    publicMetadata: {
      role,
    },
  };
};
