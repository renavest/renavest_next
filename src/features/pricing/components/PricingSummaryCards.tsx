import React from 'react';

interface PricingSummaryCardsProps {
  billingCycle: 'monthly' | 'yearly';
  currentPricing: {
    employerCost: number;
    maxPerEmployeeEmployerCost: number;
    maxPerEmployeeEmployeeCost: number;
  };
  sessionsPerYear: number;
}

const PricingSummaryCards: React.FC<PricingSummaryCardsProps> = ({
  billingCycle,
  currentPricing,
  sessionsPerYear,
}) => {
  return (
    <div className='bg-white rounded-lg p-6 shadow-md'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Your Renavest Investment</h2>
      <div className='grid md:grid-cols-2 gap-4'>
        {/* 1. Estimated Employer Investment */}
        <div className='bg-purple-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-purple-800 mb-2'>
            Estimated {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Employer Investment
          </h3>
          <p className='text-3xl font-bold text-purple-600'>
            ${currentPricing.employerCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className='text-sm text-gray-600'>
            Covers all eligible employees for {sessionsPerYear} sessions/year
          </p>
        </div>
        {/* 2. Cost Per Employee (Employer) */}
        <div className='bg-blue-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-blue-800 mb-2'>
            Cost Per Employee, Per {billingCycle === 'monthly' ? 'Month' : 'Year'} (Employer)
          </h3>
          <p className='text-3xl font-bold text-blue-600'>
            $
            {currentPricing.maxPerEmployeeEmployerCost.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-sm text-gray-600'>
            If all employees use their sessions. Actual cost may be lower with typical utilization.
          </p>
        </div>
        {/* 3. Cost Per Employee (Employee, after subsidy) */}
        <div className='bg-green-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-green-800 mb-2'>
            Cost Per Employee, Per {billingCycle === 'monthly' ? 'Month' : 'Year'} (Employee)
          </h3>
          <p className='text-3xl font-bold text-green-600'>
            $
            {currentPricing.maxPerEmployeeEmployeeCost.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
          <p className='text-sm text-gray-600'>
            What each employee pays per {billingCycle === 'monthly' ? 'month' : 'year'}, after your
            subsidy.
          </p>
        </div>
        {/* 4. What You Get (Value Prop) */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>What You Get</h3>
          <ul className='list-disc pl-5 text-sm text-gray-700'>
            <li>Licensed financial therapy for your team</li>
            <li>Confidential, personalized support</li>
            <li>Actionable, anonymized workforce insights</li>
            <li>
              Proven ROI: up to 34% productivity boost, 22% less absenteeism, 13% lower turnover
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PricingSummaryCards;
