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

// Safely check localStorage only on the client side
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorageItem = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const selectedRoleSignal = signal<UserType | null>(
  getLocalStorageItem('selectedRole') as UserType | null,
);
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
  setLocalStorageItem('selectedRole', role || '');
};

export const getSelectedRole = (): UserType | null => {
  const role = getLocalStorageItem('selectedRole');
  return role ? (role as UserType) : null;
};

export const clearSelectedRole = () => {
  selectedRoleSignal.value = null;
  removeLocalStorageItem('selectedRole');
};
