'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs/server';
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
      // Separate updates for unsafeMetadata and publicMetadata
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          onboardingComplete: true,
          role: userRole,
        },
      });

      // Use separate Clerk client call for public metadata
      const clerk = await clerkClient();
      await clerk.users.updateUser(clerkUser.id, {
        publicMetadata: {
          onboardingComplete: true,
          onboardingVersion: 1,
          onboardingCompletedAt: new Date().toISOString(),
          role: userRole,
        },
      });
    }
  };

  const identifyUser = (context: OnboardingContext, isStaff: boolean) => {
    posthog.identify(user?.id || clerkUser?.id, {
      email: context.userEmail,
      role: context.userRole,
      is_staff: isStaff,
      onboarding_complete: true,
      created_at: user?.createdAt || new Date().toISOString(),
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
    await updateClerkUserMetadata(context.userRole);

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
    await updateClerkUserMetadata(context.userRole);

    // Track completion
    trackOnboardingCompletion(context, onboardingData);

    // Identify user
    identifyUser(context, ['employee', 'therapist', 'employer'].includes(context.userRole || ''));

    finishOnboarding();
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
      // Validate inputs
      if (!userRole) {
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
