'use client';

import { Save } from 'lucide-react';
import { useState } from 'react';

import { CreateClientNoteInput } from '../types';
import { noteFormTracking } from '../utils/noteFormTracking';

// Actual client note creation logic
const createClientNote = async (noteData: CreateClientNoteInput) => {
  try {
    const response = await fetch('/api/therapist/client-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create client note');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating client note:', error);
    throw error;
  }
};

const NoteInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'textarea';
  placeholder?: string;
  rows?: number;
}) => (
  <div className='space-y-2'>
    <label className='block text-sm font-medium text-gray-700'>{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
      />
    ) : (
      <input
        type='text'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
      />
    )}
  </div>
);

const ConfidentialCheckbox = ({
  isConfidential,
  onToggle,
}: {
  isConfidential: boolean;
  onToggle: () => void;
}) => (
  <div className='flex items-center space-x-2'>
    <input
      type='checkbox'
      id='confidential'
      checked={isConfidential}
      onChange={onToggle}
      className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
    />
    <label htmlFor='confidential' className='text-sm text-gray-700'>
      Mark as Confidential
    </label>
  </div>
);

const ErrorDisplay = ({ error }: { error: string | null }) =>
  error ? (
    <div className='bg-red-50 border border-red-200 text-red-800 p-3 rounded-md'>{error}</div>
  ) : null;

const useClientNoteForm = (
  userId: string,
  therapistId: number,
  sessionId: number | undefined,
  onNoteCreated?: () => void,
  onNotesRefresh?: () => void,
) => {
  const [formState, setFormState] = useState({
    title: '',
    keyObservations: '',
    progressNotes: '',
    actionItems: '',
    emotionalState: '',
    additionalContext: '',
    isConfidential: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormState = (field: string, value: string | boolean) => {
    noteFormTracking.fieldInteraction(userId, field, value);
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormState({
      title: '',
      keyObservations: '',
      progressNotes: '',
      actionItems: '',
      emotionalState: '',
      additionalContext: '',
      isConfidential: false,
    });
  };

  const handleSubmit = async () => {
    noteFormTracking.creationAttempt({
      userId,
      therapistId,
      sessionId,
      formState,
    });

    if (!formState.title) {
      setError('Title is required');
      noteFormTracking.validationError(userId);
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    const noteData: CreateClientNoteInput = {
      userId,
      therapistId,
      sessionId,
      title: formState.title,
      content: {
        keyObservations: formState.keyObservations.split('\n').filter(Boolean),
        progressNotes: formState.progressNotes.split('\n').filter(Boolean),
        actionItems: formState.actionItems.split('\n').filter(Boolean),
        emotionalState: formState.emotionalState,
        additionalContext: formState.additionalContext,
      },
      isConfidential: formState.isConfidential,
    };

    try {
      const result = await createClientNote(noteData);

      noteFormTracking.creationSuccess({
        userId,
        therapistId,
        sessionId,
        result,
        noteData,
        isConfidential: formState.isConfidential,
      });

      onNoteCreated?.();
      onNotesRefresh?.();
      resetForm();
      return true;
    } catch (error) {
      noteFormTracking.creationError({
        userId,
        therapistId,
        sessionId,
        error,
      });
      setError(error instanceof Error ? error.message : 'Failed to create client note');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    updateFormState,
    handleSubmit,
    isSubmitting,
    error,
  };
};

export function ClientNotesForm({
  userId,
  therapistId,
  sessionId,
  onNoteCreated,
  onNotesRefresh,
  className = '',
}: {
  userId: string;
  therapistId: number;
  sessionId?: number;
  onNoteCreated?: () => void;
  onNotesRefresh?: () => void;
  className?: string;
}) {
  const { formState, updateFormState, handleSubmit, isSubmitting, error } = useClientNoteForm(
    userId,
    therapistId,
    sessionId,
    onNoteCreated,
    onNotesRefresh,
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <ErrorDisplay error={error} />

      <NoteInput
        label='Note Title'
        value={formState.title}
        onChange={(e) => updateFormState('title', e.target.value)}
        placeholder='Session Summary, Progress Review, etc.'
      />

      <div className='grid md:grid-cols-2 gap-4'>
        <NoteInput
          label='Key Observations'
          type='textarea'
          value={formState.keyObservations}
          onChange={(e) => updateFormState('keyObservations', e.target.value)}
          placeholder='Enter observations (one per line)'
          rows={4}
        />
        <NoteInput
          label='Progress Notes'
          type='textarea'
          value={formState.progressNotes}
          onChange={(e) => updateFormState('progressNotes', e.target.value)}
          placeholder='Enter progress notes (one per line)'
          rows={4}
        />
      </div>

      <NoteInput
        label='Action Items'
        type='textarea'
        value={formState.actionItems}
        onChange={(e) => updateFormState('actionItems', e.target.value)}
        placeholder='Enter action items (one per line)'
        rows={3}
      />

      <div className='grid md:grid-cols-2 gap-4'>
        <NoteInput
          label='Emotional State'
          value={formState.emotionalState}
          onChange={(e) => updateFormState('emotionalState', e.target.value)}
          placeholder="Client's emotional state"
        />
        <NoteInput
          label='Additional Context'
          value={formState.additionalContext}
          onChange={(e) => updateFormState('additionalContext', e.target.value)}
          placeholder='Any additional notes'
        />
      </div>

      <ConfidentialCheckbox
        isConfidential={formState.isConfidential}
        onToggle={() => updateFormState('isConfidential', !formState.isConfidential)}
      />

      <div className='flex justify-end'>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            px-6 py-2 rounded-md text-white 
            ${
              isSubmitting
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } 
            transition-colors flex items-center gap-2
          `}
        >
          <Save className='h-5 w-5' />
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
