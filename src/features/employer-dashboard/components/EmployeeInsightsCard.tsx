import { Heart, TrendingUp, Users, Target, AlertTriangle, Lightbulb } from 'lucide-react';

// Enhanced financial stress insights with more emotional appeal
const financialStressInsights = [
  {
    theme: 'Homeownership Dreams',
    percentage: 42,
    department: 'Engineering',
    urgency: 'High',
    impact: 'Work Performance',
    action: 'Down Payment Workshop',
    icon: Target,
    color: '#6366f1', // indigo
    bgColor: '#e0e7ff', // light indigo
    description: 'Engineers struggling with housing costs affecting focus',
  },
  {
    theme: 'Student Debt Burden',
    percentage: 38,
    department: 'Marketing',
    urgency: 'Medium',
    impact: 'Career Growth',
    action: 'Debt Repayment Strategy',
    icon: TrendingUp,
    color: '#ef4444', // red
    bgColor: '#fef2f2', // light red
    description: 'Young professionals delaying life milestones',
  },
  {
    theme: 'Emergency Fund Anxiety',
    percentage: 35,
    department: 'Sales',
    urgency: 'Critical',
    impact: 'Mental Health',
    action: 'Financial Safety Net Program',
    icon: AlertTriangle,
    color: '#f59e0b', // amber
    bgColor: '#fffbeb', // light amber
    description: 'Living paycheck to paycheck despite good salaries',
  },
];

export default function EmployeeInsightsCard() {
  const insight = financialStressInsights[0]; // Show the top concern

  return (
    <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 w-full h-full flex flex-col border border-purple-200 shadow-lg relative overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full -mr-10 -mt-10 opacity-30'></div>

      <div className='relative z-10'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg'>
            <Heart size={24} />
          </div>
          <div>
            <p className='font-bold text-lg text-gray-800'>Employee Wellbeing Insights</p>
            <p className='text-sm text-purple-600 font-medium'>Real challenges, real solutions</p>
          </div>
        </div>

        {/* Main insight card */}
        <div className='bg-white rounded-xl shadow-md p-5 border border-gray-100'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div
                className='w-10 h-10 rounded-xl flex items-center justify-center shadow-sm'
                style={{
                  backgroundColor: insight.bgColor,
                  color: insight.color,
                }}
              >
                <insight.icon className='w-5 h-5' />
              </div>
              <div>
                <p className='text-xs text-gray-500 uppercase tracking-wide font-medium'>
                  TOP CONCERN
                </p>
                <h3 className='text-lg font-bold text-gray-800'>{insight.theme}</h3>
              </div>
            </div>
            <div className='text-right'>
              <div className='flex items-center gap-1'>
                <span className='text-2xl font-bold' style={{ color: insight.color }}>
                  {insight.percentage}%
                </span>
                <Users className='w-4 h-4 text-gray-400' />
              </div>
              <p className='text-xs text-gray-500'>of employees</p>
            </div>
          </div>

          <p className='text-sm text-gray-600 mb-4 leading-relaxed'>{insight.description}</p>

          <div className='grid grid-cols-2 gap-3 mb-4'>
            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='text-xs text-gray-500 font-medium mb-1'>AFFECTED TEAM</p>
              <p className='text-sm font-semibold text-purple-700'>{insight.department}</p>
            </div>
            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='text-xs text-gray-500 font-medium mb-1'>IMPACT AREA</p>
              <p className='text-sm font-semibold text-orange-600'>{insight.impact}</p>
            </div>
          </div>

          <div className='border-t border-gray-200 pt-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Lightbulb className='w-4 h-4 text-green-600' />
              <p className='text-xs text-gray-500 font-medium'>RECOMMENDED ACTION</p>
            </div>
            <p className='text-sm font-semibold text-green-700 mb-3'>{insight.action}</p>
            <button className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105'>
              Schedule Intervention
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className='grid grid-cols-3 gap-3 mt-4'>
          <div className='text-center'>
            <p className='text-lg font-bold text-purple-700'>78%</p>
            <p className='text-xs text-gray-600'>Stress Reduction</p>
          </div>
          <div className='text-center'>
            <p className='text-lg font-bold text-green-700'>3.2x</p>
            <p className='text-xs text-gray-600'>ROI on Wellbeing</p>
          </div>
          <div className='text-center'>
            <p className='text-lg font-bold text-blue-700'>94%</p>
            <p className='text-xs text-gray-600'>Would Recommend</p>
          </div>
        </div>
      </div>
    </div>
  );
}
