'use client';

import { Calendar, Clock, X, Eye } from 'lucide-react';
import { useEffect } from 'react';

import {
  viewModeSignal,
  loadingSignal,
  fetchData,
  currentMonthSignal,
} from '../../state/availabilityState';

import { BlockedTimeView } from './availability/BlockedTimeView';
import { OverviewView } from './availability/OverviewView';
import { WorkingHoursView } from './availability/WorkingHoursView';

interface AvailabilityManagementProps {
  therapistId: number;
}

export function AvailabilityManagement({ therapistId }: AvailabilityManagementProps) {
  useEffect(() => {
    if (therapistId) {
      fetchData(therapistId);
    }
  }, [therapistId]);

  // Re-fetch data when current month changes
  useEffect(() => {
    if (therapistId) {
      fetchData(therapistId);
    }
  }, [therapistId, currentMonthSignal.value]);

  if (loadingSignal.value) {
    return (
      <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Calendar className='h-6 w-6 text-purple-600' />
            <h2 className='text-xl font-semibold text-gray-800'>Availability Management</h2>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => (viewModeSignal.value = 'overview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewModeSignal.value === 'overview'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className='w-4 h-4 inline mr-1' />
              Overview
            </button>
            <button
              onClick={() => (viewModeSignal.value = 'working-hours')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewModeSignal.value === 'working-hours'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className='w-4 h-4 inline mr-1' />
              Working Hours
            </button>
            <button
              onClick={() => (viewModeSignal.value = 'blocked-time')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewModeSignal.value === 'blocked-time'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className='w-4 h-4 inline mr-1' />
              Blocked Time
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {viewModeSignal.value === 'overview' && <OverviewView therapistId={therapistId} />}
        {viewModeSignal.value === 'working-hours' && <WorkingHoursView therapistId={therapistId} />}
        {viewModeSignal.value === 'blocked-time' && <BlockedTimeView therapistId={therapistId} />}
      </div>
    </div>
  );
}
