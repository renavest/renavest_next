'use client';

import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';

import { ClientNotesModal } from './ClientNotesModal';

export default function ClientNotesSection() {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  return (
    <div className='bg-white rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>Client Notes</h3>
        <div className='flex items-center space-x-2'>
          <FileText className='h-5 w-5 text-purple-600' />
          <button
            onClick={() => setIsNotesModalOpen(true)}
            className='flex items-center px-3 py-2 text-sm border border-purple-200 text-purple-600 rounded-md hover:bg-purple-50 transition-colors'
          >
            <Plus className='h-4 w-4 mr-2' /> New Note
          </button>
        </div>
      </div>

      {/* Placeholder for notes list */}
      <p className='text-gray-500 text-center'>No recent notes</p>

      {/* Client Notes Modal */}
      {isNotesModalOpen && (
        <ClientNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          userId='user_123' // TODO: Replace with actual user ID
          therapistId={1} // TODO: Replace with actual therapist ID
        />
      )}
    </div>
  );
}
