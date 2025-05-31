'use client';
import {
  Plus,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  List,
  BarChart3,
  User,
  Tag,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

import { trackTherapistClientManagement } from '@/src/features/posthog/therapistTracking';
import { ClientNote, NoteCategory, Client, CreateNoteRequest } from '../../types';
import { exportClientNotes } from '../../utils/notesExport';

import { ClientNotesForm } from './ClientNotesForm';
import { NoteDetailModal } from './NoteDetailModal';
import { NotePreviewCard } from './NotePreviewCard';

interface ClientNotesSectionProps {
  client: Client;
  therapistId: number;
}

type ViewMode = 'recent' | 'category' | 'timeline' | 'all';

export function ClientNotesSection({ client, therapistId }: ClientNotesSectionProps) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ClientNote | null>(null);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('recent');
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

  // Helper functions for organizing notes
  const getRecentNotes = () => {
    return notes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Show last 10 notes
  };

  const getNotesByCategory = () => {
    const categories: Record<string, ClientNote[]> = {};
    notes.forEach((note) => {
      const category = note.content.category || 'general';
      if (!categories[category]) categories[category] = [];
      categories[category].push(note);
    });
    return categories;
  };

  const getTimelineData = () => {
    const timeline: Record<string, ClientNote[]> = {};
    notes.forEach((note) => {
      const date = new Date(note.createdAt).toDateString();
      if (!timeline[date]) timeline[date] = [];
      timeline[date].push(note);
    });
    return Object.entries(timeline)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 14); // Last 2 weeks
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.additionalContext?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    const matchesCategory = categoryFilter === 'all' || note.content.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const renderRecentView = () => {
    const recentNotes = getRecentNotes();
    if (recentNotes.length === 0)
      return <div className='text-center py-8 text-gray-500'>No recent notes</div>;

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between mb-6'>
          <h4 className='text-lg font-semibold text-gray-900'>Latest 10 Notes</h4>
          <div className='text-sm text-gray-500'>Most recent first</div>
        </div>
        {recentNotes.map((note, index) => (
          <div
            key={note.id}
            className='animate-in slide-in-from-bottom duration-300'
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <NotePreviewCard note={note} onClick={() => setSelectedNote(note)} />
          </div>
        ))}
      </div>
    );
  };

  const renderCategoryView = () => {
    const categorizedNotes = getNotesByCategory();
    const categoryLabels = {
      session: 'Session Notes',
      intake: 'Intake Assessments',
      progress: 'Progress Reviews',
      crisis: 'Crisis/Safety',
      general: 'General Notes',
      discharge: 'Discharge Planning',
    };

    if (Object.keys(categorizedNotes).length === 0) {
      return <div className='text-center py-8 text-gray-500'>No notes to categorize</div>;
    }

    return (
      <div className='space-y-8'>
        {Object.entries(categorizedNotes).map(([category, categoryNotes]) => (
          <div
            key={category}
            className='bg-white rounded-xl border border-gray-100 overflow-hidden'
          >
            <div className='bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center justify-between'>
                <h4 className='font-semibold text-gray-900'>
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </h4>
                <span className='bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600'>
                  {categoryNotes.length} {categoryNotes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              {categoryNotes
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5) // Show max 5 per category to avoid overwhelming
                .map((note) => (
                  <NotePreviewCard
                    key={note.id}
                    note={note}
                    onClick={() => setSelectedNote(note)}
                  />
                ))}
              {categoryNotes.length > 5 && (
                <div className='text-center pt-4'>
                  <button
                    onClick={() => {
                      setCategoryFilter(category as NoteCategory);
                      setViewMode('all');
                    }}
                    className='text-[#9071FF] hover:text-[#7c5ce8] font-medium text-sm'
                  >
                    View all {categoryNotes.length} {category} notes →
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimelineView = () => {
    const timelineData = getTimelineData();
    if (timelineData.length === 0) {
      return <div className='text-center py-8 text-gray-500'>No recent timeline data</div>;
    }

    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between mb-6'>
          <h4 className='text-lg font-semibold text-gray-900'>Recent Activity Timeline</h4>
          <div className='text-sm text-gray-500'>Last 2 weeks</div>
        </div>
        {timelineData.map(([date, dayNotes]) => (
          <div key={date} className='relative'>
            <div className='flex items-center gap-4 mb-3'>
              <div className='w-3 h-3 bg-[#9071FF] rounded-full'></div>
              <h5 className='font-medium text-gray-900'>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h5>
              <div className='h-px bg-gray-200 flex-1'></div>
              <span className='text-sm text-gray-500'>
                {dayNotes.length} {dayNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
            <div className='ml-8 space-y-3'>
              {dayNotes.map((note) => (
                <NotePreviewCard key={note.id} note={note} onClick={() => setSelectedNote(note)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAllView = () => {
    if (filteredNotes.length === 0) {
      return (
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
              : 'Create your first note to begin documenting your therapeutic journey'}
          </p>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <div className='space-y-8'>
      {/* Enhanced Header */}
      <div className='relative'>
        <div className='absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 rounded-2xl'></div>
        <div className='relative p-8 rounded-2xl border border-purple-100/50'>
          <div className='flex items-center justify-between mb-6'>
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
                  className='inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all duration-200 text-sm font-medium'
                >
                  <Download className='w-4 h-4' />
                  {exporting ? 'Exporting...' : 'Export'}
                </button>
              )}
              <button
                onClick={() => setShowNewNoteForm(true)}
                className='inline-flex items-center gap-2 px-4 py-2 bg-[#9071FF] text-white rounded-lg hover:bg-[#7c5ce8] transition-all duration-200 text-sm font-medium'
              >
                <Plus className='w-4 h-4' />
                New Note
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className='flex flex-wrap gap-2'>
            {[
              { key: 'recent', label: 'Recent', icon: Clock },
              { key: 'category', label: 'By Category', icon: BarChart3 },
              { key: 'timeline', label: 'Timeline', icon: Calendar },
              { key: 'all', label: 'All Notes', icon: List },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as ViewMode)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === key
                    ? 'bg-[#9071FF] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className='w-4 h-4' />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter - Only show for 'all' view */}
      {viewMode === 'all' && (
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
      )}

      {/* Notes Display */}
      <div>
        {loading ? (
          <div className='text-center py-16'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-[#9071FF] border-t-transparent mx-auto mb-4'></div>
            <p className='text-gray-600 text-lg font-medium'>Loading notes...</p>
            <p className='text-gray-500 text-sm'>Gathering your client documentation</p>
          </div>
        ) : (
          <>
            {viewMode === 'recent' && renderRecentView()}
            {viewMode === 'category' && renderCategoryView()}
            {viewMode === 'timeline' && renderTimelineView()}
            {viewMode === 'all' && renderAllView()}
          </>
        )}
      </div>

      {/* Modals */}
      {showNewNoteForm && (
        <ClientNotesForm
          client={client}
          therapistId={therapistId}
          onSave={handleSaveNote}
          onClose={() => setShowNewNoteForm(false)}
        />
      )}

      {editingNote && (
        <ClientNotesForm
          client={client}
          therapistId={therapistId}
          existingNote={editingNote}
          onSave={handleSaveNote}
          onClose={() => setEditingNote(null)}
        />
      )}

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
