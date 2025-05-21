export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'therapist' | 'employer_admin' | 'employee';
      onboardingComplete?: boolean; // Add the onboardingComplete flag
      [key: string]: unknown; // Allow other metadata properties
    };
  }
}
