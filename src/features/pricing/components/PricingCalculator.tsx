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
  initialMonthlySubscriptionCost?: number;
}

export default function PricingCalculator({
  initialEmployeeCount = 50,
  initialTotalBudget = 15000,
  initialSessionsPerEmployeePerYear = 3,
  initialAverageSessionCost = 150,
  initialIncludeSubscription = false,
  initialMonthlySubscriptionCost = 12,
}: PricingCalculatorProps) {
  const [employeeCount, setEmployeeCount] = useState(initialEmployeeCount);
  const [totalBudget, setTotalBudget] = useState(initialTotalBudget);
  const [sessionsPerEmployeePerYear, setSessionsPerEmployeePerYear] = useState(
    initialSessionsPerEmployeePerYear,
  );
  const [averageSessionCost, setAverageSessionCost] = useState(initialAverageSessionCost);
  const [includeSubscription, setIncludeSubscription] = useState(initialIncludeSubscription);
  const [monthlySubscriptionCost, setMonthlySubscriptionCost] = useState(
    initialMonthlySubscriptionCost,
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

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

      {/* Step-by-Step Guidance */}
      <div className='bg-white rounded-2xl p-6 mb-8 shadow-lg border border-purple-100'>
        <h3 className='text-xl font-semibold text-purple-800 mb-4 text-center'>
          🎯 Three Simple Steps to Get Started
        </h3>
        <div className='grid md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-purple-600 font-bold text-lg'>1</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-2'>Set Your Budget</h4>
            <p className='text-sm text-gray-600'>
              Allocate a comfortable annual budget for financial therapy sessions
            </p>
          </div>
          <div className='text-center'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-blue-600 font-bold text-lg'>2</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-2'>Choose Your Support Level</h4>
            <p className='text-sm text-gray-600'>
              Add optional messaging & content access for ongoing support
            </p>
          </div>
          <div className='text-center'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-green-600 font-bold text-lg'>3</span>
            </div>
            <h4 className='font-semibold text-gray-800 mb-2'>See Your Impact</h4>
            <p className='text-sm text-gray-600'>
              Understand exactly how your investment helps your team
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
              totalBudget={totalBudget}
              sessionsPerEmployeePerYear={sessionsPerEmployeePerYear}
              averageSessionCost={averageSessionCost}
              includeSubscription={includeSubscription}
              monthlySubscriptionCost={monthlySubscriptionCost}
              setEmployeeCount={setEmployeeCount}
              setTotalBudget={setTotalBudget}
              setSessionsPerEmployeePerYear={setSessionsPerEmployeePerYear}
              setAverageSessionCost={setAverageSessionCost}
              setIncludeSubscription={setIncludeSubscription}
              setMonthlySubscriptionCost={setMonthlySubscriptionCost}
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
              monthlySubscriptionCost={monthlySubscriptionCost}
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
        setMonthlySubscriptionCost={setMonthlySubscriptionCost}
      />
    </div>
  );
}
