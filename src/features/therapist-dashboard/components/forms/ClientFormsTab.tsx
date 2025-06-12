'use client';

import { Plus, FileText, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

import { formsStateSignal, formsActions, getAssignmentsByClient } from '../../state/formsState';
import type { Client } from '../../types';

interface ClientFormsTabProps {
  client: Client;
}

export function ClientFormsTab({ client }: ClientFormsTabProps) {
  const formsState = formsStateSignal.value;
  const clientAssignments = getAssignmentsByClient(client.id);

  useEffect(() => {
    // For now, we'll show a coming soon message with the basic structure
    // In the future, this will fetch forms and assignments
    formsActions.setLoading(false);
  }, [client.id]);

  if (formsState.loading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-20 bg-gray-100 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900'>Intake Forms</h3>
          <p className='text-gray-600 text-sm mt-1'>
            Send and manage intake forms for {client.firstName} {client.lastName}
          </p>
        </div>
        <button
          onClick={() => formsActions.openFormBuilder()}
          className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium'
        >
          <Plus className='w-4 h-4' />
          Create Form
        </button>
      </div>

      {/* Coming Soon Message */}
      <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6'>
            <FileText className='w-8 h-8 text-purple-600' />
          </div>
          <h4 className='text-xl font-semibold text-gray-900 mb-2'>Custom Intake Forms</h4>
          <p className='text-gray-600 mb-6 max-w-md mx-auto leading-relaxed'>
            Create custom intake forms, send them to clients, and securely collect responses. This
            powerful feature is coming soon to help streamline your client onboarding process.
          </p>

          <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm max-w-lg mx-auto'>
            <h5 className='font-semibold text-gray-900 mb-3'>Planned Features:</h5>
            <div className='space-y-2 text-sm text-gray-700'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                <span>Drag-and-drop form builder</span>
              </div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                <span>Secure client form completion</span>
              </div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                <span>HIPAA-compliant data collection</span>
              </div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                <span>Response tracking and notifications</span>
              </div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                <span>Form templates for common use cases</span>
              </div>
            </div>
          </div>

          <div className='mt-6 text-sm text-purple-600 font-medium'>
            🚀 Currently in development - Coming in the next release
          </div>
        </div>
      </div>

      {/* Preview of Future Interface */}
      <div className='opacity-50 pointer-events-none'>
        <div className='bg-white rounded-xl border border-gray-200 p-6'>
          <h4 className='text-lg font-semibold text-gray-900 mb-4'>
            Sent Forms ({clientAssignments.length})
          </h4>

          <div className='text-center py-8'>
            <FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>No forms sent to this client yet</p>
            <p className='text-sm text-gray-400 mt-1'>
              Send an intake form to start collecting client information
            </p>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-6 mt-6'>
          <h4 className='text-lg font-semibold text-gray-900 mb-4'>Available Forms (0)</h4>

          <div className='text-center py-8'>
            <FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>No forms created yet</p>
            <p className='text-sm text-gray-400 mt-1'>
              Create your first intake form to get started
            </p>
            <button
              disabled
              className='mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium'
            >
              <Plus className='w-4 h-4' />
              Create Your First Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
