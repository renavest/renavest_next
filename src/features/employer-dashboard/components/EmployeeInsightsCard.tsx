import { PieChart, TrendingUp } from 'lucide-react';

// Simplified financial stress insights
const financialStressInsights = [
  {
    theme: 'Down Payment Anxiety',
    percentage: 30,
    department: 'Sales',
    action: 'Financial Workshop',
    icon: TrendingUp,
    color: '#6366f1', // indigo
    bgColor: '#e0e7ff', // light indigo
  },
];

export default function EmployeeInsightsCard() {
  const insight = financialStressInsights[0];

  return (
    <div className='bg-white rounded-xl p-4 w-full h-full flex flex-col border border-gray-200 shadow-sm'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
          <PieChart size={20} />
        </div>
        <div>
          <p className='font-semibold text-gray-800'>Financial Stress Themes</p>
          <p className='text-sm text-gray-500'>Top Employee Concerns</p>
        </div>
      </div>

      <div className='flex-grow flex items-center'>
        <div className='bg-gray-50 rounded-lg shadow-sm p-4 w-full border border-gray-200'>
          <div className='flex items-center mb-4'>
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center mr-4'
              style={{
                backgroundColor: insight.bgColor,
                color: insight.color,
              }}
            >
              <insight.icon className='w-6 h-6' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Primary Concern</p>
              <h3 className='text-lg font-bold text-gray-800'>{insight.theme}</h3>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <p className='text-xs text-gray-500'>Impact Percentage</p>
              <p className='text-xl font-bold' style={{ color: insight.color }}>
                {insight.percentage}%
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500'>Affected Department</p>
              <p className='text-md font-semibold text-[#9071FF]'>{insight.department}</p>
            </div>
          </div>

          <div className='mt-4 border-t border-gray-200 pt-3'>
            <p className='text-xs text-gray-500'>Recommended Action</p>
            <p className='text-md font-semibold text-green-600'>{insight.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
