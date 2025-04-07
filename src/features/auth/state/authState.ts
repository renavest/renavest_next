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
export const emailSignal = signal<string>('');
export const passwordSignal = signal<string>('');

export const authState = signal<AuthState>(initialState);

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

export const resetAuth = () => {
  authState.value = initialState;
};

export const setAuthStatus = (status: Partial<AuthState>) => {
  authState.value = { ...authState.value, ...status };
};

export const setUserType = (userType: UserType | null) => {
  authState.value = { ...authState.value, userType };
  selectedRoleSignal.value = userType;
};

export const setSelectedRole = (role: UserType | null) => {
  selectedRoleSignal.value = role;
  localStorage.setItem('selectedRole', role || '');
};

export const getSelectedRole = (): UserType | null => {
  const role = localStorage.getItem('selectedRole') || selectedRoleSignal.value;
  if (!role) {
    return null;
  }
  return role as UserType;
};

export const clearSelectedRole = () => {
  localStorage.removeItem('selectedRole');
};
