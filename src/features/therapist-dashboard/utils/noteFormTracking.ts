import posthog from 'posthog-js';

import { CreateClientNoteInput } from '../types';

export const noteFormTracking = {
  fieldInteraction: (
    userId: string,
    field: string,
    value: string | boolean,
    userContext: { companyId?: string } = {},
  ) => {
    if (field !== 'isConfidential') {
      posthog.capture('therapist_note:form_field_interaction_v1', {
        user_id: userId,
        field,
        has_value: !!value,
        ...userContext,
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
    companyId?: string;
  }) => {
    const { userId, therapistId, sessionId, formState, companyId } = params;
    posthog.capture('therapist_note:creation_attempt_v1', {
      user_id: userId,
      therapist_id: therapistId,
      session_id: sessionId,
      has_title: !!formState.title,
      has_key_observations: !!formState.keyObservations,
      has_progress_notes: !!formState.progressNotes,
      has_action_items: !!formState.actionItems,
      has_emotional_state: !!formState.emotionalState,
      is_confidential: formState.isConfidential,
      company_id: companyId,
    });
  },

  validationError: (userId: string, userContext: { companyId?: string } = {}) => {
    posthog.capture('therapist_note:creation_validation_error_v1', {
      user_id: userId,
      error_type: 'missing_title',
      ...userContext,
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
