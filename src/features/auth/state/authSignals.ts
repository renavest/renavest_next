import { signal } from '@preact-signals/safe-react';

interface AuthState {
  email: string;
  code: string;
  isLoading: boolean;
  error?: string;
}

const initialState: AuthState = {
  email: '',
  code: '',
  isLoading: false,
  error: undefined,
};

export const authSignal = signal<AuthState>(initialState);

export const updateAuthEmail = (email: string) => {
  authSignal.value = { ...authSignal.value, email };
};

export const updateAuthCode = (code: string) => {
  authSignal.value = { ...authSignal.value, code };
};

export const setAuthLoading = (isLoading: boolean) => {
  authSignal.value = { ...authSignal.value, isLoading };
};

export const setAuthError = (error: string | undefined) => {
  authSignal.value = { ...authSignal.value, error };
};

export const resetAuth = () => {
  authSignal.value = initialState;
};
