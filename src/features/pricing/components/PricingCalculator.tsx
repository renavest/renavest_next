'use client';

import { Coins, Users, Clock, Percent, Activity } from 'lucide-react';
import { useState, useMemo } from 'react';

import PricingSummaryCards from './PricingSummaryCards';

interface PricingCalculatorProps {
  initialEmployeeCount?: number;
  initialSessionsPerYear?: number;
  initialSubsidyPercentage?: number;
  initialUtilizationRate?: number;
  initialAverageSessionCost?: number;
}

interface ExampleScenario {
  title: string;
  employees: number;
  sessions: number;
  subsidyPercentage: number;
  description: string;
}

export default function PricingCalculator({
  initialEmployeeCount = 50,
  initialSessionsPerYear = 2,
  initialSubsidyPercentage = 75,
  initialUtilizationRate = 50,
  initialAverageSessionCost = 150,
}: PricingCalculatorProps) {
  const [employeeCount, setEmployeeCount] = useState(initialEmployeeCount);
  const [sessionsPerYear, setSessionsPerYear] = useState(initialSessionsPerYear);
  const [subsidyPercentage, setSubsidyPercentage] = useState(initialSubsidyPercentage);
  const [utilizationRate, setUtilizationRate] = useState(initialUtilizationRate);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [averageSessionCost, setAverageSessionCost] = useState(initialAverageSessionCost);

  const calculatePricing = useMemo(() => {
    // Utilization-based calculations
    const totalUtilizedSessions = employeeCount * sessionsPerYear * (utilizationRate / 100);
    const totalSessionCost = totalUtilizedSessions * averageSessionCost;
    const employerCost = totalSessionCost * (subsidyPercentage / 100);
    const employeeCost = totalSessionCost * ((100 - subsidyPercentage) / 100);
    const perEmployeeUtilizedSessions = sessionsPerYear * (utilizationRate / 100);

    // Max possible per-employee cost (if fully utilized)
    const maxPerEmployeeEmployerCost =
      sessionsPerYear * averageSessionCost * (subsidyPercentage / 100);
    const maxPerEmployeeEmployeeCost =
      sessionsPerYear * averageSessionCost * ((100 - subsidyPercentage) / 100);

    return {
      monthly: {
        totalUtilizedSessions: totalUtilizedSessions / 12,
        totalSessionCost: totalSessionCost / 12,
        employerCost: employerCost / 12,
        employeeCost: employeeCost / 12,
        maxPerEmployeeEmployerCost: maxPerEmployeeEmployerCost / 12,
        maxPerEmployeeEmployeeCost: maxPerEmployeeEmployeeCost / 12,
        perEmployeeUtilizedSessions: perEmployeeUtilizedSessions / 12,
      },
      yearly: {
        totalUtilizedSessions,
        totalSessionCost,
        employerCost,
        employeeCost,
        maxPerEmployeeEmployerCost,
        maxPerEmployeeEmployeeCost,
        perEmployeeUtilizedSessions,
      },
    };
  }, [employeeCount, sessionsPerYear, averageSessionCost, subsidyPercentage, utilizationRate]);

  const currentPricing = calculatePricing[billingCycle];

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  const exampleScenarios: ExampleScenario[] = [
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
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
          Financial Therapy Pricing Calculator
        </h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Understand the cost of providing comprehensive financial wellness support for each
          individual employee in your organization.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className='flex justify-center items-center mb-6'>
        <span
          className={`mr-4 ${billingCycle === 'monthly' ? 'font-bold text-purple-700' : 'text-gray-500'}`}
        >
          Monthly
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
          Yearly
        </span>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        {/* Inputs Column */}
        <div className='md:col-span-1 space-y-6'>
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

          {/* Sessions per Year Input */}
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
              Financial therapists recommend 5 sessions per year for comprehensive wellness.
            </p>
          </div>

          {/* Utilization Rate Input */}
          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
            <div className='flex items-center mb-4'>
              <Activity className='w-6 h-6 text-green-600 mr-3' />
              <label
                htmlFor='utilizationRate'
                className='block text-lg font-semibold text-gray-800'
              >
                Program Utilization Rate
              </label>
            </div>
            <input
              type='number'
              id='utilizationRate'
              value={utilizationRate || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setUtilizationRate(value as number);
              }}
              min={0}
              max={100}
              className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg'
            />
            <p className='mt-2 text-sm text-gray-600'>
              Percentage of employees expected to use financial therapy sessions
            </p>
          </div>

          {/* Subsidy Percentage Input */}
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

          {/* Average Session Cost */}
          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-100'>
            <div className='flex items-center mb-4'>
              <Coins className='w-6 h-6 text-yellow-600 mr-3' />
              <label
                htmlFor='averageSessionCost'
                className='block text-lg font-semibold text-gray-800'
              >
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
              Cost per financial therapy session used in calculations
            </p>
          </div>
        </div>

        {/* Cost Breakdown and Insights Column */}
        <div className='md:col-span-2 space-y-6'>
          <PricingSummaryCards
            billingCycle={billingCycle}
            currentPricing={currentPricing}
            sessionsPerYear={sessionsPerYear}
          />
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
