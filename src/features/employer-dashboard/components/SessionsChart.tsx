import { TrendingUp } from 'lucide-react';
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
  ReferenceLine,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { sessionMetricsSignal } from '../state/employerDashboardState';

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

export default function SessionsChart() {
  const { sessionsByMonth } = sessionMetricsSignal.value;

  // Add a monthly average line for tracking trends
  const averageCompletedSessions =
    sessionsByMonth.reduce((sum, month) => sum + month.completed, 0) / sessionsByMonth.length;

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-2'>
        <TrendingUp className='w-5 h-5 text-indigo-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Monthly Session Usage</h3>
      </div>
      <p className='text-sm text-gray-600 mb-6'>
        Track monthly session completion against allocated credits
      </p>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={sessionsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id='colorCompleted' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id='colorAllocated' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#ddd6fe' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#ddd6fe' stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id='colorTrend' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#a855f7' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#a855f7' stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
            <XAxis dataKey='month' tick={{ fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine
              y={averageCompletedSessions}
              stroke='#a855f7'
              strokeDasharray='3 3'
              label={{
                value: 'Average',
                position: 'insideBottomRight',
                fill: '#a855f7',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey='completed'
              name='Completed Sessions'
              fill='url(#colorCompleted)'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey='allocated'
              name='Allocated Sessions'
              fill='url(#colorAllocated)'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Line
              type='monotone'
              dataKey='completed'
              stroke='#a855f7'
              strokeWidth={2}
              dot={{ fill: '#a855f7', r: 4 }}
              activeDot={{ r: 6 }}
              name='Trend'
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
