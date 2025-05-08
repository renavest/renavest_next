import posthog from 'posthog-js';

import { CreateClientNoteInput } from '../types';

export const noteFormTracking = {
  fieldInteraction: (userId: string, field: string, value: string | boolean) => {
    if (field !== 'isConfidential') {
      posthog.capture('therapist_note_form_field_interaction', {
        userId,
        field,
        hasValue: !!value,
      });
    }
  },

  creationAttempt: (params: {
    userId: string;
    therapistId: number;
    sessionId?: number;
    formState: {
      title: string;
      keyObservations: string;
      progressNotes: string;
      actionItems: string;
      emotionalState: string;
      isConfidential: boolean;
    };
  }) => {
    const { userId, therapistId, sessionId, formState } = params;
    posthog.capture('therapist_note_creation_attempt', {
      userId,
      therapistId,
      sessionId,
      hasTitle: !!formState.title,
      hasKeyObservations: !!formState.keyObservations,
      hasProgressNotes: !!formState.progressNotes,
      hasActionItems: !!formState.actionItems,
      hasEmotionalState: !!formState.emotionalState,
      isConfidential: formState.isConfidential,
    });
  },

  validationError: (userId: string) => {
    posthog.capture('therapist_note_creation_validation_error', {
      userId,
      errorType: 'missing_title',
    });
  },

  creationSuccess: (params: {
    userId: string;
    therapistId: number;
    sessionId?: number;
    result: { id: string };
    noteData: CreateClientNoteInput;
    isConfidential: boolean;
  }) => {
    const { userId, therapistId, sessionId, result, noteData, isConfidential } = params;
    posthog.capture('therapist_note_creation_success', {
      userId,
      therapistId,
      sessionId,
      noteId: result.id,
      isConfidential,
      contentSections: {
        keyObservations: noteData.content.keyObservations?.length || 0,
        progressNotes: noteData.content.progressNotes?.length || 0,
        actionItems: noteData.content.actionItems?.length || 0,
        hasEmotionalState: !!noteData.content.emotionalState,
        hasAdditionalContext: !!noteData.content.additionalContext,
      },
    });
  },

  creationError: (params: {
    userId: string;
    therapistId: number;
    sessionId?: number;
    error: unknown;
  }) => {
    const { userId, therapistId, sessionId, error } = params;
    posthog.capture('therapist_note_creation_error', {
      userId,
      therapistId,
      sessionId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  },
};
