'use client';
import { Calendar, Lock, Download, X } from 'lucide-react';

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

interface NoteDetailModalProps {
  note: ClientNote;
  onClose: () => void;
  onEdit: (note: ClientNote) => void;
  onDelete: (note: ClientNote) => void;
}

export function NoteDetailModal({ note, onClose, onEdit, onDelete }: NoteDetailModalProps) {
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-in fade-in duration-300'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden transform animate-in zoom-in duration-300'>
        {/* Header */}
        <div className='p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-indigo-50/30'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-2 h-8 bg-gradient-to-b from-[#9071FF] to-purple-600 rounded-full'></div>
              <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-1'>{note.title}</h3>
                <div className='flex items-center gap-3'>
                  {note.content.category && (
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${categoryColors[note.content.category]}`}
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
            <button
              onClick={onClose}
              className='p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-8 max-h-[55vh] overflow-y-auto space-y-8'>
          <div className='flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg w-fit'>
            <Calendar className='w-4 h-4' />
            <span className='font-medium'>{formatDate(note.createdAt)}</span>
          </div>

          {note.content.keyObservations && note.content.keyObservations.length > 0 && (
            <div className='bg-blue-50/50 rounded-xl p-6 border border-blue-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                Key Observations
              </h4>
              <ul className='space-y-2 text-gray-700'>
                {note.content.keyObservations.map((obs, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <div className='w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='leading-relaxed'>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {note.content.clinicalAssessment && (
            <div className='bg-purple-50/50 rounded-xl p-6 border border-purple-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                Clinical Assessment
              </h4>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {note.content.clinicalAssessment}
              </p>
            </div>
          )}

          {note.content.treatmentPlan && (
            <div className='bg-emerald-50/50 rounded-xl p-6 border border-emerald-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                Treatment Plan
              </h4>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {note.content.treatmentPlan}
              </p>
            </div>
          )}

          {note.content.riskAssessment && (
            <div className='bg-red-50/50 rounded-xl p-6 border border-red-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                Risk Assessment
              </h4>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {note.content.riskAssessment}
              </p>
            </div>
          )}

          {note.content.additionalContext && (
            <div className='bg-gray-50/50 rounded-xl p-6 border border-gray-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
                Additional Notes
              </h4>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {note.content.additionalContext}
              </p>
            </div>
          )}

          {note.content.actionItems && note.content.actionItems.length > 0 && (
            <div className='bg-amber-50/50 rounded-xl p-6 border border-amber-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-amber-500 rounded-full'></div>
                Action Items
              </h4>
              <ul className='space-y-2 text-gray-700'>
                {note.content.actionItems.map((item, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <div className='w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='leading-relaxed'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {note.content.followUpNeeded && note.content.followUpNeeded.length > 0 && (
            <div className='bg-indigo-50/50 rounded-xl p-6 border border-indigo-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                <div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
                Follow Up Needed
              </h4>
              <ul className='space-y-2 text-gray-700'>
                {note.content.followUpNeeded.map((item, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <div className='w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0'></div>
                    <span className='leading-relaxed'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50/30 to-purple-50/30'>
          <div className='flex justify-between'>
            <div className='flex gap-3'>
              <button
                onClick={handleEdit}
                className='inline-flex items-center gap-2 px-6 py-3 bg-[#9071FF] text-white rounded-xl hover:bg-[#7c5ce8] transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5'
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
                className='inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              >
                <Download className='w-4 h-4' />
                Export This Note
              </button>
            </div>
            <button
              onClick={handleDelete}
              className='inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5'
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
    </div>
  );
}
