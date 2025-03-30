'use client';

import { useClerk } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { signal } from '@preact-signals/safe-react';
import { toast } from 'sonner';

import { ALLOWED_EMAILS } from '@/src/constants';
import { submitOnboardingData } from '../actions/onboardingActions';
import { onboardingSignal } from '../state/onboardingState';

export function useOnboardingSubmission() {
  const { user: clerkUser } = useClerk();
  const isSubmitting = signal(false);

  const handleSubmit = async (selectedAnswers: Record<number, string[]>, currentStep: number) => {
    isSubmitting.value = true;

    // Track onboarding submission start
    posthog.capture('onboarding_submission_start', {
      user_id: clerkUser?.id,
      total_questions: Object.keys(selectedAnswers).length,
      current_step: currentStep,
    });

    try {
      // Check if user is in allowed emails list (salesperson)
      const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';
      const isAllowedEmail = ALLOWED_EMAILS.includes(userEmail);

      if (!isAllowedEmail) {
        // Prepare onboarding data for tracking
        const onboardingData = Object.entries(selectedAnswers).map(([questionId, answers]) => ({
          questionId: parseInt(questionId),
          answers,
        }));

        // Track onboarding data details
        posthog.capture('onboarding_data_collected', {
          user_id: clerkUser?.id,
          email_domain: userEmail.split('@')[1] || 'unknown',
          total_questions_answered: onboardingData.length,
          questions_data: onboardingData.map((q) => ({
            questionId: q.questionId,
            answersCount: q.answers.length,
          })),
        });

        // Only submit data for non-salespeople
        await submitOnboardingData(selectedAnswers);

        // Update Clerk user metadata to mark onboarding as complete
        if (clerkUser) {
          await clerkUser.update({
            unsafeMetadata: {
              ...clerkUser.unsafeMetadata,
              onboardingComplete: true,
            },
          });

          // Track successful onboarding completion
          posthog.capture('onboarding_completed', {
            user_id: clerkUser.id,
            email_domain: userEmail.split('@')[1] || 'unknown',
            total_questions_answered: onboardingData.length,
          });
        }

        // Show success toast
        toast.success('Onboarding completed successfully!', {
          description: `We've matched you with personalized financial insights.`,
        });

        // Close the onboarding modal
        onboardingSignal.value = {
          ...onboardingSignal.value,
          isComplete: true,
        };
      } else {
        // Track skipped onboarding for salespeople
        posthog.capture('onboarding_skipped', {
          user_id: clerkUser?.id,
          reason: 'Salesperson email',
          email_domain: userEmail.split('@')[1] || 'unknown',
        });
      }
    } catch (error) {
      // Track onboarding submission error
      posthog.capture('onboarding_submission_error', {
        user_id: clerkUser?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        current_step: currentStep,
      });

      // Show error toast
      toast.error('Onboarding submission failed', {
        description: 'Please try again or contact support.',
      });

      console.error('Onboarding submission error:', error);
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}
