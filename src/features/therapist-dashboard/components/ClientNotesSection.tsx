'use client';

import { FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

import { ClientNotesForm } from './ClientNotesForm';

type ClientNote = {
  id: number;
  title: string;
  content: {
    keyObservations?: string[];
    progressNotes?: string[];
    actionItems?: string[];
    emotionalState?: string;
    additionalContext?: string;
  } | null;
  createdAt: string;
  isConfidential: boolean;
};

const NoteDetailsExpanded = ({ note }: { note: ClientNote }) => (
  <div className='p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 text-sm'>
    {note.content && (
      <div className='space-y-3'>
        {note.content.keyObservations && note.content.keyObservations.length > 0 && (
          <div>
            <p className='font-semibold text-gray-700'>Key Observations:</p>
            <ul className='list-disc list-inside text-gray-600'>
              {note.content.keyObservations.map((obs, index) => (
                <li key={index}>{obs}</li>
              ))}
            </ul>
          </div>
        )}

        {note.content.progressNotes && note.content.progressNotes.length > 0 && (
          <div>
            <p className='font-semibold text-gray-700'>Progress Notes:</p>
            <ul className='list-disc list-inside text-gray-600'>
              {note.content.progressNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {note.content.actionItems && note.content.actionItems.length > 0 && (
          <div>
            <p className='font-semibold text-gray-700'>Action Items:</p>
            <ul className='list-disc list-inside text-gray-600'>
              {note.content.actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {note.content.emotionalState && (
          <div>
            <p className='font-semibold text-gray-700'>Emotional State:</p>
            <p className='text-gray-600'>{note.content.emotionalState}</p>
          </div>
        )}

        {note.content.additionalContext && (
          <div>
            <p className='font-semibold text-gray-700'>Additional Context:</p>
            <p className='text-gray-600'>{note.content.additionalContext}</p>
          </div>
        )}

        {note.isConfidential && (
          <div className='mt-2 text-xs text-red-600 flex items-center'>
            <span className='mr-2'>🔒</span> Confidential Note
          </div>
        )}
      </div>
    )}
  </div>
);

const NotesHeader = ({
  isNotesFormOpen,
  setIsNotesFormOpen,
}: {
  isNotesFormOpen: boolean;
  setIsNotesFormOpen: (open: boolean) => void;
}) => (
  <div className='flex items-center justify-between mb-4'>
    <h3 className='text-lg font-semibold text-gray-800'>Client Notes</h3>
    <div className='flex items-center space-x-2'>
      <FileText className='h-5 w-5 text-purple-600' />
      <button
        onClick={() => setIsNotesFormOpen(!isNotesFormOpen)}
        className='flex items-center px-3 py-2 text-sm border border-purple-200 text-purple-600 rounded-md hover:bg-purple-50 transition-colors'
      >
        <Plus className='h-4 w-4 mr-2' /> {isNotesFormOpen ? 'Cancel' : 'New Note'}
      </button>
    </div>
  </div>
);

const NotesList = ({
  notes,
  expandedNoteId,
  toggleNoteExpansion,
}: {
  notes: ClientNote[];
  expandedNoteId: number | null;
  toggleNoteExpansion: (noteId: number) => void;
}) => (
  <div className='text-sm text-gray-600 space-y-2'>
    {notes.map((note) => (
      <div key={note.id} className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div
          onClick={() => toggleNoteExpansion(note.id)}
          className='p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors'
        >
          <div>
            <p className='font-medium'>{note.title}</p>
            <p className='text-xs text-gray-400'>{new Date(note.createdAt).toLocaleDateString()}</p>
          </div>
          <div className='text-purple-600'>
            {expandedNoteId === note.id ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>

        {expandedNoteId === note.id && <NoteDetailsExpanded note={note} />}
      </div>
    ))}
  </div>
);

export default function ClientNotesSection({ clientId }: { clientId: string }) {
  const [isNotesFormOpen, setIsNotesFormOpen] = useState(false);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [therapistId, setTherapistId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTherapistId = async () => {
      try {
        const response = await fetch('/api/therapist/id');
        const data = await response.json();
        if (data.therapistId) {
          setTherapistId(data.therapistId);
        }
      } catch (error) {
        console.error('Failed to fetch therapist ID:', error);
      }
    };
    fetchTherapistId();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/therapist/client-notes?clientId=${clientId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch client notes');
        }
        const data = await response.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error('Error fetching client notes:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchNotes();
    }
  }, [clientId]);

  const handleNoteCreated = () => {
    setIsNotesFormOpen(false);
  };

  const toggleNoteExpansion = (noteId: number) => {
    setExpandedNoteId((prevId) => (prevId === noteId ? null : noteId));
  };

  return (
    <div className='bg-white rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm'>
      <NotesHeader isNotesFormOpen={isNotesFormOpen} setIsNotesFormOpen={setIsNotesFormOpen} />

      {isNotesFormOpen && therapistId && (
        <div className='mb-4'>
          <ClientNotesForm
            userId={clientId}
            therapistId={therapistId}
            onNoteCreated={handleNoteCreated}
            onNotesRefresh={() => {
              // Refetch notes after creating a new note
              const fetchNotes = async () => {
                try {
                  setIsLoading(true);
                  setError(null);
                  const response = await fetch(`/api/therapist/client-notes?clientId=${clientId}`);
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch client notes');
                  }
                  const data = await response.json();
                  setNotes(data.notes || []);
                } catch (error) {
                  console.error('Error fetching client notes:', error);
                  setError(error instanceof Error ? error.message : 'An unknown error occurred');
                  setNotes([]);
                } finally {
                  setIsLoading(false);
                }
              };

              fetchNotes();
            }}
          />
        </div>
      )}

      {isLoading && <p className='text-gray-500 text-center'>Loading notes...</p>}
      {error && <p className='text-red-500 text-center'>{error}</p>}

      {!isLoading &&
        !error &&
        (notes.length === 0 ? (
          <p className='text-gray-500 text-center'>No recent notes</p>
        ) : (
          <NotesList
            notes={notes}
            expandedNoteId={expandedNoteId}
            toggleNoteExpansion={toggleNoteExpansion}
          />
        ))}
    </div>
  );
}
