'use client';

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
    <div className='bg-purple-50 rounded-2xl p-8 shadow-lg'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
          Financial Therapy Pricing Calculator
        </h2>
        <p className='text-gray-600 max-w-3xl mx-auto'>
          Explore our flexible pooled session model. Allocate a budget pool for session credits, add
          optional subscription features, and only pay for sessions actually used. Free trial
          included to boost employee engagement.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className='flex justify-center items-center mb-6'>
        <span
          className={`mr-4 ${billingCycle === 'monthly' ? 'font-bold text-purple-700' : 'text-gray-500'}`}
        >
          Monthly View
        </span>
        <div
          className='w-14 h-7 bg-purple-200 rounded-full relative cursor-pointer'
          onClick={toggleBillingCycle}
        >
          <div
            className={`w-7 h-7 bg-purple-600 rounded-full absolute top-0 transition-all duration-300 
              ${billingCycle === 'yearly' ? 'right-0' : 'right-7'}`}
          />
        </div>
        <span
          className={`ml-4 ${billingCycle === 'yearly' ? 'font-bold text-purple-700' : 'text-gray-500'}`}
        >
          Annual View
        </span>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Input Configuration */}
        <div className='lg:col-span-1'>
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

        {/* Pricing Summary */}
        <div className='lg:col-span-2'>
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
