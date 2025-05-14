export type UserType = 'employee' | 'employer' | 'therapist';

interface AuthState {
  userType: UserType | null;
  isLoading: boolean;
  error: string | null;
}
