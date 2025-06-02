'use client';

import { Users, Gift, Percent } from 'lucide-react';
import React from 'react';

interface PooledSessionInputsProps {
  employeeCount: number;
  sessionsPerEmployeePerYear: number;
  averageSessionCost: number;
  includeSubscription: boolean;
  subscriptionSubsidyPercentage: number;
  sessionSubsidyPercentage: number;
  setEmployeeCount: (value: number) => void;
  setTotalBudget: (value: number) => void;
  setSessionsPerEmployeePerYear: (value: number) => void;
  setAverageSessionCost: (value: number) => void;
  setIncludeSubscription: (value: boolean) => void;
  setSubscriptionSubsidyPercentage: (value: number) => void;
  setSessionSubsidyPercentage: (value: number) => void;
}

export default function PooledSessionInputs({
  employeeCount,
  sessionsPerEmployeePerYear,
  averageSessionCost,
  includeSubscription,
  subscriptionSubsidyPercentage,
  sessionSubsidyPercentage,
  setEmployeeCount,
  setTotalBudget,
  setSessionsPerEmployeePerYear,
  setAverageSessionCost,
  setIncludeSubscription,
  setSubscriptionSubsidyPercentage,
  setSessionSubsidyPercentage,
}: PooledSessionInputsProps) {
  const fixedMonthlySubscriptionCost = 10;

  // Calculate automatic session budget based on subsidy and max usage
  const maxPossibleSessions = employeeCount * sessionsPerEmployeePerYear;
  const companySessionCostPerSession = (averageSessionCost * sessionSubsidyPercentage) / 100;
  const calculatedSessionBudget = maxPossibleSessions * companySessionCostPerSession;

  // Auto-update the budget when calculations change
  React.useEffect(() => {
    if (calculatedSessionBudget > 0) {
      setTotalBudget(calculatedSessionBudget);
    }
  }, [calculatedSessionBudget, setTotalBudget]);

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
              <p className='text-sm text-purple-600'>We'll calculate their individual costs</p>
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

      {/* Step 2: Employee Subscription Model */}
      <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3'>
              <span className='text-white font-bold'>2</span>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-blue-800'>
                Employee Subscription - $10/month
              </h3>
              <p className='text-sm text-blue-600'>
                💰 <strong>Your only guaranteed monthly cost</strong> - everything else is
                pay-as-you-go
              </p>
            </div>
          </div>
          <Gift className='w-6 h-6 text-blue-600' />
        </div>

        <div className='bg-white rounded-lg p-4 border border-blue-200 mb-4'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h4 className='font-semibold text-gray-800'>Include Employee Subscriptions</h4>
              <p className='text-sm text-gray-600'>
                Fixed $10/month per employee - gives ongoing access to financial therapist
              </p>
            </div>
            <div
              className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ${
                includeSubscription ? 'bg-blue-600' : 'bg-gray-300'
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
            <div className='space-y-4 pt-4 border-t border-blue-100'>
              <div className='bg-blue-50 rounded-lg p-4'>
                <div className='text-center mb-3'>
                  <div className='text-2xl font-bold text-blue-700'>$10.00</div>
                  <div className='text-sm text-blue-600'>per employee per month</div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-blue-700 mb-2'>
                    Company covers what % of subscription?
                  </label>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='number'
                      value={subscriptionSubsidyPercentage || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        setSubscriptionSubsidyPercentage(value as number);
                      }}
                      min={0}
                      max={100}
                      className='flex-1 rounded-lg border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                    />
                    <span className='text-lg font-bold text-gray-800'>%</span>
                  </div>
                  <p className='text-xs text-blue-600 mt-1'>
                    0% = employee pays $10, 100% = company pays $10
                  </p>
                </div>
              </div>

              {/* Subscription Cost Breakdown */}
              {employeeCount > 0 && (
                <div className='bg-blue-50 rounded-lg p-3'>
                  <div className='grid md:grid-cols-3 gap-4 text-center'>
                    <div>
                      <div className='text-lg font-bold text-blue-700'>
                        $
                        {(
                          (fixedMonthlySubscriptionCost * subscriptionSubsidyPercentage) /
                          100
                        ).toFixed(2)}
                      </div>
                      <div className='text-xs text-blue-600'>Company pays/employee/month</div>
                    </div>
                    <div>
                      <div className='text-lg font-bold text-blue-700'>
                        $
                        {(
                          fixedMonthlySubscriptionCost -
                          (fixedMonthlySubscriptionCost * subscriptionSubsidyPercentage) / 100
                        ).toFixed(2)}
                      </div>
                      <div className='text-xs text-blue-600'>Employee pays/month</div>
                    </div>
                    <div>
                      <div className='text-lg font-bold text-blue-700'>
                        $
                        {(
                          (fixedMonthlySubscriptionCost *
                            subscriptionSubsidyPercentage *
                            employeeCount *
                            12) /
                          100
                        ).toLocaleString()}
                      </div>
                      <div className='text-xs text-blue-600'>Company annual cost</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* What subscription includes */}
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200'>
          <h4 className='font-semibold text-green-800 mb-2'>🎁 What Subscription Includes:</h4>
          <div className='grid md:grid-cols-2 gap-3 text-sm text-green-700'>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
              FREE 20-minute consultation
            </div>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
              24/7 messaging with therapist
            </div>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
              Access to financial resources
            </div>
            <div className='flex items-center'>
              <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
              Quick check-ins and support
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Session Subsidy Pool */}
      <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center'>
            <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3'>
              <span className='text-white font-bold'>3</span>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-green-800'>Session Subsidy Pool</h3>
              <p className='text-sm text-green-600'>
                🎯 <strong>Pay-as-you-go only</strong> - We'll calculate your pool size based on max
                usage
              </p>
            </div>
          </div>
          <Percent className='w-6 h-6 text-green-600' />
        </div>

        <div className='grid md:grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-green-700 mb-2'>
              Average session cost
            </label>
            <div className='flex items-center space-x-2'>
              <span className='text-lg font-bold text-gray-800'>$</span>
              <input
                type='number'
                value={averageSessionCost || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  setAverageSessionCost(value as number);
                }}
                min={0}
                className='flex-1 rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500'
              />
              <span className='text-sm text-green-600'>/session</span>
            </div>
            <p className='text-xs text-green-600 mt-1'>Typical range: $120-180/hour</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-green-700 mb-2'>
              Company covers what % of session cost?
            </label>
            <div className='flex items-center space-x-2'>
              <input
                type='number'
                value={sessionSubsidyPercentage || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  setSessionSubsidyPercentage(value as number);
                }}
                min={0}
                max={100}
                className='flex-1 rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500'
              />
              <span className='text-lg font-bold text-gray-800'>%</span>
            </div>
            <p className='text-xs text-green-600 mt-1'>
              0% = employee pays full cost, 100% = company pays all
            </p>
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-green-700 mb-2'>
            Max sessions per employee per year
          </label>
          <input
            type='number'
            value={sessionsPerEmployeePerYear || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : Number(e.target.value);
              setSessionsPerEmployeePerYear(value as number);
            }}
            min={1}
            max={12}
            className='block w-full rounded-lg border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500'
          />
          <p className='text-xs text-green-600 mt-1'>
            Recommended: 3-5 sessions for comprehensive support
          </p>
        </div>

        {/* Session Cost Breakdown */}
        <div className='bg-green-50 rounded-lg p-4'>
          <h4 className='font-semibold text-green-800 mb-3'>💰 Automatic Pool Calculation:</h4>
          <div className='grid md:grid-cols-2 gap-4 text-center mb-4'>
            <div>
              <div className='text-lg font-bold text-green-700'>
                ${companySessionCostPerSession.toFixed(2)}
              </div>
              <div className='text-xs text-green-600'>Company pays per session</div>
            </div>
            <div>
              <div className='text-lg font-bold text-green-700'>
                ${(averageSessionCost - companySessionCostPerSession).toFixed(2)}
              </div>
              <div className='text-xs text-green-600'>Employee pays per session</div>
            </div>
          </div>

          {employeeCount > 0 && sessionsPerEmployeePerYear > 0 && (
            <div className='bg-white rounded-lg p-3 border border-green-200'>
              <div className='text-center'>
                <div className='text-xl font-bold text-green-700 mb-1'>
                  ${calculatedSessionBudget.toLocaleString()}
                </div>
                <div className='text-sm text-green-600 mb-2'>
                  Total pool size (if everyone uses max {sessionsPerEmployeePerYear} sessions)
                </div>
                <div className='text-xs text-green-600'>
                  Remember: You only pay when sessions are actually booked!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
