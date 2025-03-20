export type UserType = 'employee' | 'employer' | 'therapist';

export interface AuthState {
  userType: UserType | null;
  isLoading: boolean;
  error: string | null;
}
