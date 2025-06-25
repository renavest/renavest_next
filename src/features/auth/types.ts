// src/features/auth/types/index.ts
// types/index.ts

import { UserRole } from '@/src/shared/types';

// Enum defining the different steps in the authentication and initial onboarding flow
export enum OnboardingStep {
  LOGIN = 'LOGIN',
  ROLE_SELECTION = 'ROLE_SELECTION',
  PURPOSE = 'PURPOSE',
  AGE_RANGE = 'AGE_RANGE',
  MARITAL_STATUS = 'MARITAL_STATUS',
  ETHNICITY = 'ETHNICITY',
  PRIVACY_PLEDGE = 'PRIVACY_PLEDGE',
  SIGNUP = 'SIGNUP',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  ONBOARDING_LOADING = 'ONBOARDING_LOADING',
}

// Interface for the data collected during the initial onboarding steps
// This data is collected across multiple steps before the final Clerk signup call
// This structure is passed to the completeOnboardingProfile server action
export interface OnboardingData {
  clerkId?: string; // Clerk user ID, available after successful Clerk signup
  firstName: string; // Collected in PurposeStep (and SignupStep input) or SignupStep
  lastName: string; // Collected in SignupStep
  email: string; // Collected in SignupStep
  agreeToTerms: boolean; // Collected in SignupStep
  // Demographic fields (collected for Employee only)
  purpose?: string;
  ageRange?: string;
  maritalStatus?: string;
  ethnicity?: string;
  role?: UserRole;

  // Add other initial onboarding fields here if needed
}

// Error types
export interface CompleteOnboardingError {
  type: 'AuthMismatch' | 'MissingRole' | 'DatabaseError';
  message: string;
}

// ===== COMPONENT PROP TYPES =====

// Logout button component props
export interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

// Role selection step props
export interface RoleSelectionStepProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void;
  onBackToLogin: () => void;
}

// Login step props
export interface LoginStepProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onLogin: (e: React.FormEvent) => Promise<void>;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
  onBack: () => void;
}

// Signup step props
export interface SignupStepProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  agreeToTerms: boolean;
  setAgreeToTerms: (value: boolean) => void;
  onSignUp: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
  onBackToLogin: () => void;
}

// Email verification step props
export interface EmailVerificationStepProps {
  email: string;
  code: string;
  setCode: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onResendClick: () => Promise<void>;
  onBackToLogin: () => void;
}

// Forgot password step props
export interface ForgotPasswordStepProps {
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBackToLogin: () => void;
}

// Reset password step props
export interface ResetPasswordStepProps {
  code: string;
  setCode: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBackToLogin: () => void;
}

// Onboarding step props
export interface PurposeStepProps {
  selectedPurpose: string;
  onPurposeSelect: (purpose: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onBackToLogin: () => void;
  firstName: string;
  setFirstName: (value: string) => void;
}

export interface AgeRangeStepProps {
  selectedAgeRange: string;
  onAgeRangeSelect: (ageRange: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onBackToLogin: () => void;
  firstName: string;
}

export interface MaritalStatusStepProps {
  selectedMaritalStatus: string;
  onMaritalStatusSelect: (maritalStatus: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onBackToLogin: () => void;
  firstName: string;
}

export interface EthnicityStepProps {
  selectedEthnicity: string;
  onEthnicitySelect: (ethnicity: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onBackToLogin: () => void;
  firstName: string;
}

// Note: Quiz and Consultation steps/types are not included here as they are
// now part of the post-onboarding flow, likely within the employee dashboard.
