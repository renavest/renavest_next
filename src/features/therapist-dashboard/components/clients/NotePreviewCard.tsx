'use client';
import { Calendar, Lock } from 'lucide-react';

import { ClientNote } from '../../types';

const categoryColors = {
  session: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200',
  intake:
    'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200',
  progress:
    'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200',
  crisis: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200',
  general: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200',
  discharge: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200',
};

interface NotePreviewCardProps {
  note: ClientNote;
  onClick: () => void;
}

export function NotePreviewCard({ note, onClick }: NotePreviewCardProps) {
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
      className='group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden'
    >
      {/* Subtle gradient accent */}
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9071FF] to-purple-600 opacity-60 group-hover:opacity-100 transition-opacity duration-300'></div>

      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3 flex-1'>
          <div className='w-3 h-3 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-full group-hover:scale-110 transition-transform duration-300'></div>
          <div className='flex-1'>
            <h4 className='font-semibold text-gray-900 text-lg group-hover:text-[#9071FF] transition-colors duration-300'>
              {note.title}
            </h4>
            <div className='flex items-center gap-3 mt-1'>
              {note.content.category && (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[note.content.category]}`}
                >
                  {note.content.category}
                </span>
              )}
              {note.isConfidential && (
                <div
                  className='flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200'
                  title='Confidential'
                >
                  <Lock className='w-3 h-3' />
                  <span className='text-xs font-medium'>Confidential</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg'>
          <Calendar className='w-4 h-4' />
          <span className='font-medium'>{formatDate(note.createdAt)}</span>
        </div>
      </div>

      {/* Preview content */}
      <div className='text-sm text-gray-600 space-y-3'>
        {note.content.keyObservations && note.content.keyObservations.length > 0 && (
          <div className='bg-blue-50/50 rounded-lg p-3 border border-blue-100'>
            <span className='font-medium text-blue-800'>Key Observations: </span>
            <span className='text-blue-700'>
              {note.content.keyObservations.slice(0, 2).join(', ')}
              {note.content.keyObservations.length > 2 ? '...' : ''}
            </span>
          </div>
        )}
        {note.content.additionalContext && (
          <div className='bg-gray-50/50 rounded-lg p-3 border border-gray-100'>
            <span className='font-medium text-gray-800'>Notes: </span>
            <span className='text-gray-700 line-clamp-2'>
              {note.content.additionalContext.length > 100
                ? note.content.additionalContext.substring(0, 100) + '...'
                : note.content.additionalContext}
            </span>
          </div>
        )}
        {note.content.actionItems && note.content.actionItems.length > 0 && (
          <div className='bg-amber-50/50 rounded-lg p-3 border border-amber-100'>
            <span className='font-medium text-amber-800'>Action Items: </span>
            <span className='text-amber-700'>{note.content.actionItems.length} items</span>
          </div>
        )}
        <div className='flex items-center gap-2 text-xs text-[#9071FF] font-medium pt-2 group-hover:gap-3 transition-all duration-300'>
          <span>Click to view full note</span>
          <svg
            className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </div>
      </div>
    </div>
  );
}
