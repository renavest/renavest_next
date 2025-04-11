'use client';

import { FileText, Save, X } from 'lucide-react';
import { useState, ChangeEvent } from 'react';

import { CreateClientNoteInput } from '../types';

type ClientNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  therapistId: number;
  sessionId?: number;
};

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
  placeholder,
  type = 'text',
  rows,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  type?: 'text' | 'textarea';
  rows?: number;
}) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
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

const ModalHeader = ({ onClose }: { onClose: () => void }) => (
  <div className='flex items-center justify-between mb-6'>
    <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
      <FileText className='mr-2 h-5 w-5 text-purple-600' />
      Create Client Note
    </h2>
    <button onClick={onClose} className='text-gray-500 hover:text-gray-700 transition-colors'>
      <X className='h-6 w-6' />
    </button>
  </div>
);

const ErrorDisplay = ({ error }: { error: string | null }) =>
  error ? (
    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4'>
      {error}
    </div>
  ) : null;

const ModalActions = ({
  onClose,
  onSubmit,
  isSubmitting,
  isDisabled,
}: {
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}) => (
  <div className='flex justify-end space-x-2 mt-6'>
    <button
      onClick={onClose}
      className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
    >
      <X className='mr-2 h-4 w-4 inline-block' /> Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={isDisabled || isSubmitting}
      className='px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
    >
      <Save className='mr-2 h-4 w-4' /> {isSubmitting ? 'Saving...' : 'Save Note'}
    </button>
  </div>
);

const useClientNoteForm = (
  userId: string,
  therapistId: number,
  sessionId: number | undefined,
  onClose: () => void,
) => {
  const [title, setTitle] = useState('');
  const [keyObservations, setKeyObservations] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const noteData: CreateClientNoteInput = {
      userId,
      therapistId,
      sessionId,
      title,
      content: {
        keyObservations: keyObservations.split('\n').filter(Boolean),
        progressNotes: progressNotes.split('\n').filter(Boolean),
        actionItems: actionItems.split('\n').filter(Boolean),
        emotionalState,
        additionalContext,
      },
      isConfidential,
    };

    try {
      await createClientNote(noteData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create client note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    keyObservations,
    setKeyObservations,
    progressNotes,
    setProgressNotes,
    actionItems,
    setActionItems,
    emotionalState,
    setEmotionalState,
    additionalContext,
    setAdditionalContext,
    isConfidential,
    setIsConfidential,
    isSubmitting,
    error,
    handleSubmit,
  };
};

const ClientNotesForm = ({
  title,
  setTitle,
  keyObservations,
  setKeyObservations,
  progressNotes,
  setProgressNotes,
  actionItems,
  setActionItems,
  emotionalState,
  setEmotionalState,
  additionalContext,
  setAdditionalContext,
  isConfidential,
  setIsConfidential,
  isSubmitting,
  onClose,
  handleSubmit,
}: Omit<ReturnType<typeof useClientNoteForm>, 'error'> & { onClose: () => void }) => (
  <div className='space-y-4'>
    <NoteInput
      label='Note Title'
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder='Session Summary, Progress Review, etc.'
    />

    <div className='grid md:grid-cols-2 gap-4'>
      <NoteInput
        label='Key Observations'
        type='textarea'
        value={keyObservations}
        onChange={(e) => setKeyObservations(e.target.value)}
        placeholder='Enter observations (one per line)'
        rows={4}
      />
      <NoteInput
        label='Progress Notes'
        type='textarea'
        value={progressNotes}
        onChange={(e) => setProgressNotes(e.target.value)}
        placeholder='Enter progress notes (one per line)'
        rows={4}
      />
    </div>

    <NoteInput
      label='Action Items'
      type='textarea'
      value={actionItems}
      onChange={(e) => setActionItems(e.target.value)}
      placeholder='Enter action items (one per line)'
      rows={3}
    />

    <div className='grid md:grid-cols-2 gap-4'>
      <NoteInput
        label='Emotional State'
        value={emotionalState}
        onChange={(e) => setEmotionalState(e.target.value)}
        placeholder="Client's emotional state"
      />
      <NoteInput
        label='Additional Context'
        value={additionalContext}
        onChange={(e) => setAdditionalContext(e.target.value)}
        placeholder='Any additional notes'
      />
    </div>

    <div className='flex items-center space-x-2'>
      <input
        type='checkbox'
        id='confidential'
        checked={isConfidential}
        onChange={() => setIsConfidential(!isConfidential)}
        className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
      />
      <label htmlFor='confidential' className='text-sm font-medium text-gray-700'>
        Mark as Confidential
      </label>
    </div>

    <ModalActions
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isDisabled={!title}
    />
  </div>
);

export function ClientNotesModal({
  isOpen,
  onClose,
  userId,
  therapistId,
  sessionId,
}: ClientNotesModalProps) {
  const formProps = useClientNoteForm(userId, therapistId, sessionId, onClose);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-xl max-w-2xl w-full mx-auto p-6 shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader onClose={onClose} />
        <ErrorDisplay error={formProps.error} />
        <ClientNotesForm {...formProps} onClose={onClose} />
      </div>
    </div>
  );
}
