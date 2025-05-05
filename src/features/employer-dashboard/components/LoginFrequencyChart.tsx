import { Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  TooltipProps,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { engagementMetricsSignal } from '../state/employerDashboardState';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

// Custom tooltip component with proper typing
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 shadow-lg rounded-lg border border-purple-100'>
        <p className='font-semibold text-gray-800'>{`${label}`}</p>
        <p className='text-purple-600 font-medium'>{`${payload[0].value} Users`}</p>
      </div>
    );
  }
  return null;
};

export default function LoginFrequencyChart() {
  const { loginFrequencyData } = engagementMetricsSignal.value;

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-6'>
        <Activity className='w-5 h-5 text-purple-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Weekly Login Activity</h3>
      </div>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={loginFrequencyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
            <XAxis dataKey='day' tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey='users'
              name='Active Users'
              fill='url(#colorUsers)'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {loginFrequencyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
