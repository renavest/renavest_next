'use client';

import { Plus, FileText, CheckCircle, Send, Clock, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';

import { COLORS } from '@/src/styles/colors';

import {
  formsStateSignal,
  formsActions,
  getAssignmentsByClient,
  getFormsByTherapist,
} from '../../state/formsState';
import type { Client } from '../../types';
import type { FormAssignment, IntakeForm } from '../../types/forms';

import { FormBuilder } from './FormBuilder';

interface ClientFormsTabProps {
  client: Client;
}

type FilterStatus = 'all' | 'sent' | 'completed' | 'expired';

interface SentFormsProps {
  filteredAssignments: FormAssignment[];
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactElement;
}

interface AvailableFormsProps {
  availableForms: IntakeForm[];
  handleSendForm: (formId: string) => void;
}

function SentFormsSection({
  filteredAssignments,
  filterStatus,
  setFilterStatus,
  getStatusColor,
  getStatusIcon,
}: SentFormsProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h4 className='text-lg font-semibold text-gray-900'>
          Sent Forms ({filteredAssignments.length})
        </h4>

        {/* Status Filter */}
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-500' />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className='px-3 py-1 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
          >
            <option value='all'>All Status</option>
            <option value='sent'>Sent</option>
            <option value='completed'>Completed</option>
            <option value='expired'>Expired</option>
          </select>
        </div>
      </div>

      {filteredAssignments.length > 0 ? (
        <div className='space-y-3'>
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className='p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h5 className='font-medium text-gray-900'>{assignment.formTitle}</h5>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}
                    >
                      {getStatusIcon(assignment.status)}
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p>Sent: {new Date(assignment.sentAt).toLocaleDateString()}</p>
                    {assignment.completedAt && (
                      <p>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</p>
                    )}
                    {assignment.expiresAt && assignment.status === 'sent' && (
                      <p>Expires: {new Date(assignment.expiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {assignment.status === 'completed' && (
                    <button className='inline-flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors'>
                      <Eye className='w-4 h-4' />
                      View Responses
                    </button>
                  )}
                  {assignment.status === 'sent' && (
                    <button className='inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors'>
                      <Send className='w-4 h-4' />
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8'>
          <FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500'>No forms sent to this client yet</p>
          <p className='text-sm text-gray-400 mt-1'>
            Send an intake form to start collecting client information
          </p>
        </div>
      )}
    </div>
  );
}

function AvailableFormsSection({ availableForms, handleSendForm }: AvailableFormsProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6'>
      <h4 className='text-lg font-semibold text-gray-900 mb-6'>
        Available Forms ({availableForms.length})
      </h4>

      {availableForms.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {availableForms.map((form) => (
            <div
              key={form.id}
              className='p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors'
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <h5 className='font-medium text-gray-900 mb-1'>{form.title}</h5>
                  {form.description && (
                    <p className='text-sm text-gray-600 line-clamp-2'>{form.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    form.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {form.status}
                </span>
              </div>

              <div className='text-sm text-gray-500 mb-4'>
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''} • Created{' '}
                {new Date(form.createdAt).toLocaleDateString()}
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleSendForm(form.id)}
                  disabled={form.status !== 'active'}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    form.status === 'active'
                      ? `${COLORS.WARM_PURPLE.bg} text-white hover:${COLORS.WARM_PURPLE.hover}`
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className='w-4 h-4' />
                  Send to Client
                </button>

                <button
                  onClick={() => formsActions.openFormBuilder(form)}
                  className='px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:border-gray-400 transition-colors'
                >
                  <Edit className='w-4 h-4' />
                </button>

                <button
                  onClick={() => formsActions.deleteForm(form.id)}
                  className='px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:border-red-400 transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8'>
          <FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500'>No forms created yet</p>
          <p className='text-sm text-gray-400 mt-1'>Create your first intake form to get started</p>
          <button
            onClick={() => formsActions.openFormBuilder()}
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
          >
            <Plus className='w-4 h-4' />
            Create Your First Form
          </button>
        </div>
      )}
    </div>
  );
}

export function ClientFormsTab({ client }: ClientFormsTabProps) {
  const formsState = formsStateSignal.value;
  const clientAssignments = getAssignmentsByClient(client.id);
  const availableForms = getFormsByTherapist(1); // TODO: Get from therapist context
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const filteredAssignments = clientAssignments.filter(
    (assignment) => filterStatus === 'all' || assignment.status === filterStatus,
  );

  useEffect(() => {
    // Load forms and assignments for this client
    formsActions.setLoading(false);
  }, [client.id]);

  const handleSendForm = async (formId: string) => {
    try {
      formsActions.setLoading(true);

      const response = await fetch('/api/therapist/forms/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          clientId: client.id,
          expiresInDays: 7, // Default to 7 days expiration
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send form');
      }

      // Create the assignment object for local state
      const assignment = {
        id: result.assignment.id,
        formId: result.assignment.formId,
        formTitle: availableForms.find((f) => f.id === formId)?.title || 'Unknown Form',
        clientId: result.assignment.clientId,
        status: result.assignment.status as 'sent' | 'completed' | 'expired',
        sentAt: result.assignment.sentAt,
        expiresAt: result.assignment.expiresAt,
      };

      formsActions.addAssignment(assignment);

      // Show success message using toast
      const { toast } = await import('sonner');
      toast.success('Form sent successfully!');
    } catch (error) {
      console.error('Error sending form:', error);

      // Show error message using toast
      const { toast } = await import('sonner');
      toast.error(error instanceof Error ? error.message : 'Failed to send form');
    } finally {
      formsActions.setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-4 h-4' />;
      case 'sent':
        return <Clock className='w-4 h-4' />;
      case 'expired':
        return <FileText className='w-4 h-4' />;
      default:
        return <FileText className='w-4 h-4' />;
    }
  };

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
    <>
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
            className={`inline-flex items-center gap-2 px-4 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
          >
            <Plus className='w-4 h-4' />
            Create Form
          </button>
        </div>

        {/* Sent Forms Section */}
        <SentFormsSection
          filteredAssignments={filteredAssignments}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />

        {/* Available Forms Section */}
        <AvailableFormsSection availableForms={availableForms} handleSendForm={handleSendForm} />

        {/* Quick Actions */}
        <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200'>
          <h4 className='text-lg font-semibold text-gray-900 mb-4'>Quick Actions</h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button
              onClick={() => formsActions.openFormBuilder()}
              className='p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all text-left group'
            >
              <div className='flex items-center gap-3 mb-2'>
                <Plus className='w-5 h-5 text-purple-600' />
                <span className='font-medium text-gray-900'>Create New Form</span>
              </div>
              <p className='text-sm text-gray-600'>Build a custom intake form for this client</p>
            </button>

            <button className='p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all text-left group'>
              <div className='flex items-center gap-3 mb-2'>
                <FileText className='w-5 h-5 text-purple-600' />
                <span className='font-medium text-gray-900'>Use Template</span>
              </div>
              <p className='text-sm text-gray-600'>Start with a pre-built form template</p>
            </button>

            <button className='p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all text-left group'>
              <div className='flex items-center gap-3 mb-2'>
                <CheckCircle className='w-5 h-5 text-purple-600' />
                <span className='font-medium text-gray-900'>Review Responses</span>
              </div>
              <p className='text-sm text-gray-600'>View completed form submissions</p>
            </button>
          </div>
        </div>
      </div>

      {/* Form Builder Modal */}
      <FormBuilder />
    </>
  );
}
