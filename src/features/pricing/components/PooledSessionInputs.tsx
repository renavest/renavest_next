'use client';

import { Users, DollarSign, Clock, Gift } from 'lucide-react';

interface PooledSessionInputsProps {
  employeeCount: number;
  totalBudget: number;
  sessionsPerEmployeePerYear: number;
  averageSessionCost: number;
  includeSubscription: boolean;
  monthlySubscriptionCost: number;
  setEmployeeCount: (value: number) => void;
  setTotalBudget: (value: number) => void;
  setSessionsPerEmployeePerYear: (value: number) => void;
  setAverageSessionCost: (value: number) => void;
  setIncludeSubscription: (value: boolean) => void;
  setMonthlySubscriptionCost: (value: number) => void;
}

export default function PooledSessionInputs({
  employeeCount,
  totalBudget,
  sessionsPerEmployeePerYear,
  averageSessionCost,
  includeSubscription,
  monthlySubscriptionCost,
  setEmployeeCount,
  setTotalBudget,
  setSessionsPerEmployeePerYear,
  setAverageSessionCost,
  setIncludeSubscription,
  setMonthlySubscriptionCost,
}: PooledSessionInputsProps) {
  return (
    <div className='space-y-6'>
      {/* Employee Count Input */}
      <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
        <div className='flex items-center mb-4'>
          <Users className='w-6 h-6 text-purple-600 mr-3' />
          <label htmlFor='employeeCount' className='block text-lg font-semibold text-gray-800'>
            Number of Employees
          </label>
        </div>
        <input
          type='number'
          id='employeeCount'
          value={employeeCount || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setEmployeeCount(value as number);
          }}
          min={1}
          className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
        />
      </div>

      {/* Total Budget Pool Input */}
      <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
        <div className='flex items-center mb-4'>
          <DollarSign className='w-6 h-6 text-green-600 mr-3' />
          <label htmlFor='totalBudget' className='block text-lg font-semibold text-gray-800'>
            Total Annual Budget Pool
          </label>
        </div>
        <input
          type='number'
          id='totalBudget'
          value={totalBudget || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setTotalBudget(value as number);
          }}
          min={0}
          className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
        />
        <p className='mt-2 text-sm text-gray-600'>
          Allocate a budget pool for session credits. Only pay when sessions are used.
        </p>
      </div>

      {/* Sessions per Employee per Year */}
      <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
        <div className='flex items-center mb-4'>
          <Clock className='w-6 h-6 text-blue-600 mr-3' />
          <label
            htmlFor='sessionsPerEmployee'
            className='block text-lg font-semibold text-gray-800'
          >
            Max Sessions per Employee per Year
          </label>
        </div>
        <input
          type='number'
          id='sessionsPerEmployee'
          value={sessionsPerEmployeePerYear || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setSessionsPerEmployeePerYear(value as number);
          }}
          min={1}
          max={12}
          className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
        />
        <p className='mt-2 text-sm text-gray-600'>
          Set the maximum sessions each employee can book from your budget pool.
        </p>
      </div>

      {/* Average Session Cost */}
      <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
        <div className='flex items-center mb-4'>
          <DollarSign className='w-6 h-6 text-yellow-600 mr-3' />
          <label htmlFor='averageSessionCost' className='block text-lg font-semibold text-gray-800'>
            Average Session Cost
          </label>
        </div>
        <input
          type='number'
          id='averageSessionCost'
          value={averageSessionCost || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setAverageSessionCost(value as number);
          }}
          min={0}
          className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
        />
        <p className='mt-2 text-sm text-gray-600'>
          Cost per financial therapy session deducted from your budget pool.
        </p>
      </div>

      {/* Subscription Layer Toggle */}
      <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <Gift className='w-6 h-6 text-indigo-600 mr-3' />
            <label className='block text-lg font-semibold text-gray-800'>
              Include Subscription Layer
            </label>
          </div>
          <div
            className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${
              includeSubscription ? 'bg-purple-600' : 'bg-gray-300'
            }`}
            onClick={() => setIncludeSubscription(!includeSubscription)}
          >
            <div
              className={`w-7 h-7 bg-white rounded-full absolute top-0 transition-all duration-300 shadow-md ${
                includeSubscription ? 'right-0' : 'right-7'
              }`}
            />
          </div>
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          Provides ongoing access to therapist messaging, content, and onboarding tools.
        </p>

        {includeSubscription && (
          <div className='mt-4'>
            <label htmlFor='subscriptionCost' className='block text-sm font-medium text-gray-700'>
              Monthly Subscription Cost per Employee
            </label>
            <input
              type='number'
              id='subscriptionCost'
              value={monthlySubscriptionCost || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setMonthlySubscriptionCost(value as number);
              }}
              min={0}
              className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Light monthly fee for engagement tools and ongoing support.
            </p>
          </div>
        )}
      </div>

      {/* Free Trial Benefits Info */}
      <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200'>
        <div className='flex items-center mb-3'>
          <Gift className='w-6 h-6 text-green-600 mr-3' />
          <h3 className='text-lg font-semibold text-green-800'>Free Trial Benefits</h3>
        </div>
        <ul className='list-disc pl-5 text-sm text-green-700 space-y-1'>
          <li>First 20-minute consultation covered by pilot budget</li>
          <li>Initial messaging access with financial therapists</li>
          <li>Reduces friction and boosts adoption rates</li>
          <li>Helps employees engage before booking full sessions</li>
        </ul>
        <p className='mt-3 text-xs text-green-600 font-medium'>
          💡 Free trials typically increase engagement by 40-60% before full sessions are booked
        </p>
      </div>
    </div>
  );
}
