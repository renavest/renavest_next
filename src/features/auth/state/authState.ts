import { signal } from '@preact-signals/safe-react';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  password?: string | null;
  error?: string | null;
  isLoading?: boolean;
}

export const authState = signal<AuthState>({
  isAuthenticated: false,
  userId: null,
  email: null,
  password: null,
  error: null,
  isLoading: false,
});

export const useAuthStore = <T>(selector: (state: AuthState) => T): T => {
  return selector(authState.value);
};

export const updateAuthEmail = (email: string) => {
  authState.value = { ...authState.value, email };
};

export const updateAuthPassword = (password: string) => {
  authState.value = { ...authState.value, password };
};

export const setAuthError = (error: string | null) => {
  authState.value = { ...authState.value, error };
};

export const setAuthLoading = (isLoading: boolean) => {
  authState.value = { ...authState.value, isLoading };
};
