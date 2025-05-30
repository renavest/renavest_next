'use client';
import { Plus, FileText, Search, Filter, Calendar, Lock, Unlock, Download } from 'lucide-react';
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

export function ClientNotesSection({ client, therapistId }: ClientNotesSectionProps) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
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
        await fetchNotes(); // Refresh the notes list
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
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
            <div
              key={note.id}
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
                  {!note.isConfidential && (
                    <div title='Not confidential'>
                      <Unlock className='w-4 h-4 text-gray-400' />
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
                    <strong>Key Observations:</strong>{' '}
                    {note.content.keyObservations.slice(0, 2).join(', ')}
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Form Modal */}
      {showNewNoteForm && (
        <ClientNotesForm
          client={client}
          therapistId={therapistId}
          onSave={handleSaveNote}
          onClose={() => setShowNewNoteForm(false)}
        />
      )}
    </div>
  );
}
