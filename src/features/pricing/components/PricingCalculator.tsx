'use client';

import { Heart, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import PooledExampleScenarios from './PooledExampleScenarios';
import PooledPricingSummary from './PooledPricingSummary';
import PooledSessionInputs from './PooledSessionInputs';

interface PricingCalculatorProps {
  initialEmployeeCount?: number;
  initialTotalBudget?: number;
  initialSessionsPerEmployeePerYear?: number;
  initialAverageSessionCost?: number;
  initialIncludeSubscription?: boolean;
  initialSubscriptionSubsidyPercentage?: number;
  initialSessionSubsidyPercentage?: number;
}

export default function PricingCalculator({
  initialEmployeeCount = 50,
  initialTotalBudget = 15000,
  initialSessionsPerEmployeePerYear = 3,
  initialAverageSessionCost = 150,
  initialIncludeSubscription = true,
  initialSubscriptionSubsidyPercentage = 100,
  initialSessionSubsidyPercentage = 80,
}: PricingCalculatorProps) {
  const [employeeCount, setEmployeeCount] = useState(initialEmployeeCount);
  const [totalBudget, setTotalBudget] = useState(initialTotalBudget);
  const [sessionsPerEmployeePerYear, setSessionsPerEmployeePerYear] = useState(
    initialSessionsPerEmployeePerYear,
  );
  const [averageSessionCost, setAverageSessionCost] = useState(initialAverageSessionCost);
  const [includeSubscription, setIncludeSubscription] = useState(initialIncludeSubscription);
  const [subscriptionSubsidyPercentage, setSubscriptionSubsidyPercentage] = useState(
    initialSubscriptionSubsidyPercentage,
  );
  const [sessionSubsidyPercentage, setSessionSubsidyPercentage] = useState(
    initialSessionSubsidyPercentage,
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const fixedMonthlySubscriptionCost = 10;

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <div className='bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-3xl p-8 shadow-xl'>
      {/* Emotional Header */}
      <div className='text-center mb-10'>
        <div className='flex justify-center items-center mb-4'>
          <Heart className='w-8 h-8 text-red-500 mr-3' />
          <h2 className='text-4xl font-bold text-gray-900'>
            Invest in Your Team's Financial Wellness
          </h2>
          <Heart className='w-8 h-8 text-red-500 ml-3' />
        </div>
        <p className='text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed'>
          Help your employees reduce financial stress, improve focus at work, and build a more
          productive, engaged workforce. Our flexible model lets you start small and grow your
          impact.
        </p>

        {/* Key Benefits Preview */}
        <div className='flex flex-wrap justify-center gap-6 mt-6'>
          <div className='flex items-center bg-white px-4 py-2 rounded-full shadow-md'>
            <Shield className='w-5 h-5 text-green-600 mr-2' />
            <span className='text-sm font-medium text-gray-700'>
              Risk-Free: Pay Only for Sessions Used
            </span>
          </div>
          <div className='flex items-center bg-white px-4 py-2 rounded-full shadow-md'>
            <TrendingUp className='w-5 h-5 text-blue-600 mr-2' />
            <span className='text-sm font-medium text-gray-700'>34% Productivity Increase</span>
          </div>
          <div className='flex items-center bg-white px-4 py-2 rounded-full shadow-md'>
            <Heart className='w-5 h-5 text-red-500 mr-2' />
            <span className='text-sm font-medium text-gray-700'>Free Trial Included</span>
          </div>
        </div>
      </div>

      {/* Pricing Model Clarification */}
      <div className='bg-white rounded-2xl p-6 mb-8 shadow-lg border border-blue-100'>
        <h3 className='text-xl font-semibold text-blue-800 mb-4 text-center'>
          💡 Our Simple, Risk-Free Pricing Model
        </h3>
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
            <h4 className='font-semibold text-blue-800 mb-2'>
              💰 Fixed Monthly Subscription ($10/employee)
            </h4>
            <p className='text-sm text-blue-700 mb-2'>
              <strong>Your only guaranteed monthly cost</strong>
            </p>
            <ul className='text-sm text-blue-700 space-y-1'>
              <li>• FREE 20-minute consultation</li>
              <li>• 24/7 messaging with therapist</li>
              <li>• Access to financial resources</li>
              <li>• Ongoing check-ins and support</li>
            </ul>
          </div>
          <div className='bg-green-50 rounded-xl p-4 border border-green-200'>
            <h4 className='font-semibold text-green-800 mb-2'>
              🎯 Session Pool (Pay-as-you-go only)
            </h4>
            <p className='text-sm text-green-700 mb-2'>
              <strong>Zero risk - only charged when sessions are booked</strong>
            </p>
            <ul className='text-sm text-green-700 space-y-1'>
              <li>• Full 1-hour therapy sessions (~$150)</li>
              <li>• You choose subsidy percentage</li>
              <li>• Employees pay remainder</li>
              <li>• Budget pool for planning only</li>
            </ul>
          </div>
        </div>
        <p className='text-center text-gray-600 mt-4 text-sm'>
          ✨ <strong>Total Predictability:</strong> Only subscription is charged monthly -
          everything else is pay-per-use
        </p>
      </div>

      {/* Step-by-Step Guidance */}
      <div className='bg-white rounded-2xl p-6 mb-8 shadow-lg border border-purple-100'>
        <h3 className='text-xl font-semibold text-purple-800 mb-4 text-center'>
          🎯 Three Simple Steps to Get Started
        </h3>
        <div className='grid md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-purple-600 font-bold text-lg'>1</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-2'>Team Size</h4>
            <p className='text-sm text-gray-600'>Tell us how many employees you want to support</p>
          </div>
          <div className='text-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-blue-600 font-bold text-lg'>2</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-2'>Subscription Level</h4>
            <p className='text-sm text-gray-600'>Choose monthly support and subsidy percentage</p>
          </div>
          <div className='text-center'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-green-600 font-bold text-lg'>3</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-2'>Session Pool Planning</h4>
            <p className='text-sm text-gray-600'>
              Set session subsidy percentage and see pool size
            </p>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle with Better Context */}
      <div className='flex justify-center items-center mb-8'>
        <div className='bg-white rounded-xl p-4 shadow-md border border-gray-100'>
          <p className='text-sm text-gray-600 text-center mb-3'>
            View your investment breakdown by:
          </p>
          <div className='flex items-center'>
            <span
              className={`mr-4 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-purple-100 font-bold text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </span>
            <div
              className='w-14 h-7 bg-purple-200 rounded-full relative cursor-pointer'
              onClick={toggleBillingCycle}
            >
              <div
                className={`w-7 h-7 bg-purple-600 rounded-full absolute top-0 transition-all duration-300 shadow-sm
                  ${billingCycle === 'yearly' ? 'right-0' : 'right-7'}`}
              />
            </div>
            <span
              className={`ml-4 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-purple-100 font-bold text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Annual
            </span>
          </div>
        </div>
      </div>

      <div className='grid xl:grid-cols-3 gap-8'>
        {/* Input Configuration */}
        <div className='xl:col-span-1'>
          <div className='bg-white rounded-2xl p-6 shadow-lg border border-purple-100'>
            <h3 className='text-xl font-semibold text-purple-800 mb-6 text-center'>
              📊 Configure Your Program
            </h3>
            <PooledSessionInputs
              employeeCount={employeeCount}
              sessionsPerEmployeePerYear={sessionsPerEmployeePerYear}
              averageSessionCost={averageSessionCost}
              includeSubscription={includeSubscription}
              subscriptionSubsidyPercentage={subscriptionSubsidyPercentage}
              sessionSubsidyPercentage={sessionSubsidyPercentage}
              setEmployeeCount={setEmployeeCount}
              setTotalBudget={setTotalBudget}
              setSessionsPerEmployeePerYear={setSessionsPerEmployeePerYear}
              setAverageSessionCost={setAverageSessionCost}
              setIncludeSubscription={setIncludeSubscription}
              setSubscriptionSubsidyPercentage={setSubscriptionSubsidyPercentage}
              setSessionSubsidyPercentage={setSessionSubsidyPercentage}
            />
          </div>
        </div>

        {/* Pricing Summary */}
        <div className='xl:col-span-2'>
          <div className='bg-white rounded-2xl p-6 shadow-lg border border-green-100'>
            <h3 className='text-xl font-semibold text-green-800 mb-6 text-center'>
              💰 Your Investment & Employee Impact
            </h3>
            <PooledPricingSummary
              billingCycle={billingCycle}
              employeeCount={employeeCount}
              totalBudget={totalBudget}
              sessionsPerEmployeePerYear={sessionsPerEmployeePerYear}
              averageSessionCost={averageSessionCost}
              includeSubscription={includeSubscription}
              monthlySubscriptionCost={fixedMonthlySubscriptionCost}
              subscriptionSubsidyPercentage={subscriptionSubsidyPercentage}
              sessionSubsidyPercentage={sessionSubsidyPercentage}
            />
          </div>
        </div>
      </div>

      {/* Example Scenarios */}
      <PooledExampleScenarios
        setEmployeeCount={setEmployeeCount}
        setTotalBudget={setTotalBudget}
        setSessionsPerEmployeePerYear={setSessionsPerEmployeePerYear}
        setIncludeSubscription={setIncludeSubscription}
        setSubscriptionSubsidyPercentage={setSubscriptionSubsidyPercentage}
        setSessionSubsidyPercentage={setSessionSubsidyPercentage}
      />
    </div>
  );
}
