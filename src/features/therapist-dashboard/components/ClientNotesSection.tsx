'use client';
import { Plus, FileText, Search, Filter, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ClientNote, NoteCategory, Client, CreateNoteRequest } from '../types';
import { exportClientNotes } from '../utils/notesExport';

import { ClientNotesForm } from './ClientNotesForm';
import { NoteDetailModal } from './NoteDetailModal';
import { NotePreviewCard } from './NotePreviewCard';

interface ClientNotesSectionProps {
  client: Client;
  therapistId: number;
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
    <div className='space-y-8'>
      {/* Enhanced Header */}
      <div className='relative'>
        <div className='absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 rounded-2xl'></div>
        <div className='relative p-8 rounded-2xl border border-purple-100/50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-1 h-12 bg-gradient-to-b from-[#9071FF] to-purple-600 rounded-full'></div>
              <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-1'>Clinical Notes</h3>
                <p className='text-base text-gray-600'>
                  Confidential documentation for{' '}
                  <span className='font-semibold text-[#9071FF]'>
                    {client.firstName} {client.lastName}
                  </span>
                </p>
              </div>
            </div>
            <div className='flex gap-3'>
              {notes.length > 0 && (
                <button
                  onClick={handleExportNotes}
                  disabled={exporting}
                  className='inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                >
                  <Download className='w-5 h-5' />
                  {exporting ? 'Exporting...' : 'Export All Notes'}
                </button>
              )}
              <button
                onClick={() => setShowNewNoteForm(true)}
                className='inline-flex items-center gap-2 px-6 py-3 bg-[#9071FF] text-white rounded-xl hover:bg-[#7c5ce8] transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              >
                <Plus className='w-5 h-5' />
                New Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className='bg-white rounded-xl p-6 border border-gray-100 shadow-sm'>
        <div className='flex gap-4 items-center'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search through your notes...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9071FF] focus:border-transparent transition-all duration-200 text-gray-700'
            />
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Filter className='w-5 h-5' />
              <span className='font-medium'>Filter:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as NoteCategory | 'all')}
              className='px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9071FF] focus:border-transparent transition-all duration-200 font-medium text-gray-700 bg-white'
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
      </div>

      {/* Enhanced Notes List */}
      <div className='space-y-4'>
        {loading ? (
          <div className='text-center py-16'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-[#9071FF] border-t-transparent mx-auto mb-4'></div>
            <p className='text-gray-600 text-lg font-medium'>Loading notes...</p>
            <p className='text-gray-500 text-sm'>Gathering your client documentation</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className='text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl border border-gray-100'>
            <div className='w-16 h-16 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
              <FileText className='w-8 h-8 text-white' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              {searchTerm || categoryFilter !== 'all' ? 'No matching notes found' : 'No notes yet'}
            </h3>
            <p className='text-gray-600 text-lg mb-6'>
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first note to begin documenting your therapeutic journey with this client'}
            </p>
            {!(searchTerm || categoryFilter !== 'all') && (
              <button
                onClick={() => setShowNewNoteForm(true)}
                className='inline-flex items-center gap-2 px-6 py-3 bg-[#9071FF] text-white rounded-xl hover:bg-[#7c5ce8] transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              >
                <Plus className='w-5 h-5' />
                Create First Note
              </button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='text-lg font-semibold text-gray-900'>
                {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'} Found
              </h4>
              <div className='text-sm text-gray-500'>
                {searchTerm && `Searching for "${searchTerm}"`}
                {categoryFilter !== 'all' && ` • Filtered by ${categoryFilter}`}
              </div>
            </div>
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className='animate-in slide-in-from-bottom duration-300'
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NotePreviewCard note={note} onClick={() => setSelectedNote(note)} />
              </div>
            ))}
          </div>
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
