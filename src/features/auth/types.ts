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

// Prop types for the authentication/onboarding step components

// Props for components/auth/RoleSelectionStep.tsx
export interface RoleSelectionStepProps {
  selectedRole: UserRole; // Should be null initially, then 'employee', 'therapist', or 'employer'
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void; // Handler to move to the next step (Login for existing, Signup for new)
  onBackToLogin: () => void; // Handler to go back to the very start (Role Selection) - effectively a reset
}

// Props for components/auth/LoginStep.tsx - This step is now primarily for logging in existing users
// It also provides a path to start the signup flow after role selection.
export interface LoginStepProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  onLogin: (e: React.FormEvent) => Promise<void>; // Handler for login form submission
  onSignupClick: () => void; // Handler to navigate to the start of the custom signup flow (Purpose step)
  onForgotPasswordClick: () => void; // Handler to navigate to the forgot password flow
  onBack: () => void; // Handler for linear back navigation (back to Role Selection)
}

// Props for components/auth/SignupStep.tsx - This is the final step after demographic questions (Employee) or directly after role selection (Therapist/Employer)
export interface SignupStepProps {
  firstName: string; // Pre-filled/editable
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string; // Pre-filled/editable
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  agreeToTerms: boolean;
  setAgreeToTerms: (value: boolean) => void;
  onSignUp: (e: React.FormEvent) => Promise<void>; // Handler for the final signup form submission (triggers Clerk signup)
  onBack: () => void; // Handler for linear back navigation (e.g., to EthnicityStep or Role Selection)
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
}

// Props for components/auth/EmailVerificationStep.tsx
export interface EmailVerificationStepProps {
  email: string; // Email address that the code was sent to (from Clerk or state)
  code: string;
  setCode: (value: string) => void; // Setter for the verification code input
  onSubmit: (e: React.FormEvent) => Promise<void>; // Handler for submitting the verification code
  onResendClick: () => Promise<void>; // Handler for resending the verification email
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
}

// Props for components/auth/ForgotPasswordStep.tsx
export interface ForgotPasswordStepProps {
  email: string; // Email address input for the reset request
  setEmail: (value: string) => void; // Setter for the email input
  onSubmit: (e: React.FormEvent) => Promise<void>; // Handler for submitting the forgot password request (sends email)
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
}

// Props for components/auth/ResetPasswordStep.tsx
export interface ResetPasswordStepProps {
  code: string; // Input for the reset verification code (pre-filled from URL if deep link)
  setCode: (value: string) => void; // Setter for the code input
  newPassword: string; // Input for the new password
  setNewPassword: (value: string) => void; // Setter for the new password input
  onSubmit: (e: React.FormEvent) => Promise<void>; // Handler for submitting the new password and code
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
}

// Props for components/onboarding/PurposeStep.tsx (Employee specific onboarding)
export interface RenavestPurposeStepProps {
  selectedPurpose: string;
  onPurposeSelect: (purpose: string) => void; // Handler for selecting a purpose
  onContinue: () => void; // Handler to move to the next step (AgeRangeStep)
  onBack: () => void; // Handler for linear back navigation (to Login step)
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
  firstName: string; // State for first name (collected in this step's input)
  setFirstName: (value: string) => void; // Setter for first name state
}

// Props for components/onboarding/AgeRangeStep.tsx (Employee specific onboarding)
export interface AgeRangeStepProps {
  selectedAgeRange: string;
  onAgeRangeSelect: (ageRange: string) => void; // Handler for selecting age range
  onContinue: () => void; // Handler to move to the next step (MaritalStatusStep)
  onBack: () => void; // Handler for linear back navigation (to PurposeStep)
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
  firstName: string; // Display first name
}

// Props for components/onboarding/MaritalStatusStep.tsx (Employee specific onboarding)
export interface MaritalStatusStepProps {
  selectedMaritalStatus: string;
  onMaritalStatusSelect: (maritalStatus: string) => void; // Handler for selecting marital status
  onContinue: () => void; // Handler to move to the next step (EthnicityStep)
  onBack: () => void; // Handler for linear back navigation (to AgeRangeStep)
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
  firstName: string; // Display first name
}

// Props for components/onboarding/EthnicityStep.tsx (Employee specific onboarding)
export interface EthnicityStepProps {
  selectedEthnicity: string;
  onEthnicitySelect: (ethnicity: string) => void; // Handler for selecting ethnicity
  onContinue: () => void; // Handler to move to the next step (SignupStep)
  onBack: () => void; // Handler for linear back navigation (to MaritalStatusStep)
  onBackToLogin: () => void; // Handler for explicit back to Role Selection
  firstName: string; // Display first name
}
export interface CompleteOnboardingError {
  type: 'AuthMismatch' | 'MissingRole' | 'DatabaseError';
  message: string;
}

// Note: Quiz and Consultation steps/types are not included here as they are
// now part of the post-onboarding flow, likely within the employee dashboard.
