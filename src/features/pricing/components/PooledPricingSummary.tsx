'use client';

import { Calculator, CreditCard, Users, TrendingUp } from 'lucide-react';

interface PooledPricingSummaryProps {
  billingCycle: 'monthly' | 'yearly';
  employeeCount: number;
  totalBudget: number;
  sessionsPerEmployeePerYear: number;
  averageSessionCost: number;
  includeSubscription: boolean;
  monthlySubscriptionCost: number;
}

export default function PooledPricingSummary({
  billingCycle,
  employeeCount,
  totalBudget,
  sessionsPerEmployeePerYear,
  averageSessionCost,
  includeSubscription,
  monthlySubscriptionCost,
}: PooledPricingSummaryProps) {
  // Calculate session pool metrics
  const maxPossibleSessions = employeeCount * sessionsPerEmployeePerYear;
  const maxSessionBudgetNeeded = maxPossibleSessions * averageSessionCost;
  const sessionCreditsFromBudget = Math.floor(totalBudget / averageSessionCost);
  const budgetUtilization = Math.min((maxSessionBudgetNeeded / totalBudget) * 100, 100);

  // Calculate subscription costs
  const annualSubscriptionCost = includeSubscription
    ? employeeCount * monthlySubscriptionCost * 12
    : 0;
  const monthlySubscriptionTotal = includeSubscription
    ? employeeCount * monthlySubscriptionCost
    : 0;

  // Total costs
  const totalAnnualCost = totalBudget + annualSubscriptionCost;
  const totalMonthlyCost = totalBudget / 12 + monthlySubscriptionTotal;

  const currentTotal = billingCycle === 'monthly' ? totalMonthlyCost : totalAnnualCost;
  const currentSessionBudget = billingCycle === 'monthly' ? totalBudget / 12 : totalBudget;
  const currentSubscriptionCost =
    billingCycle === 'monthly' ? monthlySubscriptionTotal : annualSubscriptionCost;

  return (
    <div className='space-y-6'>
      {/* Total Investment Overview */}
      <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
        <div className='flex items-center mb-4'>
          <Calculator className='w-6 h-6 text-purple-600 mr-3' />
          <h2 className='text-2xl font-bold text-gray-900'>
            Your {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Investment
          </h2>
        </div>
        <div className='text-4xl font-bold text-purple-600 mb-2'>
          ${currentTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <p className='text-gray-600'>
          Total {billingCycle} investment for {employeeCount.toLocaleString()} employees
        </p>
      </div>

      {/* Budget Breakdown */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Session Pool */}
        <div className='bg-blue-50 rounded-xl p-6 border border-blue-200'>
          <div className='flex items-center mb-4'>
            <CreditCard className='w-6 h-6 text-blue-600 mr-3' />
            <h3 className='text-lg font-semibold text-blue-800'>Session Credit Pool</h3>
          </div>
          <div className='space-y-3'>
            <div>
              <p className='text-2xl font-bold text-blue-600'>
                ${currentSessionBudget.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className='text-sm text-blue-700'>
                {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} session budget
              </p>
            </div>
            <div>
              <p className='text-lg font-semibold text-blue-600'>
                {Math.floor(
                  billingCycle === 'monthly'
                    ? sessionCreditsFromBudget / 12
                    : sessionCreditsFromBudget,
                ).toLocaleString()}{' '}
                credits
              </p>
              <p className='text-sm text-blue-700'>
                Available {billingCycle} session credits ({averageSessionCost}/session)
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Layer */}
        <div className='bg-indigo-50 rounded-xl p-6 border border-indigo-200'>
          <div className='flex items-center mb-4'>
            <Users className='w-6 h-6 text-indigo-600 mr-3' />
            <h3 className='text-lg font-semibold text-indigo-800'>
              {includeSubscription ? 'Subscription Layer' : 'Subscription Layer (Optional)'}
            </h3>
          </div>
          {includeSubscription ? (
            <div className='space-y-3'>
              <div>
                <p className='text-2xl font-bold text-indigo-600'>
                  $
                  {currentSubscriptionCost.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className='text-sm text-indigo-700'>
                  {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} subscription cost
                </p>
              </div>
              <div>
                <p className='text-lg font-semibold text-indigo-600'>
                  ${monthlySubscriptionCost}/employee/month
                </p>
                <p className='text-sm text-indigo-700'>Includes messaging, content & onboarding</p>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <p className='text-lg text-indigo-700'>Add ongoing support for your employees</p>
              <ul className='text-sm text-indigo-600 space-y-1'>
                <li>• Therapist messaging access</li>
                <li>• Educational content library</li>
                <li>• Onboarding & engagement tools</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Impact Metrics */}
      <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200'>
        <div className='flex items-center mb-4'>
          <TrendingUp className='w-6 h-6 text-green-600 mr-3' />
          <h3 className='text-xl font-semibold text-green-800'>Employee Impact & Benefits</h3>
        </div>
        <div className='grid md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-green-600'>
              {sessionsPerEmployeePerYear} sessions
            </p>
            <p className='text-sm text-green-700'>Max per employee per year</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-blue-600'>FREE</p>
            <p className='text-sm text-blue-700'>20-min consultation + messaging</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-purple-600'>40-60%</p>
            <p className='text-sm text-purple-700'>Higher engagement with free trial</p>
          </div>
        </div>
      </div>

      {/* Budget Efficiency */}
      <div className='bg-yellow-50 rounded-xl p-6 border border-yellow-200'>
        <h3 className='text-lg font-semibold text-yellow-800 mb-3'>Budget Efficiency</h3>
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-yellow-700'>Budget vs. Max Needed:</span>
            <span className='font-semibold text-yellow-800'>
              ${totalBudget.toLocaleString()} vs ${maxSessionBudgetNeeded.toLocaleString()}
            </span>
          </div>
          <div className='w-full bg-yellow-200 rounded-full h-3'>
            <div
              className='bg-yellow-500 h-3 rounded-full transition-all duration-500'
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
          <p className='text-sm text-yellow-700'>
            {budgetUtilization > 100
              ? 'Budget covers all possible sessions with room for growth'
              : `${budgetUtilization.toFixed(1)}% budget utilization if all employees use max sessions`}
          </p>
        </div>
      </div>

      {/* Value Proposition */}
      <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>What This Gets You</h3>
        <div className='grid md:grid-cols-2 gap-4'>
          <ul className='list-disc pl-5 text-sm text-gray-700 space-y-1'>
            <li>Pay-as-you-go session model (low risk)</li>
            <li>Licensed financial therapy for your team</li>
            <li>Free trial to boost engagement</li>
            <li>Confidential, personalized employee support</li>
          </ul>
          <ul className='list-disc pl-5 text-sm text-gray-700 space-y-1'>
            <li>Actionable, anonymized workforce insights</li>
            <li>Up to 34% productivity boost</li>
            <li>22% reduction in absenteeism</li>
            <li>13% lower employee turnover</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
