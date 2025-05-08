'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_EMAILS } from '@/src/constants';
import { getSelectedRole } from '@/src/features/auth/state/authState';
import { UserType } from '@/src/features/auth/types/auth';
import { useClerkUserMetadata } from '@/src/features/auth/utils/clerkUtils';

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
  const { updateUserRole } = useClerkUserMetadata();

  const prepareOnboardingData = (selectedAnswers: Record<number, string[]>): OnboardingData[] =>
    Object.entries(selectedAnswers).map(([questionId, answers]) => ({
      questionId: parseInt(questionId),
      answers,
    }));

  const identifyUser = (context: OnboardingContext, isStaff: boolean) => {
    const onboardingAnswers = onboardingSignal.value.answers;

    posthog.identify(user?.id || clerkUser?.id, {
      email: context.userEmail,
      role: context.userRole,
      is_staff: isStaff,
      onboarding_complete: true,
      created_at: user?.createdAt || createDate().toISO(),
      onboarding_questions: Object.entries(onboardingAnswers).map(([questionId, answers]) => ({
        questionId: parseInt(questionId),
        answers,
      })),
      total_onboarding_questions_answered: Object.keys(onboardingAnswers).length,
    });
  };

  const finishOnboarding = () => {
    toast.success('Onboarding completed successfully!');

    onboardingSignal.value = {
      isComplete: true,
      currentStep: 0,
      answers: {},
    };
  };

  const processSalespersonOnboarding = async (
    selectedAnswers: Record<number, string[]>,
    context: OnboardingContext,
  ) => {
    // Track skipped onboarding for salespeople
    trackOnboardingSkipped(context);

    // Update Clerk metadata for salespeople
    await updateUserRole(context.userRole as UserType);

    // Identify user even for allowed emails
    identifyUser(
      context,
      ['employee', 'therapist', 'employer', 'salesperson'].includes(context.userRole || ''),
    );

    finishOnboarding();
  };

  const processNonSalespersonOnboarding = async (
    selectedAnswers: Record<number, string[]>,
    context: OnboardingContext,
  ) => {
    const onboardingData = prepareOnboardingData(selectedAnswers);

    // Track data collection
    trackOnboardingDataCollection(onboardingData, context);

    // Submit onboarding data to database
    await submitOnboardingData(selectedAnswers);

    // Update Clerk metadata
    await updateUserRole(context.userRole as UserType);

    // Track completion
    trackOnboardingCompletion(context, onboardingData);

    // Identify user
    identifyUser(context, ['employee', 'therapist', 'employer'].includes(context.userRole || ''));

    finishOnboarding();
  };

  const handleSubmit = async (selectedAnswers: Record<number, string[]>, currentStep: number) => {
    setIsSubmitting(true);

    // Use the role set in LoginForm via selectedRoleSignal
    const userRole = getSelectedRole();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';

    const context: OnboardingContext = {
      userEmail,
      userRole,
      currentStep,
    };

    try {
      // Validate inputs with more comprehensive role checking
      if (!userRole) {
        // If no role is found, prompt user to select a role
        toast.error('User role is required', {
          description: 'Please select a role before continuing.',
        });
        throw new Error('User role is required');
      }

      // Tracking start of onboarding
      trackOnboardingStart(context, onboardingQuestions.length);

      const isAllowedEmail = ALLOWED_EMAILS.includes(userEmail);

      if (isAllowedEmail) {
        // Process salesperson onboarding
        await processSalespersonOnboarding(selectedAnswers, context);
      } else {
        // Process non-salesperson onboarding
        await processNonSalespersonOnboarding(selectedAnswers, context);
      }
    } catch (error) {
      // Track submission error
      trackOnboardingError(context, error);

      toast.error('Onboarding submission failed', {
        description: `Please try again or contact support. ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      console.error('Onboarding submission error:', error);

      // Reset onboarding state on error
      onboardingSignal.value = {
        isComplete: false,
        currentStep,
        answers: selectedAnswers,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
