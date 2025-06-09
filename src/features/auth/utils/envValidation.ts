// src/features/auth/utils/envValidation.ts
// Environment validation utilities for Clerk authentication

export interface ClerkEnvValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export const validateClerkEnvironment = (): ClerkEnvValidation => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey) {
    issues.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
  } else {
    // Validate key format
    const isDev = publishableKey.startsWith('pk_test_');
    const isProd = publishableKey.startsWith('pk_live_');

    if (!isDev && !isProd) {
      issues.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has invalid format');
    }

    if (process.env.NODE_ENV === 'production' && isDev) {
      warnings.push('Using development publishable key in production');
    }
  }

  if (!secretKey) {
    issues.push('CLERK_SECRET_KEY is missing (required for server-side operations)');
  } else {
    const isDev = secretKey.startsWith('sk_test_');
    const isProd = secretKey.startsWith('sk_live_');

    if (!isDev && !isProd) {
      issues.push('CLERK_SECRET_KEY has invalid format');
    }

    if (process.env.NODE_ENV === 'production' && isDev) {
      warnings.push('Using development secret key in production');
    }
  }

  // Check optional but recommended variables
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;

  if (!signInUrl) {
    warnings.push('NEXT_PUBLIC_CLERK_SIGN_IN_URL not set (using default)');
  }

  if (!signUpUrl) {
    warnings.push('NEXT_PUBLIC_CLERK_SIGN_UP_URL not set (using default)');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
};

export const logClerkEnvironmentStatus = (): void => {
  const validation = validateClerkEnvironment();

  if (!validation.isValid) {
    console.error('❌ Clerk Environment Issues:', validation.issues);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Clerk Environment Warnings:', validation.warnings);
  }

  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ Clerk Environment Validation Passed');
  }
};
