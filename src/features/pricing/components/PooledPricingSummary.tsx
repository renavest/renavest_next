'use client';

import { Calculator, CreditCard, Users, TrendingUp, Heart, Shield } from 'lucide-react';

interface PooledPricingSummaryProps {
  billingCycle: 'monthly' | 'yearly';
  employeeCount: number;
  totalBudget: number;
  sessionsPerEmployeePerYear: number;
  averageSessionCost: number;
  includeSubscription: boolean;
  monthlySubscriptionCost: number;
  subscriptionSubsidyPercentage: number;
  sessionSubsidyPercentage: number;
}

export default function PooledPricingSummary({
  billingCycle,
  employeeCount,
  totalBudget,
  sessionsPerEmployeePerYear,
  averageSessionCost,
  includeSubscription,
  monthlySubscriptionCost,
  subscriptionSubsidyPercentage,
  sessionSubsidyPercentage,
}: PooledPricingSummaryProps) {
  // Calculate session pool metrics
  const maxPossibleSessions = employeeCount * sessionsPerEmployeePerYear;
  const maxSessionBudgetNeeded = maxPossibleSessions * averageSessionCost;
  const sessionCreditsFromBudget = Math.floor(totalBudget / averageSessionCost);
  const budgetUtilization = Math.min((maxSessionBudgetNeeded / totalBudget) * 100, 100);

  // Calculate subscription costs (what company actually pays)
  const companySubscriptionCostPerEmployee = includeSubscription
    ? (monthlySubscriptionCost * subscriptionSubsidyPercentage) / 100
    : 0;
  const employeeSubscriptionCostPerEmployee = includeSubscription
    ? monthlySubscriptionCost - companySubscriptionCostPerEmployee
    : 0;

  const annualCompanySubscriptionCost = companySubscriptionCostPerEmployee * employeeCount * 12;
  const monthlyCompanySubscriptionTotal = companySubscriptionCostPerEmployee * employeeCount;

  // Calculate session costs (what company subsidizes)
  const companySessionCostPerSession = (averageSessionCost * sessionSubsidyPercentage) / 100;
  const employeeSessionCostPerSession = averageSessionCost - companySessionCostPerSession;

  // Total costs (company pays)
  const totalAnnualCost = totalBudget + annualCompanySubscriptionCost;
  const totalMonthlyCost = totalBudget / 12 + monthlyCompanySubscriptionTotal;

  const currentTotal = billingCycle === 'monthly' ? totalMonthlyCost : totalAnnualCost;
  const currentSessionBudget = billingCycle === 'monthly' ? totalBudget / 12 : totalBudget;
  const currentSubscriptionCost =
    billingCycle === 'monthly' ? monthlyCompanySubscriptionTotal : annualCompanySubscriptionCost;

  // Calculate per-employee costs
  const costPerEmployee = employeeCount > 0 ? currentTotal / employeeCount : 0;
  const sessionBudgetPerEmployee = employeeCount > 0 ? currentSessionBudget / employeeCount : 0;

  return (
    <div className='space-y-6'>
      {/* Hero Investment Card */}
      <div className='bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 text-center border border-purple-200 shadow-lg'>
        <div className='flex items-center justify-center mb-4'>
          <Heart className='w-8 h-8 text-purple-600 mr-3' />
          <h2 className='text-2xl font-bold text-purple-800'>
            Your {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Investment in Employee
            Wellbeing
          </h2>
          <Heart className='w-8 h-8 text-purple-600 ml-3' />
        </div>
        <div className='text-5xl font-bold text-purple-600 mb-3'>
          ${currentTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <p className='text-lg text-purple-700 mb-4'>
          Supporting {employeeCount.toLocaleString()} employees
        </p>
        <div className='flex justify-center space-x-8'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              ${costPerEmployee.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className='text-sm text-purple-700'>
              per employee/{billingCycle === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {Math.floor(
                billingCycle === 'monthly'
                  ? sessionCreditsFromBudget / 12
                  : sessionCreditsFromBudget,
              ).toLocaleString()}
            </div>
            <div className='text-sm text-purple-700'>{billingCycle} session credits</div>
          </div>
        </div>
      </div>

      {/* Company vs Employee Cost Breakdown */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
        <h3 className='text-lg font-semibold text-blue-800 mb-4 text-center'>
          💰 Cost Sharing Breakdown
        </h3>
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Subscription Costs */}
          {includeSubscription && (
            <div className='bg-white rounded-lg p-4 border border-blue-200'>
              <h4 className='font-semibold text-blue-800 mb-3'>Monthly Subscription</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Company pays per employee:</span>
                  <span className='font-bold text-blue-700'>
                    ${companySubscriptionCostPerEmployee.toFixed(2)}/month
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Employee pays per month:</span>
                  <span className='font-bold text-gray-700'>
                    ${employeeSubscriptionCostPerEmployee.toFixed(2)}/month
                  </span>
                </div>
                <div className='border-t pt-2 mt-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Total company cost:</span>
                    <span className='font-bold text-blue-700'>
                      ${currentSubscriptionCost.toLocaleString()}/
                      {billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Costs */}
          <div className='bg-white rounded-lg p-4 border border-green-200'>
            <h4 className='font-semibold text-green-800 mb-3'>Per Session Costs</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Company subsidy per session:</span>
                <span className='font-bold text-green-700'>
                  ${companySessionCostPerSession.toFixed(2)} ({sessionSubsidyPercentage}%)
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Employee pays per session:</span>
                <span className='font-bold text-gray-700'>
                  ${employeeSessionCostPerSession.toFixed(2)} ({100 - sessionSubsidyPercentage}%)
                </span>
              </div>
              <div className='border-t pt-2 mt-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Session budget pool:</span>
                  <span className='font-bold text-green-700'>
                    ${currentSessionBudget.toLocaleString()}/
                    {billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Cost Breakdown */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Session Credits */}
        <div className='bg-white rounded-xl p-6 border border-blue-200 shadow-md'>
          <div className='flex items-center mb-4'>
            <CreditCard className='w-6 h-6 text-blue-600 mr-3' />
            <h3 className='text-lg font-semibold text-blue-800'>Session Credit Pool</h3>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              ${currentSessionBudget.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className='text-blue-700 font-medium mb-3'>
              {Math.floor(
                billingCycle === 'monthly'
                  ? sessionCreditsFromBudget / 12
                  : sessionCreditsFromBudget,
              ).toLocaleString()}{' '}
              session credits available
            </p>
            <div className='bg-blue-50 rounded-lg p-3'>
              <p className='text-sm text-blue-700'>
                <span className='font-semibold'>${sessionBudgetPerEmployee.toFixed(0)}</span> per
                employee
                <span className='block text-xs mt-1'>Only charged when sessions are booked</span>
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Support */}
        <div className='bg-white rounded-xl p-6 border border-indigo-200 shadow-md'>
          <div className='flex items-center mb-4'>
            <Users className='w-6 h-6 text-indigo-600 mr-3' />
            <h3 className='text-lg font-semibold text-indigo-800'>
              {includeSubscription ? 'Ongoing Support' : 'Optional: Ongoing Support'}
            </h3>
          </div>
          {includeSubscription ? (
            <div className='text-center'>
              <div className='text-3xl font-bold text-indigo-600 mb-2'>
                ${currentSubscriptionCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className='text-indigo-700 font-medium mb-3'>24/7 messaging & content access</p>
              <div className='bg-indigo-50 rounded-lg p-3'>
                <p className='text-sm text-indigo-700'>
                  <span className='font-semibold'>
                    ${companySubscriptionCostPerEmployee.toFixed(2)}/month
                  </span>{' '}
                  per employee (company pays)
                  <span className='block text-xs mt-1'>Ongoing engagement between sessions</span>
                </p>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='text-2xl font-bold text-gray-400 mb-2'>$0</div>
              <p className='text-gray-500 mb-4'>Not included</p>
              <button
                onClick={() => {
                  /* This would be handled by parent component */
                }}
                className='text-indigo-600 hover:text-indigo-800 font-medium text-sm'
              >
                Consider adding for better engagement →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Employee Impact Story */}
      <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200'>
        <div className='text-center mb-6'>
          <div className='flex items-center justify-center mb-3'>
            <TrendingUp className='w-7 h-7 text-green-600 mr-3' />
            <h3 className='text-xl font-semibold text-green-800'>
              What This Means for Your Employees
            </h3>
          </div>
          <p className='text-green-700'>Here's the real impact of your investment:</p>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          <div className='text-center bg-white rounded-lg p-4 border border-green-200'>
            <div className='text-3xl font-bold text-green-600 mb-2'>
              {sessionsPerEmployeePerYear}
            </div>
            <div className='text-sm font-medium text-green-800'>Max Sessions/Year</div>
            <div className='text-xs text-green-700 mt-1'>
              Professional financial therapy when they need it
            </div>
          </div>

          <div className='text-center bg-white rounded-lg p-4 border border-green-200'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              ${employeeSessionCostPerSession.toFixed(0)}
            </div>
            <div className='text-sm font-medium text-green-800'>Employee Pays Per Session</div>
            <div className='text-xs text-green-700 mt-1'>
              Affordable access with company subsidy
            </div>
          </div>

          <div className='text-center bg-white rounded-lg p-4 border border-green-200'>
            <div className='text-3xl font-bold text-purple-600 mb-2'>24/7</div>
            <div className='text-sm font-medium text-green-800'>Peace of Mind</div>
            <div className='text-xs text-green-700 mt-1'>
              Know help is available when stress hits
            </div>
          </div>
        </div>
      </div>

      {/* Budget Safety & Efficiency */}
      <div className='bg-yellow-50 rounded-xl p-6 border border-yellow-200'>
        <div className='flex items-center mb-4'>
          <Shield className='w-6 h-6 text-yellow-600 mr-3' />
          <h3 className='text-lg font-semibold text-yellow-800'>Your Budget Protection</h3>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-semibold text-yellow-800 mb-2'>Pay-As-You-Go Safety</h4>
            <p className='text-sm text-yellow-700 mb-3'>
              Your session budget:{' '}
              <span className='font-bold'>${totalBudget.toLocaleString()}</span>
            </p>
            <p className='text-sm text-yellow-700 mb-3'>
              If everyone used all sessions:{' '}
              <span className='font-bold'>
                ${(maxPossibleSessions * companySessionCostPerSession).toLocaleString()}
              </span>
            </p>
            <div className='w-full bg-yellow-200 rounded-full h-3 mb-2'>
              <div
                className='bg-yellow-500 h-3 rounded-full transition-all duration-500'
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
            <p className='text-xs text-yellow-700'>
              Budget efficiency: {budgetUtilization.toFixed(1)}% if fully utilized
            </p>
          </div>

          <div>
            <h4 className='font-semibold text-yellow-800 mb-2'>Typical Usage Reality</h4>
            <div className='space-y-2 text-sm text-yellow-700'>
              <p>📊 Most companies see 30-50% utilization in year 1</p>
              <p>📈 Usage grows to 60-80% as awareness increases</p>
              <p>💡 Free trial significantly boosts engagement</p>
              <p>🎯 High-stress periods see usage spikes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI & Value Proposition */}
      <div className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200'>
        <h3 className='text-xl font-semibold text-purple-800 mb-4 text-center'>
          💰 Return on Your Investment
        </h3>
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-semibold text-purple-800 mb-3'>Quantifiable Benefits</h4>
            <ul className='space-y-2 text-sm text-purple-700'>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-purple-500 rounded-full mr-3'></span>
                <span>
                  <strong>34% productivity increase</strong> - less financial stress means more
                  focus
                </span>
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-purple-500 rounded-full mr-3'></span>
                <span>
                  <strong>22% reduction in absenteeism</strong> - better mental health = better
                  attendance
                </span>
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-purple-500 rounded-full mr-3'></span>
                <span>
                  <strong>13% lower turnover</strong> - employees feel supported and valued
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold text-purple-800 mb-3'>Intangible Value</h4>
            <ul className='space-y-2 text-sm text-purple-700'>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                <span>Enhanced employer brand & recruiting advantage</span>
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                <span>Improved team morale and workplace culture</span>
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                <span>Reduced manager burden dealing with stressed employees</span>
              </li>
              <li className='flex items-center'>
                <span className='w-2 h-2 bg-pink-500 rounded-full mr-3'></span>
                <span>Demonstration of genuine care for employee wellbeing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
