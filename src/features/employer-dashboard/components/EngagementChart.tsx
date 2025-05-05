import { Activity } from 'lucide-react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  ComposedChart,
  Line,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { engagementMetricsSignal, employeeMetricsSignal } from '../state/employerDashboardState';

// Custom tooltip component with proper typing
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 shadow-lg rounded-lg border border-purple-100'>
        <p className='font-semibold text-gray-800'>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} className='font-medium' style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementChart() {
  const { loginFrequencyData, dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers } =
    engagementMetricsSignal.value;
  const { totalEmployees, activeInProgram } = employeeMetricsSignal.value;

  // Calculate program adoption percentage
  const programAdoptionPercentage =
    totalEmployees > 0 ? ((activeInProgram / totalEmployees) * 100).toFixed(2) : '0';

  // Prepare data for the chart with login frequency and active users
  const chartData = loginFrequencyData.map((dayData) => ({
    day: dayData.day,
    dailyUsers: dayData.users,
    programAdoption: (dayData.users / totalEmployees) * 100,
  }));

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-2'>
        <Activity className='w-5 h-5 text-indigo-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Program Engagement</h3>
      </div>
      <div className='flex justify-between mb-6'>
        <div>
          <p className='text-sm text-gray-600'>Program Adoption</p>
          <p className='text-2xl font-bold text-indigo-600'>{programAdoptionPercentage}%</p>
        </div>
        <div className='text-right'>
          <p className='text-sm text-gray-600'>Active Users</p>
          <div className='flex gap-4'>
            <div>
              <p className='text-md font-semibold text-green-600'>Daily: {dailyActiveUsers}</p>
              <p className='text-md font-semibold text-blue-600'>Weekly: {weeklyActiveUsers}</p>
              <p className='text-md font-semibold text-purple-600'>Monthly: {monthlyActiveUsers}</p>
            </div>
          </div>
        </div>
      </div>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id='colorDailyUsers' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id='colorAdoption' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#a78bfa' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#a78bfa' stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
            <XAxis dataKey='day' tick={{ fill: '#6b7280' }} />
            <YAxis
              yAxisId='left'
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Daily Users', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Adoption %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId='left'
              dataKey='dailyUsers'
              name='Daily Active Users'
              fill='url(#colorDailyUsers)'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='programAdoption'
              name='Program Adoption %'
              stroke='#8b5cf6'
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
