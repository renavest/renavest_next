'use client';

interface ExampleScenario {
  title: string;
  employees: number;
  totalBudget: number;
  sessionsPerEmployee: number;
  includeSubscription: boolean;
  subscriptionSubsidyPercentage: number;
  sessionSubsidyPercentage: number;
  description: string;
  highlights: string[];
}

interface PooledExampleScenariosProps {
  setEmployeeCount: (value: number) => void;
  setTotalBudget: (value: number) => void;
  setSessionsPerEmployeePerYear: (value: number) => void;
  setIncludeSubscription: (value: boolean) => void;
  setSubscriptionSubsidyPercentage: (value: number) => void;
  setSessionSubsidyPercentage: (value: number) => void;
}

export default function PooledExampleScenarios({
  setEmployeeCount,
  setTotalBudget,
  setSessionsPerEmployeePerYear,
  setIncludeSubscription,
  setSubscriptionSubsidyPercentage,
  setSessionSubsidyPercentage,
}: PooledExampleScenariosProps) {
  const fixedSubscriptionCost = 10;

  const exampleScenarios: ExampleScenario[] = [
    {
      title: 'Starter Package',
      employees: 25,
      totalBudget: 7500,
      sessionsPerEmployee: 2,
      includeSubscription: false,
      subscriptionSubsidyPercentage: 0,
      sessionSubsidyPercentage: 50,
      description: 'Perfect for small teams starting their financial wellness journey.',
      highlights: ['Pay-as-you-go sessions only', 'Free trial included', '50% session subsidy'],
    },
    {
      title: 'Growth Company',
      employees: 100,
      totalBudget: 25000,
      sessionsPerEmployee: 3,
      includeSubscription: true,
      subscriptionSubsidyPercentage: 100,
      sessionSubsidyPercentage: 75,
      description: 'Comprehensive support for growing teams with ongoing engagement.',
      highlights: [
        'Full subscription coverage ($10/month)',
        'Messaging & content access',
        '75% session subsidy',
      ],
    },
    {
      title: 'Enterprise Solution',
      employees: 500,
      totalBudget: 100000,
      sessionsPerEmployee: 4,
      includeSubscription: true,
      subscriptionSubsidyPercentage: 100,
      sessionSubsidyPercentage: 90,
      description: 'Full-scale financial wellness program for large organizations.',
      highlights: [
        'Comprehensive coverage',
        'Premium subscription features ($10/month)',
        '90% session subsidy',
      ],
    },
  ];

  const handleScenarioSelect = (scenario: ExampleScenario) => {
    setEmployeeCount(scenario.employees);
    setTotalBudget(scenario.totalBudget);
    setSessionsPerEmployeePerYear(scenario.sessionsPerEmployee);
    setIncludeSubscription(scenario.includeSubscription);
    setSubscriptionSubsidyPercentage(scenario.subscriptionSubsidyPercentage);
    setSessionSubsidyPercentage(scenario.sessionSubsidyPercentage);
  };

  return (
    <div className='mt-16'>
      <h2 className='text-3xl font-bold text-center mb-4'>Example Budget Scenarios</h2>
      <p className='text-center text-gray-600 mb-12 max-w-2xl mx-auto'>
        Explore how different budget allocations and subsidy options work for various company sizes.
        All scenarios use our fixed $10/month subscription model.
      </p>

      <div className='grid md:grid-cols-3 gap-8'>
        {exampleScenarios.map((scenario) => (
          <div
            key={scenario.title}
            className='bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer'
            onClick={() => handleScenarioSelect(scenario)}
          >
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>{scenario.title}</h3>

            {/* Key Metrics */}
            <div className='space-y-3 mb-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Employees:</span>
                <span className='font-medium text-gray-800'>
                  {scenario.employees.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Annual Session Pool:</span>
                <span className='font-medium text-gray-800'>
                  ${scenario.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Max Sessions/Employee:</span>
                <span className='font-medium text-gray-800'>{scenario.sessionsPerEmployee}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Subscription:</span>
                <span className='font-medium text-gray-800'>
                  {scenario.includeSubscription
                    ? `${scenario.subscriptionSubsidyPercentage}% covered`
                    : 'Not included'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Session Subsidy:</span>
                <span className='font-medium text-gray-800'>
                  {scenario.sessionSubsidyPercentage}%
                </span>
              </div>
            </div>

            {/* Description */}
            <p className='text-sm text-gray-600 mb-4'>{scenario.description}</p>

            {/* Highlights */}
            <div className='mb-4'>
              <h4 className='text-sm font-semibold text-gray-700 mb-2'>Key Features:</h4>
              <ul className='text-xs text-gray-600 space-y-1'>
                {scenario.highlights.map((highlight, index) => (
                  <li key={index} className='flex items-center'>
                    <span className='w-1.5 h-1.5 bg-purple-500 rounded-full mr-2'></span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <button className='w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium'>
              Calculate This Scenario
            </button>
          </div>
        ))}
      </div>

      {/* Custom Scenario Call-to-Action */}
      <div className='mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 text-center border border-purple-200'>
        <h3 className='text-xl font-semibold text-gray-800 mb-3'>Need a Custom Scenario?</h3>
        <p className='text-gray-600 mb-4 max-w-2xl mx-auto'>
          Every organization is unique. Use the calculator above to model your specific budget,
          employee count, and subsidy preferences. Our simple model has one fixed subscription cost
          ($10/month) and flexible session subsidies.
        </p>
        <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-700'>
          <span className='bg-white px-3 py-1 rounded-full shadow-sm'>
            💰 Fixed $10/month subscription
          </span>
          <span className='bg-white px-3 py-1 rounded-full shadow-sm'>
            🎯 Pay only for sessions used
          </span>
          <span className='bg-white px-3 py-1 rounded-full shadow-sm'>
            📈 Flexible subsidy percentages
          </span>
        </div>
      </div>
    </div>
  );
}
