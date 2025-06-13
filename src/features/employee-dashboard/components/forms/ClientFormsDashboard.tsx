'use client';

/* eslint-disable max-lines-per-function */
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Filter,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { COLORS } from '@/src/styles/colors';

import {
  clientFormsStateSignal,
  clientFormsActions,
  getAssignmentsByStatus,
} from '../../state/clientFormsState';
import type { ClientFormAssignment } from '../../state/clientFormsState';

import { ClientFormFill } from './ClientFormFill';

export function ClientFormsDashboard() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'completed' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<ClientFormAssignment | null>(null);

  const formsState = clientFormsStateSignal.value;

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    clientFormsActions.setLoading(true);
    clientFormsActions.setError(null);

    try {
      const response = await fetch('/api/client/forms', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache', // Force fresh data when explicitly refreshing
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load forms');
      }

      // Check for warnings from the API
      if (result.warning) {
        console.warn('Forms API returned warning:', result.warning);
        toast.warning('Some form data may be incomplete');
      }

      clientFormsActions.setAssignments(result.assignments);
      console.log('Forms loaded successfully', {
        count: result.assignments.length,
        total: result.total,
      });
    } catch (error) {
      console.error('Error loading form assignments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load forms';
      clientFormsActions.setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      clientFormsActions.setLoading(false);
    }
  };

  // Cache-aware refresh function
  const refreshForms = async () => {
    console.log('Refreshing forms (cache-aware)...');
    await loadAssignments();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'expired':
        return <AlertTriangle className='w-5 h-5 text-red-500' />;
      default:
        return <Clock className='w-5 h-5 text-amber-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const isExpiringSoon = (assignment: ClientFormAssignment) => {
    if (!assignment.expiresAt || assignment.status !== 'sent') return false;
    const expiresAt = new Date(assignment.expiresAt);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return expiresAt <= threeDaysFromNow;
  };

  const filteredAssignments = formsState.assignments
    .filter((assignment) => {
      if (statusFilter !== 'all' && assignment.status !== statusFilter) return false;
      if (searchTerm && !assignment.formTitle.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by status priority (sent first, then completed, then expired)
      // Then by date (newest first)
      if (a.status !== b.status) {
        const statusOrder = ['sent', 'completed', 'expired'];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    });

  const sentCount = getAssignmentsByStatus('sent').length;
  const completedCount = getAssignmentsByStatus('completed').length;
  const expiredCount = getAssignmentsByStatus('expired').length;

  // Show form filling interface if an assignment is selected
  if (selectedAssignment) {
    return (
      <ClientFormFill assignment={selectedAssignment} onBack={() => setSelectedAssignment(null)} />
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Your Forms</h1>
          <p className='text-gray-600'>
            Complete intake forms and questionnaires assigned by your therapist
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Pending</p>
              <p className='text-3xl font-bold text-amber-600'>{sentCount}</p>
            </div>
            <div className='p-3 bg-amber-100 rounded-lg'>
              <Clock className='w-6 h-6 text-amber-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Completed</p>
              <p className='text-3xl font-bold text-green-600'>{completedCount}</p>
            </div>
            <div className='p-3 bg-green-100 rounded-lg'>
              <CheckCircle className='w-6 h-6 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Expired</p>
              <p className='text-3xl font-bold text-red-600'>{expiredCount}</p>
            </div>
            <div className='p-3 bg-red-100 rounded-lg'>
              <AlertTriangle className='w-6 h-6 text-red-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8'>
        <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-gray-500' />
              <span className='text-sm font-medium text-gray-700'>Filter:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'sent' | 'completed' | 'expired')
              }
              className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value='all'>All Forms</option>
              <option value='sent'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='expired'>Expired</option>
            </select>
          </div>

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search forms...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64'
            />
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className='space-y-4'>
        {formsState.loading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse'
              >
                <div className='flex items-center justify-between'>
                  <div className='space-y-2 flex-1'>
                    <div className='h-6 bg-gray-200 rounded w-1/3'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                  </div>
                  <div className='h-10 w-24 bg-gray-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`
                bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all hover:shadow-md
                ${isExpiringSoon(assignment) ? 'ring-2 ring-amber-200' : ''}
              `}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                        {assignment.formTitle}
                      </h3>
                      {assignment.formDescription && (
                        <p className='text-gray-600 text-sm mb-2'>{assignment.formDescription}</p>
                      )}
                    </div>

                    <div className='flex items-center gap-3'>
                      {isExpiringSoon(assignment) && (
                        <div className='flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium'>
                          <AlertTriangle className='w-3 h-3' />
                          Expires Soon
                        </div>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}
                      >
                        {getStatusIcon(assignment.status)}
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-6 text-sm text-gray-500'>
                    <span className='flex items-center gap-1'>
                      <User className='w-4 h-4' />
                      {assignment.therapistName}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Calendar className='w-4 h-4' />
                      Sent {new Date(assignment.sentAt).toLocaleDateString()}
                    </span>
                    {assignment.completedAt && (
                      <span className='flex items-center gap-1 text-green-600'>
                        <CheckCircle className='w-4 h-4' />
                        Completed {new Date(assignment.completedAt).toLocaleDateString()}
                      </span>
                    )}
                    {assignment.expiresAt && assignment.status === 'sent' && (
                      <span className='flex items-center gap-1 text-amber-600'>
                        <Clock className='w-4 h-4' />
                        Expires {new Date(assignment.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className='ml-6'>
                  {assignment.status === 'sent' ? (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className={`inline-flex items-center gap-2 px-4 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
                    >
                      <FileText className='w-4 h-4' />
                      Fill Out
                    </button>
                  ) : assignment.status === 'completed' ? (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                    >
                      <CheckCircle className='w-4 h-4' />
                      View Responses
                    </button>
                  ) : (
                    <span className='inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium'>
                      <AlertTriangle className='w-4 h-4' />
                      Expired
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-12'>
            <div className='mb-6'>
              <FileText className='w-16 h-16 text-gray-300 mx-auto' />
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>No forms found</h3>
            <p className='text-gray-600'>
              {statusFilter === 'all'
                ? "You don't have any assigned forms yet."
                : `No ${statusFilter} forms found.`}
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className='mt-4 text-purple-600 hover:text-purple-700 font-medium'
              >
                View all forms
              </button>
            )}
          </div>
        )}
      </div>

      {formsState.error && (
        <div className='mt-8 bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-red-700'>
            <AlertTriangle className='w-5 h-5' />
            <span className='font-medium'>Error loading forms</span>
          </div>
          <p className='text-red-600 mt-1'>{formsState.error}</p>
          <button
            onClick={refreshForms}
            className='mt-3 text-red-700 hover:text-red-800 font-medium underline'
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
