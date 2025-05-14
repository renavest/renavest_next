import { signal } from '@preact-signals/safe-react';

import { UserType } from '../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string;
  password: string;
  error?: string | null;
  isLoading: boolean;
  userType: UserType | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  email: '',
  password: '',
  error: null,
  isLoading: false,
  userType: null,
};

export const selectedRoleSignal = signal<UserType | null>(null);
// export const authModeSignal = signal<'signin' | 'signup'>('signin');
export const authErrorSignal = signal<string | null>(null);
const emailSignal = signal<string>('');
const passwordSignal = signal<string>('');
const companyIntegrationSignal = signal<string | null>(null);

const authState = signal<AuthState>(initialState);

const useAuthStore = <T>(selector: (state: AuthState) => T): T => {
  return selector(authState.value);
};

const updateAuthEmail = (email: string) => {
  authState.value = { ...authState.value, email };
};

const updateAuthPassword = (password: string) => {
  authState.value = { ...authState.value, password };
};

const setAuthError = (error: string | null) => {
  authState.value = { ...authState.value, error };
};

const setAuthLoading = (isLoading: boolean) => {
  authState.value = { ...authState.value, isLoading };
};

const resetAuth = () => {
  authState.value = initialState;
};

const setAuthStatus = (status: Partial<AuthState>) => {
  authState.value = { ...authState.value, ...status };
};

const setUserType = (userType: UserType | null) => {
  authState.value = { ...authState.value, userType };
  selectedRoleSignal.value = userType;
};

export const setCompanyIntegration = (company: string | null) => {
  companyIntegrationSignal.value = company;
  if (company) {
    localStorage.setItem('companyIntegration', company);
  } else {
    localStorage.removeItem('companyIntegration');
  }
};

export const getCompanyIntegration = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('companyIntegration') || companyIntegrationSignal.value;
};

const clearCompanyIntegration = () => {
  companyIntegrationSignal.value = null;
  localStorage.removeItem('companyIntegration');
};
