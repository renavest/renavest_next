'use client';

import { Coins, Users, Clock, Percent } from 'lucide-react';
import { useState } from 'react';

export interface PricingCalculatorProps {
  initialEmployeeCount?: number;
  initialSessionsPerYear?: number;
  initialSubsidyPercentage?: number;
  averageSessionCost?: number;
}

export default function PricingCalculator({
  initialEmployeeCount = 50,
  initialSessionsPerYear = 2,
  initialSubsidyPercentage = 75,
  averageSessionCost = 150,
}: PricingCalculatorProps) {
  const [employeeCount, setEmployeeCount] = useState(initialEmployeeCount);
  const [sessionsPerYear, setSessionsPerYear] = useState(initialSessionsPerYear);
  const [subsidyPercentage, setSubsidyPercentage] = useState(initialSubsidyPercentage);

  const calculateTotalCost = () => {
    const totalSessionCost = employeeCount * sessionsPerYear * averageSessionCost;
    const companyCost = totalSessionCost * (subsidyPercentage / 100);
    const employeeCost = totalSessionCost * ((100 - subsidyPercentage) / 100);

    return {
      totalSessionCost,
      companyCost,
      employeeCost,
    };
  };

  const { totalSessionCost, companyCost, employeeCost } = calculateTotalCost();

  const exampleScenarios = [
    {
      title: 'Small Team',
      employees: 25,
      sessions: 1,
      subsidyPercentage: 50,
      description:
        'Perfect for startups and small businesses looking to provide initial financial wellness support.',
    },
    {
      title: 'Growing Company',
      employees: 100,
      sessions: 2,
      subsidyPercentage: 75,
      description:
        'Ideal for mid-sized companies investing in comprehensive employee financial health.',
    },
    {
      title: 'Enterprise Solution',
      employees: 500,
      sessions: 4,
      subsidyPercentage: 90,
      description:
        'Comprehensive financial wellness program for large organizations committed to employee well-being.',
    },
  ];

  return (
    <div className='bg-purple-50 rounded-2xl p-8 shadow-lg'>
      <div className='grid md:grid-cols-3 gap-8'>
        {/* Inputs */}
        <div className='md:col-span-1 space-y-6'>
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

          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
            <div className='flex items-center mb-4'>
              <Clock className='w-6 h-6 text-blue-600 mr-3' />
              <label
                htmlFor='sessionsPerYear'
                className='block text-lg font-semibold text-gray-800'
              >
                Sessions per Employee per Year
              </label>
            </div>
            <input
              type='number'
              id='sessionsPerYear'
              value={sessionsPerYear || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setSessionsPerYear(value as number);
              }}
              min={1}
              max={12}
              className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
            />
            <p className='mt-2 text-sm text-gray-600'>
              Financial therapists recommend 5 sessions per year for comprehensive wellness. Adjust
              based on your team's specific needs and budget.
            </p>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
            <div className='flex items-center mb-4'>
              <Percent className='w-6 h-6 text-green-600 mr-3' />
              <label
                htmlFor='subsidyPercentage'
                className='block text-lg font-semibold text-gray-800'
              >
                Company Subsidy Percentage
              </label>
            </div>
            <input
              type='number'
              id='subsidyPercentage'
              value={subsidyPercentage || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setSubsidyPercentage(value as number);
              }}
              min={0}
              max={100}
              className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
            />
            <p className='mt-2 text-sm text-gray-600'>
              Adjust how much of the session cost your company will cover
            </p>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
            <div className='flex items-center mb-4'>
              <Coins className='w-6 h-6 text-yellow-600 mr-3' />
              <h3 className='text-lg font-semibold text-gray-800'>Pricing Details</h3>
            </div>
            <p className='text-sm text-gray-600 mb-2'>
              Average Session Cost: <span className='font-medium'>${averageSessionCost}</span>
            </p>
            <p className='text-sm text-gray-600'>
              Company Subsidy: <span className='font-medium'>{subsidyPercentage}%</span>
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className='md:col-span-2 bg-white rounded-lg p-6 shadow-md'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>Cost Breakdown</h2>

          <div className='grid md:grid-cols-3 gap-4'>
            <div className='bg-purple-50 p-4 rounded-lg'>
              <h3 className='text-lg font-semibold text-purple-800 mb-2'>Total Sessions</h3>
              <p className='text-3xl font-bold text-purple-600'>
                {employeeCount * sessionsPerYear}
              </p>
              <p className='text-sm text-gray-600'>
                {employeeCount} employees × {sessionsPerYear} sessions
              </p>
            </div>

            <div className='bg-blue-50 p-4 rounded-lg'>
              <h3 className='text-lg font-semibold text-blue-800 mb-2'>Total Cost</h3>
              <p className='text-3xl font-bold text-blue-600'>
                ${totalSessionCost.toLocaleString()}
              </p>
              <p className='text-sm text-gray-600'>${averageSessionCost} per session</p>
            </div>

            <div className='bg-green-50 p-4 rounded-lg'>
              <h3 className='text-lg font-semibold text-green-800 mb-2'>Company Investment</h3>
              <p className='text-3xl font-bold text-green-600'>${companyCost.toLocaleString()}</p>
              <p className='text-sm text-gray-600'>{subsidyPercentage}% of total cost</p>
            </div>
          </div>

          <div className='mt-6 bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>Employee Contribution</h3>
            <p className='text-gray-600'>
              Employees cover the remaining{' '}
              <span className='font-medium'>{100 - subsidyPercentage}%</span> of the session cost,
              making financial therapy accessible and affordable.
            </p>
            <p className='text-sm text-gray-500 mt-2'>
              Total Employee Cost:{' '}
              <span className='font-medium'>${employeeCost.toLocaleString()}</span>
            </p>
          </div>

          {/* Additional Insights */}
          <div className='mt-6 bg-purple-50 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold text-purple-800 mb-3 flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 mr-3 text-purple-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Financial Wellness Impact
            </h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='bg-white p-4 rounded-lg shadow-sm border border-purple-100'>
                <div className='flex items-center mb-2'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2 text-green-600'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <h4 className='text-sm font-semibold text-gray-800'>Potential ROI</h4>
                </div>
                <p className='text-xs text-gray-600'>
                  Companies see an average of{' '}
                  <span className='font-medium text-green-700'>$4-$6</span>
                  return for every $1 invested in financial wellness.
                </p>
              </div>
              <div className='bg-white p-4 rounded-lg shadow-sm border border-purple-100'>
                <div className='flex items-center mb-2'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 mr-2 text-blue-600'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <h4 className='text-sm font-semibold text-gray-800'>Employee Retention</h4>
                </div>
                <p className='text-xs text-gray-600'>
                  Financial wellness programs can improve employee productivity by up to{' '}
                  <span className='font-medium text-blue-700'>34%</span>.
                </p>
              </div>
            </div>
            <div className='mt-4 bg-purple-100 p-3 rounded-lg'>
              <p className='text-xs text-gray-700 text-center'>
                <span className='font-semibold'>Note:</span> These insights are based on industry
                research and may vary by organization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Scenarios */}
      <div className='mt-16'>
        <h2 className='text-3xl font-bold text-center mb-12'>Example Scenarios</h2>
        <div className='grid md:grid-cols-3 gap-8'>
          {exampleScenarios.map((scenario) => (
            <div
              key={scenario.title}
              className='bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow'
            >
              <h3 className='text-xl font-semibold text-gray-800 mb-4'>{scenario.title}</h3>
              <div className='mb-4'>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-800'>{scenario.employees}</span> Employees
                </p>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-800'>{scenario.sessions}</span> Sessions
                  per Employee
                </p>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-800'>{scenario.subsidyPercentage}%</span>{' '}
                  Company Subsidy
                </p>
              </div>
              <p className='text-sm text-gray-600 mb-4'>{scenario.description}</p>
              <button
                onClick={() => {
                  setEmployeeCount(scenario.employees);
                  setSessionsPerYear(scenario.sessions);
                  setSubsidyPercentage(scenario.subsidyPercentage);
                }}
                className='w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors'
              >
                Calculate This Scenario
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
