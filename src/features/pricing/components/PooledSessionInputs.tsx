'use client';

import { Users, DollarSign, Clock, Gift, HelpCircle } from 'lucide-react';
import { useState } from 'react';

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
  const [showHelp, setShowHelp] = useState<string | null>(null);

  const suggestedBudgetPerEmployee =
    employeeCount > 0 ? Math.round(totalBudget / employeeCount) : 0;
  const averageBudgetGuidance =
    suggestedBudgetPerEmployee < 200
      ? '💡 Consider increasing for better coverage'
      : suggestedBudgetPerEmployee < 400
        ? '✅ Good starting budget'
        : '🚀 Generous budget for comprehensive support';

  return (
    <div className='space-y-6'>
      {/* Step 1: Team Size */}
      <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3'>
              <span className='text-white font-bold'>1</span>
            </div>
            <div>
              <label
                htmlFor='employeeCount'
                className='block text-lg font-semibold text-purple-800'
              >
                How many employees do you have?
              </label>
              <p className='text-sm text-purple-600'>
                This helps us calculate your per-person impact
              </p>
            </div>
          </div>
          <Users className='w-6 h-6 text-purple-600' />
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
          placeholder='e.g., 50'
          className='block w-full rounded-lg border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
        />
      </div>

      {/* Step 2: Budget Allocation */}
      <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3'>
              <span className='text-white font-bold'>2</span>
            </div>
            <div>
              <label htmlFor='totalBudget' className='block text-lg font-semibold text-green-800'>
                What's your annual wellness budget?
              </label>
              <p className='text-sm text-green-600'>
                Start with what feels comfortable - you only pay for sessions used
              </p>
            </div>
          </div>
          <DollarSign className='w-6 h-6 text-green-600' />
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
          placeholder='e.g., 15000'
          className='block w-full rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-lg'
        />
        {employeeCount > 0 && (
          <div className='mt-3 p-3 bg-white rounded-lg border border-green-200'>
            <p className='text-sm text-green-700'>
              <span className='font-semibold'>${suggestedBudgetPerEmployee}/employee annually</span>
              <span className='ml-2'>{averageBudgetGuidance}</span>
            </p>
            <p className='text-xs text-green-600 mt-1'>
              Most companies start with $200-400 per employee and adjust based on usage
            </p>
          </div>
        )}
      </div>

      {/* Advanced Settings Toggle */}
      <div className='bg-blue-50 rounded-xl p-6 border border-blue-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3'>
              <span className='text-white font-bold'>3</span>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-blue-800'>Fine-tune your program</h3>
              <p className='text-sm text-blue-600'>Optional settings for customization</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(showHelp === 'advanced' ? null : 'advanced')}
            className='text-blue-600 hover:text-blue-800 transition-colors'
          >
            <HelpCircle className='w-5 h-5' />
          </button>
        </div>

        {showHelp === 'advanced' && (
          <div className='mb-4 p-3 bg-blue-100 rounded-lg'>
            <p className='text-sm text-blue-700'>
              These settings help you customize the program to your company's needs. The defaults
              work well for most organizations.
            </p>
          </div>
        )}

        <div className='grid md:grid-cols-2 gap-4'>
          {/* Max Sessions */}
          <div>
            <label
              htmlFor='sessionsPerEmployee'
              className='block text-sm font-medium text-blue-800 mb-2'
            >
              Max sessions per employee/year
            </label>
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
              className='block w-full rounded-lg border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <p className='mt-1 text-xs text-blue-600'>
              Recommended: 3-5 sessions for comprehensive support
            </p>
          </div>

          {/* Session Cost */}
          <div>
            <label
              htmlFor='averageSessionCost'
              className='block text-sm font-medium text-blue-800 mb-2'
            >
              Cost per session
            </label>
            <input
              type='number'
              id='averageSessionCost'
              value={averageSessionCost || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setAverageSessionCost(value as number);
              }}
              min={0}
              className='block w-full rounded-lg border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
            <p className='mt-1 text-xs text-blue-600'>
              Typical range: $120-180 per hour-long session
            </p>
          </div>
        </div>
      </div>

      {/* Step 4: Subscription Add-on */}
      <div className='bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3'>
              <span className='text-white font-bold'>4</span>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-indigo-800'>Add ongoing support?</h3>
              <p className='text-sm text-indigo-600'>Keep employees engaged between sessions</p>
            </div>
          </div>
          <Gift className='w-6 h-6 text-indigo-600' />
        </div>

        <div className='flex items-center justify-between p-4 bg-white rounded-lg border border-indigo-200 mb-4'>
          <div>
            <h4 className='font-semibold text-gray-800'>Include messaging & content library</h4>
            <p className='text-sm text-gray-600'>
              24/7 therapist messaging, educational content, and onboarding tools
            </p>
          </div>
          <div
            className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${
              includeSubscription ? 'bg-indigo-600' : 'bg-gray-300'
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

        {includeSubscription && (
          <div className='bg-white rounded-lg p-4 border border-indigo-200'>
            <label
              htmlFor='subscriptionCost'
              className='block text-sm font-medium text-indigo-700 mb-2'
            >
              Monthly cost per employee
            </label>
            <div className='flex items-center space-x-3'>
              <span className='text-2xl font-bold text-gray-800'>$</span>
              <input
                type='number'
                id='subscriptionCost'
                value={monthlySubscriptionCost || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  setMonthlySubscriptionCost(value as number);
                }}
                min={0}
                className='flex-1 rounded-lg border-indigo-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
              <span className='text-sm text-indigo-600'>/month</span>
            </div>
            <p className='mt-2 text-xs text-indigo-600'>
              Recommended: $10-15/month for comprehensive ongoing support
            </p>
          </div>
        )}
      </div>

      {/* Free Trial Highlight */}
      <div className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200'>
        <div className='flex items-center mb-3'>
          <Gift className='w-6 h-6 text-orange-600 mr-3' />
          <h3 className='text-lg font-semibold text-orange-800'>
            🎉 Included Free with Every Plan
          </h3>
        </div>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='flex items-start space-x-3'>
            <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5'>
              <span className='text-orange-600 text-xs font-bold'>✓</span>
            </div>
            <div>
              <h4 className='font-semibold text-orange-800'>Free 20-min consultation</h4>
              <p className='text-sm text-orange-700'>
                Every employee gets a risk-free trial session
              </p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <div className='w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5'>
              <span className='text-orange-600 text-xs font-bold'>✓</span>
            </div>
            <div>
              <h4 className='font-semibold text-orange-800'>Initial messaging access</h4>
              <p className='text-sm text-orange-700'>Connect with therapists before booking</p>
            </div>
          </div>
        </div>
        <div className='mt-4 p-3 bg-white rounded-lg border border-orange-200'>
          <p className='text-sm text-orange-800 font-medium'>
            💡 Companies see 40-60% higher engagement when employees try the free consultation first
          </p>
        </div>
      </div>
    </div>
  );
}
