'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_EMAILS } from '@/src/constants';
import { selectedRoleSignal } from '@/src/features/auth/state/authState';

import { submitOnboardingData } from '../actions/onboardingActions';
import { onboardingSignal, onboardingQuestions } from '../state/onboardingState';
import {
  OnboardingContext,
  OnboardingData,
  trackOnboardingStart,
  trackOnboardingDataCollection,
  trackOnboardingCompletion,
  trackOnboardingSkipped,
  trackOnboardingError,
} from '../utils/onboardingTracking';

export function useOnboardingSubmission() {
  const { user: clerkUser } = useClerk();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prepareOnboardingData = (selectedAnswers: Record<number, string[]>): OnboardingData[] =>
    Object.entries(selectedAnswers).map(([questionId, answers]) => ({
      questionId: parseInt(questionId),
      answers,
    }));

  const updateClerkUserMetadata = async (userRole: string | null) => {
    if (clerkUser) {
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          onboardingComplete: true,
          role: userRole,
        },
      });
    }
  };

  const processNonSalespersonOnboarding = async (
    selectedAnswers: Record<number, string[]>,
    context: OnboardingContext,
  ) => {
    const onboardingData = prepareOnboardingData(selectedAnswers);

    // Track data collection
    trackOnboardingDataCollection(onboardingData, context);

    await submitOnboardingData(selectedAnswers);
    await updateClerkUserMetadata(context.userRole);

    // Track completion
    trackOnboardingCompletion(context, onboardingData);

    // Identify user
    posthog.identify(user?.id || clerkUser?.id, {
      email: context.userEmail,
      role: context.userRole,
      is_staff: ['employee', 'therapist', 'employer'].includes(context.userRole || ''),
      onboarding_complete: true,
      created_at: user?.createdAt || new Date().toISOString(),
    });

    toast.success('Onboarding completed successfully!');

    onboardingSignal.value = {
      isComplete: true,
      currentStep: 0,
      answers: {},
    };
  };

  const handleSubmit = async (selectedAnswers: Record<number, string[]>, currentStep: number) => {
    setIsSubmitting(true);

    const userRole = selectedRoleSignal.value;
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';

    const context: OnboardingContext = {
      userEmail,
      userRole,
      currentStep,
    };

    try {
      const isAllowedEmail = ALLOWED_EMAILS.includes(userEmail);

      // Tracking start of onboarding
      trackOnboardingStart(context, onboardingQuestions.length);

      if (!isAllowedEmail) {
        await processNonSalespersonOnboarding(selectedAnswers, context);
      } else {
        // Track skipped onboarding for salespeople
        trackOnboardingSkipped(context);

        // Identify user even for allowed emails
        posthog.identify(user?.id || clerkUser?.id, {
          email: context.userEmail,
          role: context.userRole,
          is_staff: ['employee', 'therapist', 'employer'].includes(context.userRole || ''),
          onboarding_complete: true,
          created_at: user?.createdAt || new Date().toISOString(),
        });
        
        toast.error('Onboarding completed successfully!');

        onboardingSignal.value = {
          isComplete: true,
          currentStep: 0,
          answers: {},
        };
      }
    } catch (error) {
      // Track submission error
      trackOnboardingError(context, error);

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
