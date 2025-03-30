'use client';

import { useClerk } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_EMAILS } from '@/src/constants';
import { selectedRoleSignal } from '@/src/features/auth/state/authState';

import { submitOnboardingData } from '../actions/onboardingActions';
import { onboardingSignal, onboardingQuestions } from '../state/onboardingState';

export function useOnboardingSubmission() {
  const { user: clerkUser } = useClerk();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (selectedAnswers: Record<number, string[]>, currentStep: number) => {
    setIsSubmitting(true);

    // Get user role and email
    const userRole = selectedRoleSignal.value;
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';
    const isStaff = ['employee', 'therapist', 'employer'].includes(userRole || '');

    // Track onboarding submission start
    posthog.capture('onboarding_submission_start', {
      user_id: clerkUser?.id,
      email: userEmail,
      role: userRole,
      is_staff: isStaff,
      total_questions: onboardingQuestions.length,
      current_step: currentStep,
    });

    try {
      // Check if user is in allowed emails list (salesperson)
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
          email: userEmail,
          role: userRole,
          is_staff: isStaff,
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
              role: userRole,
            },
          });

          // Track successful onboarding completion
          posthog.capture('onboarding_completed', {
            user_id: clerkUser.id,
            email: userEmail,
            role: userRole,
            is_staff: isStaff,
            email_domain: userEmail.split('@')[1] || 'unknown',
            total_questions_answered: onboardingData.length,
          });

          // Identify user in PostHog
          posthog.identify(clerkUser.id, {
            email: userEmail,
            role: userRole,
            is_staff: isStaff,
          });
        }

        // Show success toast
        toast.success('Onboarding completed successfully!');

        // Close the onboarding modal
        onboardingSignal.value = {
          isComplete: true,
          currentStep: 0,
          answers: {},
        };
      } else {
        // Track skipped onboarding for salespeople
        posthog.capture('onboarding_skipped', {
          user_id: clerkUser?.id,
          email: userEmail,
          role: userRole,
          is_staff: isStaff,
          reason: 'Salesperson email',
          email_domain: userEmail.split('@')[1] || 'unknown',
        });
      }
    } catch (error) {
      // Track onboarding submission error
      posthog.capture('onboarding_submission_error', {
        user_id: clerkUser?.id,
        email: userEmail,
        role: userRole,
        is_staff: isStaff,
        error: error instanceof Error ? error.message : 'Unknown error',
        current_step: currentStep,
      });

      // Show error toast
      toast.error('Onboarding submission failed', {
        description: 'Please try again or contact support.',
      });

      console.error('Onboarding submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
