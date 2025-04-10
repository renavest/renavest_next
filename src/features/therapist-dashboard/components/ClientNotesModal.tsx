'use client';

import { FileText, Save, X } from 'lucide-react';
import { useState, ChangeEvent } from 'react';

import { createClientNoteAction, CreateClientNoteInput } from '../actions/serverActions';

type ClientNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  therapistId: number;
  sessionId?: number;
};

export function ClientNotesModal({
  isOpen,
  onClose,
  userId,
  therapistId,
  sessionId,
}: ClientNotesModalProps) {
  const [title, setTitle] = useState('');
  const [keyObservations, setKeyObservations] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const handleSubmit = async () => {
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
      console.error('Failed to create client note', error);
      // TODO: Add error handling UI
    }
  };

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
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-gray-800 flex items-center'>
            <FileText className='mr-2 h-5 w-5 text-purple-600' />
            Create Client Note
          </h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700 transition-colors'>
            <X className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Note Title</label>
            <input
              type='text'
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder='Session Summary, Progress Review, etc.'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Key Observations
              </label>
              <textarea
                value={keyObservations}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setKeyObservations(e.target.value)
                }
                placeholder='Enter observations (one per line)'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Progress Notes</label>
              <textarea
                value={progressNotes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setProgressNotes(e.target.value)}
                placeholder='Enter progress notes (one per line)'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Action Items</label>
            <textarea
              value={actionItems}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setActionItems(e.target.value)}
              placeholder='Enter action items (one per line)'
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Emotional State
              </label>
              <input
                type='text'
                value={emotionalState}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmotionalState(e.target.value)}
                placeholder="Client's emotional state"
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Additional Context
              </label>
              <input
                type='text'
                value={additionalContext}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAdditionalContext(e.target.value)
                }
                placeholder='Any additional notes'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>
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

          <div className='flex justify-end space-x-2 mt-6'>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
            >
              <X className='mr-2 h-4 w-4 inline-block' /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title}
              className='px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
            >
              <Save className='mr-2 h-4 w-4' /> Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
