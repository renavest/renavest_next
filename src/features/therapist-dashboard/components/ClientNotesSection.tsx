'use client';
import { Plus, FileText, Search, Filter, Calendar, Lock, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ClientNote, NoteCategory, Client, CreateNoteRequest } from '../types';
import { exportClientNotes } from '../utils/notesExport';

import { ClientNotesForm } from './ClientNotesForm';

interface ClientNotesSectionProps {
  client: Client;
  therapistId: number;
}

const categoryColors: Record<NoteCategory, string> = {
  session: 'bg-blue-100 text-blue-800',
  intake: 'bg-green-100 text-green-800',
  progress: 'bg-purple-100 text-purple-800',
  crisis: 'bg-red-100 text-red-800',
  general: 'bg-gray-100 text-gray-800',
  discharge: 'bg-orange-100 text-orange-800',
};

// Note Detail Modal Component
function NoteDetailModal({
  note,
  onClose,
  onEdit,
  onDelete,
}: {
  note: ClientNote;
  onClose: () => void;
  onEdit: (note: ClientNote) => void;
  onDelete: (note: ClientNote) => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    onEdit(note);
    onClose();
  };

  const handleDelete = () => {
    if (
      window.confirm('Are you sure you want to delete this note? This action cannot be undone.')
    ) {
      onDelete(note);
      onClose();
    }
  };

  const handleExportSingle = () => {
    // Export just this note
    const blob = new Blob(
      [
        `CONFIDENTIAL CLINICAL NOTE\n`,
        `Title: ${note.title}\n`,
        `Date: ${formatDate(note.createdAt)}\n`,
        `Category: ${note.content.category || 'General'}\n\n`,

        ...(note.content.keyObservations?.length
          ? [
              'KEY OBSERVATIONS:\n',
              ...note.content.keyObservations.map((obs) => `• ${obs}\n`),
              '\n',
            ]
          : []),

        ...(note.content.clinicalAssessment
          ? ['CLINICAL ASSESSMENT:\n', note.content.clinicalAssessment, '\n\n']
          : []),

        ...(note.content.treatmentPlan
          ? ['TREATMENT PLAN:\n', note.content.treatmentPlan, '\n\n']
          : []),

        ...(note.content.riskAssessment
          ? ['RISK ASSESSMENT:\n', note.content.riskAssessment, '\n\n']
          : []),

        ...(note.content.additionalContext
          ? ['ADDITIONAL NOTES:\n', note.content.additionalContext, '\n\n']
          : []),

        ...(note.content.actionItems?.length
          ? ['ACTION ITEMS:\n', ...note.content.actionItems.map((item) => `• ${item}\n`), '\n']
          : []),

        ...(note.content.followUpNeeded?.length
          ? [
              'FOLLOW UP NEEDED:\n',
              ...note.content.followUpNeeded.map((item) => `• ${item}\n`),
              '\n',
            ]
          : []),
      ],
      { type: 'text/plain' },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Note_${note.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h3 className='text-xl font-semibold text-gray-900'>{note.title}</h3>
            {note.content.category && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${categoryColors[note.content.category]}`}
              >
                {note.content.category}
              </span>
            )}
            {note.isConfidential && (
              <div title='Confidential'>
                <Lock className='w-4 h-4 text-red-500' />
              </div>
            )}
          </div>
          <button onClick={onClose} className='p-2 text-gray-400 hover:text-gray-600 rounded-lg'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 max-h-[60vh] overflow-y-auto space-y-6'>
          <div className='text-sm text-gray-500 mb-4'>
            <Calendar className='w-4 h-4 inline mr-2' />
            {formatDate(note.createdAt)}
          </div>

          {note.content.keyObservations && note.content.keyObservations.length > 0 && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Key Observations</h4>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                {note.content.keyObservations.map((obs, index) => (
                  <li key={index}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {note.content.clinicalAssessment && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Clinical Assessment</h4>
              <p className='text-gray-700 whitespace-pre-wrap'>{note.content.clinicalAssessment}</p>
            </div>
          )}

          {note.content.treatmentPlan && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Treatment Plan</h4>
              <p className='text-gray-700 whitespace-pre-wrap'>{note.content.treatmentPlan}</p>
            </div>
          )}

          {note.content.riskAssessment && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Risk Assessment</h4>
              <p className='text-gray-700 whitespace-pre-wrap'>{note.content.riskAssessment}</p>
            </div>
          )}

          {note.content.additionalContext && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Additional Notes</h4>
              <p className='text-gray-700 whitespace-pre-wrap'>{note.content.additionalContext}</p>
            </div>
          )}

          {note.content.actionItems && note.content.actionItems.length > 0 && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Action Items</h4>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                {note.content.actionItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {note.content.followUpNeeded && note.content.followUpNeeded.length > 0 && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Follow Up Needed</h4>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                {note.content.followUpNeeded.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='p-6 border-t border-gray-200 flex justify-between'>
          <div className='flex gap-3'>
            <button
              onClick={handleEdit}
              className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
              Edit Note
            </button>
            <button
              onClick={handleExportSingle}
              className='inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              <Download className='w-4 h-4' />
              Export This Note
            </button>
          </div>
          <button
            onClick={handleDelete}
            className='inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
            Delete Note
          </button>
        </div>
      </div>
    </div>
  );
}

// Note Preview Card Component
function NotePreviewCard({ note, onClick }: { note: ClientNote; onClick: () => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
    >
      <div className='flex items-start justify-between mb-2'>
        <div className='flex items-center gap-3'>
          <h4 className='font-medium text-gray-900'>{note.title}</h4>
          {note.content.category && (
            <span
              className={`px-2 py-1 text-xs rounded-full ${categoryColors[note.content.category]}`}
            >
              {note.content.category}
            </span>
          )}
          {note.isConfidential && (
            <div title='Confidential'>
              <Lock className='w-4 h-4 text-red-500' />
            </div>
          )}
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <Calendar className='w-4 h-4' />
          {formatDate(note.createdAt)}
        </div>
      </div>

      {/* Preview content */}
      <div className='text-sm text-gray-600 space-y-1'>
        {note.content.keyObservations && note.content.keyObservations.length > 0 && (
          <p>
            <strong>Key Observations:</strong> {note.content.keyObservations.slice(0, 2).join(', ')}
            {note.content.keyObservations.length > 2 ? '...' : ''}
          </p>
        )}
        {note.content.additionalContext && (
          <p className='truncate'>
            <strong>Notes:</strong> {note.content.additionalContext}
          </p>
        )}
        {note.content.actionItems && note.content.actionItems.length > 0 && (
          <p>
            <strong>Action Items:</strong> {note.content.actionItems.length} items
          </p>
        )}
        <p className='text-xs text-purple-600 mt-2'>Click to view full note →</p>
      </div>
    </div>
  );
}

export function ClientNotesSection({ client, therapistId }: ClientNotesSectionProps) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ClientNote | null>(null);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'all'>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [client.id, therapistId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapist/notes?clientId=${client.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (noteRequest: CreateNoteRequest) => {
    try {
      const response = await fetch('/api/therapist/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteRequest),
      });

      if (response.ok) {
        await fetchNotes();
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  const handleEditNote = (note: ClientNote) => {
    setEditingNote(note);
    setSelectedNote(null);
  };

  const handleDeleteNote = async (note: ClientNote) => {
    try {
      const response = await fetch(`/api/therapist/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchNotes();
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleExportNotes = async () => {
    try {
      setExporting(true);
      exportClientNotes(notes, client);
    } catch (error) {
      console.error('Error exporting notes:', error);
    } finally {
      setExporting(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.additionalContext?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesCategory = categoryFilter === 'all' || note.content.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Clinical Notes</h3>
          <p className='text-sm text-gray-500'>
            Confidential documentation for {client.firstName} {client.lastName}
          </p>
        </div>
        <div className='flex gap-2'>
          {notes.length > 0 && (
            <button
              onClick={handleExportNotes}
              disabled={exporting}
              className='inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors'
            >
              <Download className='w-4 h-4' />
              {exporting ? 'Exporting...' : 'Export Notes'}
            </button>
          )}
          <button
            onClick={() => setShowNewNoteForm(true)}
            className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
          >
            <Plus className='w-4 h-4' />
            New Note
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='flex gap-4 items-center'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search notes...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-400' />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as NoteCategory | 'all')}
            className='px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          >
            <option value='all'>All Categories</option>
            <option value='session'>Session Notes</option>
            <option value='intake'>Intake</option>
            <option value='progress'>Progress</option>
            <option value='crisis'>Crisis</option>
            <option value='general'>General</option>
            <option value='discharge'>Discharge</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className='space-y-3'>
        {loading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
            <p className='text-gray-500 mt-2'>Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-500'>
              {searchTerm || categoryFilter !== 'all'
                ? 'No notes match your search criteria'
                : 'No notes yet. Create your first note to get started.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NotePreviewCard key={note.id} note={note} onClick={() => setSelectedNote(note)} />
          ))
        )}
      </div>

      {/* Notes Form Modal - for new notes */}
      {showNewNoteForm && (
        <ClientNotesForm
          client={client}
          therapistId={therapistId}
          onSave={handleSaveNote}
          onClose={() => setShowNewNoteForm(false)}
        />
      )}

      {/* Notes Form Modal - for editing */}
      {editingNote && (
        <ClientNotesForm
          client={client}
          therapistId={therapistId}
          existingNote={editingNote}
          onSave={handleSaveNote}
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
}
