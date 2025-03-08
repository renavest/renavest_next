import { signal } from '@preact-signals/safe-react';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
}

export const authState = signal<AuthState>({
  isAuthenticated: false,
  userId: null,
  email: null,
});

export const useAuthStore = (selector: (state: AuthState) => any) => {
  return selector(authState.value);
};

export const updateAuthEmail = (email: string) => {
  authState.value = { ...authState.value, email, error: null };
};

export const updateAuthCode = (code: string) => {
  authState.value = { ...authState.value, code, error: null };
};

export const setAuthError = (error: string) => {
  authState.value = { ...authState.value, error };
};

export const setAuthLoading = (isLoading: boolean) => {
  authState.value = { ...authState.value, isLoading };
};
