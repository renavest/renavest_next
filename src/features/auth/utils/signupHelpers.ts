import { useSignUp } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';

import type { UserRole } from '@/src/shared/types';

import type { OnboardingData } from '../types';

import { checkEmailEligibility } from './emailEligibilityUtil';
import { setOnboardingData } from './onboardingStorage';

// Get the type from the hook's return type
type UseSignUpReturn = ReturnType<typeof useSignUp>;

// Validation helper functions
export const validateSignupForm = (firstName: string, lastName: string, password: string) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!firstName.trim()) {
    return 'First name is required.';
  }
  if (!lastName.trim()) {
    return 'Last name is required.';
  }
  return null;
};

// Error handling helper
export const handleSignupError = (err: unknown) => {
  if (isClerkAPIResponseError(err)) {
    const clerkError = err.errors[0];
    if (clerkError?.code === 'form_identifier_exists') {
      return 'An account with this email already exists. Please sign in instead.';
    } else if (clerkError?.code === 'oauth_identification_claimed') {
      return 'This Google account is already connected to an existing Renavest account. Please sign in instead or use a different email address.';
    } else if (clerkError?.code === 'session_exists') {
      return 'You are already signed in. Please refresh the page to continue.';
    } else if (clerkError?.code === 'oauth_account_already_connected') {
      return 'This Google account is already connected to another Renavest account. Please sign in or use a different Google account.';
    } else if (clerkError?.code === 'oauth_access_denied') {
      return 'Google access was denied. Please try again and grant the necessary permissions.';
    } else if (clerkError?.code === 'oauth_config_missing') {
      return 'Google sign-up is temporarily unavailable. Please use email signup or try again later.';
    } else if (clerkError?.code === 'form_password_pwned') {
      return 'This password has been found in a data breach. Please choose a different password.';
    } else if (clerkError?.code === 'form_password_too_common') {
      return 'This password is too common. Please choose a more secure password.';
    } else if (clerkError?.code === 'form_password_validation') {
      return 'Password does not meet security requirements. Please choose a stronger password.';
    } else if (clerkError?.code === 'captcha_invalid') {
      return 'Security validation failed. Please try using a different browser or disable extensions.';
    } else if (clerkError?.longMessage) {
      return clerkError.longMessage;
    } else if (clerkError?.message) {
      return clerkError.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  }
  return 'Signup failed due to an unexpected error. Please try again.';
};

// Google OAuth signup handler
export async function handleGoogleSignup(
  signUp: UseSignUpReturn['signUp'],
  onboardingData: OnboardingData,
  selectedRole: UserRole,
  selectedSponsoredGroup: string | null,
) {
  if (!signUp) {
    throw new Error('Signup service is currently unavailable. Please try again later.');
  }

  // Store onboarding data before OAuth
  try {
    setOnboardingData(onboardingData);
  } catch (error) {
    console.error('Failed to store onboarding data:', error);
    // Non-blocking - continue with signup
  }

  // Initiate Google OAuth signup with onboarding metadata
  await signUp.authenticateWithRedirect({
    strategy: 'oauth_google',
    redirectUrl: '/sso-callback',
    redirectUrlComplete: '/auth-check',
    unsafeMetadata: {
      role: selectedRole,
      onboardingComplete: false,
      purpose: onboardingData.purpose,
      ageRange: onboardingData.ageRange,
      maritalStatus: onboardingData.maritalStatus,
      ethnicity: onboardingData.ethnicity,
      agreeToTerms: true,
      sponsoredGroupName: selectedSponsoredGroup || '',
      signupMethod: 'google_oauth',
      signupTimestamp: new Date().toISOString(),
    },
  });
}

// Email/password signup handler
export async function handleEmailPasswordSignup(
  signUp: UseSignUpReturn['signUp'],
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  onboardingData: OnboardingData,
  selectedRole: UserRole,
  selectedSponsoredGroup: string | null,
) {
  // Comprehensive pre-validation
  const validationError = validateSignupForm(firstName, lastName, password);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!signUp) {
    throw new Error('Signup service is currently unavailable. Please try again later.');
  }

  // Check email eligibility
  try {
    const isEmailAllowed = await checkEmailEligibility(email);
    if (!isEmailAllowed) {
      throw new Error('This email domain is not authorized for signup. Please contact support.');
    }
  } catch (error) {
    console.error('Email eligibility check failed:', error);
    throw new Error('Unable to verify email eligibility. Please try again.');
  }

  // Store onboarding data before Clerk signup attempt
  try {
    setOnboardingData(onboardingData);
  } catch (error) {
    console.error('Failed to store onboarding data:', error);
    // Non-blocking - continue with signup
  }

  // Attempt Clerk user creation with comprehensive metadata
  const result = await signUp.create({
    emailAddress: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    unsafeMetadata: {
      role: selectedRole,
      onboardingComplete: false,
      firstName: firstName,
      lastName: lastName,
      email: email,
      purpose: onboardingData.purpose,
      ageRange: onboardingData.ageRange,
      maritalStatus: onboardingData.maritalStatus,
      ethnicity: onboardingData.ethnicity,
      agreeToTerms: onboardingData.agreeToTerms,
      sponsoredGroupName: selectedSponsoredGroup || '',
      signupMethod: 'email_password',
      signupTimestamp: new Date().toISOString(),
    },
  });

  return result;
}
