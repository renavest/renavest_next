// src/features/auth/state/authState.ts
// state/authState.ts

import { signal } from '@preact-signals/safe-react'; // Ensure correct import for Preact Signals with React adapter

import type { UserRole } from '@/src/shared/types';

import { OnboardingStep } from '../types'; // Import types and enum

// Global signal for auth-related errors
export const authErrorSignal = signal<string | null>(null);

// Authentication Inputs (used for Login, Signup, and Forgot Password)
export const email = signal('');
export const password = signal('');

// --- Role Selection State ---
export const selectedRole = signal<UserRole>(null);

// --- NEW: Sponsored Group State ---
export const selectedSponsoredGroup = signal<string | null>(null);

// Initial Onboarding Data (collected across steps BEFORE Clerk signup for Employee role)
// These signals hold the state of the multi-step form for employees
export const firstName = signal('');
export const lastName = signal(''); // Collected in the final SIGNUP step
export const agreeToTerms = signal(false); // Collected in the final SIGNUP step
export const selectedPurpose = signal('');
export const selectedAgeRange = signal('');
export const selectedMaritalStatus = signal('');
export const selectedEthnicity = signal('');

// Flow State for AuthenticationFlow component
// Start at LOGIN
export const currentStep = signal<OnboardingStep>(OnboardingStep.LOGIN);

// Email Verification State (used if email verification is required by Clerk)
export const verificationEmailAddress = signal(''); // Email address sent to
export const emailVerificationCode = signal(''); // Code entered by user

// Forgot/Reset Password State
export const forgotPasswordEmailAddress = signal(''); // Email address for reset request
export const resetPasswordCode = signal(''); // Code entered by user
export const resetPasswordNewPassword = signal(''); // New password entered by user
