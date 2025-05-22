import { useSignIn } from '@clerk/nextjs';

import { authErrorSignal } from '../state/authState';
import { email, password } from '../state/authState';
import { trackLoginAttempt, trackLoginSuccess } from '../utils/authTracking';

export const handleLogin = async (email: string, password: string) => {
  authErrorSignal.value = null;
  const { signIn } = useSignIn();
  try {
    trackLoginAttempt('email', { email: email });

    const result = await signIn.create({
      identifier: email.value,
      password: password.value,
    });

    if (result.status === 'complete') {
      trackLoginSuccess('email', { email: email.value, role: getDefaultUserType() });
      // Clerk middleware should handle redirecting authenticated users
      // (including the onboarding check if they haven't completed it)
      // router.push('/employee'); // Redirect handled by middleware/config or Clerk redirect URL
    } else {
      console.log('Sign-in status:', result.status);
      // Handle other statuses like 'needs_second_factor', etc.
      authErrorSignal.value = 'Sign-in requires further verification.';
    }
  } catch (error) {
    console.error('Email sign-in error:', error);
    trackLoginError('email', error, { email: email.value, role: getDefaultUserType() });

    if (error instanceof Error && 'errors' in error) {
      const clerkErrors = (error as { errors: Array<{ code: string; longMessage?: string }> })
        .errors;
      if (clerkErrors && clerkErrors.length > 0) {
        const clerkError = clerkErrors[0];
        switch (clerkError.code) {
          case 'form_identifier_not_found':
            authErrorSignal.value = 'No account found with this email address.';
            break;
          case 'form_password_incorrect':
            authErrorSignal.value = 'Invalid email or password.';
            break;
          case 'form_not_found':
            authErrorSignal.value = 'Authentication form not found. Contact support.';
            break;
          default:
            authErrorSignal.value = clerkError.longMessage || 'Sign-in failed. Please try again.';
        }
      } else {
        authErrorSignal.value = 'An error occurred during sign-in. Please try again.';
      }
    } else {
      authErrorSignal.value = 'An unexpected error occurred. Please try again.';
    }
  }
};
