import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TrendingUp } from 'lucide-react';

import { engagementMetricsSignal } from '../state/employerDashboardState';

// We'll extend the existing data with monthly engagement trends
const engagementTrendData = [
  { month: 'Jan', active: 380, logins: 1200 },
  { month: 'Feb', active: 400, logins: 1250 },
  { month: 'Mar', active: 420, logins: 1300 },
  { month: 'Apr', active: 450, logins: 1450 },
  { month: 'May', active: 470, logins: 1500 },
  { month: 'Jun', active: 480, logins: 1600 },
];

// Custom tooltip component with proper typing
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 shadow-lg rounded-lg border border-purple-100'>
        <p className='font-semibold text-gray-800'>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }} className='font-medium'>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EngagementTrendChart() {
  const metrics = engagementMetricsSignal.value;

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-2'>
        <TrendingUp className='w-5 h-5 text-indigo-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Engagement Trends</h3>
      </div>
      <p className='text-sm text-gray-600 mb-6'>Monthly active users and platform logins</p>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={engagementTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id='colorActive' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id='colorLogins' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey='month' tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type='monotone'
              dataKey='active'
              name='Active Users'
              stroke='#8b5cf6'
              fillOpacity={1}
              fill='url(#colorActive)'
              strokeWidth={2}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
            <Area
              type='monotone'
              dataKey='logins'
              name='Total Logins'
              stroke='#3b82f6'
              fillOpacity={1}
              fill='url(#colorLogins)'
              strokeWidth={2}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
