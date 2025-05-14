import posthog from 'posthog-js';

export type OnboardingContext = {
  userEmail: string;
  userRole: string | null;
  currentStep: number;
};

export type OnboardingData = {
  questionId: number;
  answers: string[];
};

const isStaffRole = (role: string | null): boolean =>
  ['employee', 'therapist', 'employer'].includes(role || '');

const trackEvent = (
  event_name: string,
  additionalProps: Record<string, unknown> = {},
  userContext: { user_id?: string; company_id?: string } = {},
) => {
  posthog.capture(`onboarding:${event_name}_v1`, {
    ...userContext,
    ...additionalProps,
  });
};

export const trackOnboardingStart = (context: OnboardingContext, totalQuestions: number) => {
  trackEvent('onboarding_submission_start', {
    email: context.userEmail,
    role: context.userRole,
    is_staff: isStaffRole(context.userRole),
    total_questions: totalQuestions,
    current_step: context.currentStep,
  });
};

export const trackOnboardingDataCollection = (
  onboardingData: OnboardingData[],
  context: OnboardingContext,
) => {
  trackEvent('onboarding_data_collected', {
    email: context.userEmail,
    role: context.userRole,
    is_staff: isStaffRole(context.userRole),
    email_domain: context.userEmail.split('@')[1] || 'unknown',
    total_questions_answered: onboardingData.length,
    questions_data: onboardingData.map((q) => ({
      questionId: q.questionId,
      answersCount: q.answers.length,
    })),
  });
};

export const trackOnboardingCompletion = (
  context: OnboardingContext,
  onboardingData: OnboardingData[],
) => {
  trackEvent('onboarding_completed', {
    email: context.userEmail,
    role: context.userRole,
    is_staff: isStaffRole(context.userRole),
    email_domain: context.userEmail.split('@')[1] || 'unknown',
    total_questions_answered: onboardingData.length,
  });
};

export const trackOnboardingSkipped = (context: OnboardingContext) => {
  trackEvent('onboarding_skipped', {
    email: context.userEmail,
    role: context.userRole,
    is_staff: isStaffRole(context.userRole),
    reason: 'Salesperson email',
    email_domain: context.userEmail.split('@')[1] || 'unknown',
  });
};

export const trackOnboardingError = (context: OnboardingContext, error: unknown) => {
  trackEvent('onboarding_submission_error', {
    email: context.userEmail,
    role: context.userRole,
    is_staff: isStaffRole(context.userRole),
    error: error instanceof Error ? error.message : 'Unknown error',
    current_step: context.currentStep,
  });
};
