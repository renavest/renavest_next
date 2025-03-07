'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

import { comparisonData } from '../../state/dashboardState';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 border border-gray-100 shadow-sm rounded-lg'>
        <p className='text-sm font-medium text-gray-800 mb-2'>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className='text-sm'>
            <span className={entry.name === 'Past Behavior' ? 'text-gray-600' : 'text-[#952e8f]'}>
              {entry.name}:
            </span>{' '}
            <span className='font-medium'>{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ComparisonChart() {
  return (
    <>
      <h3 className='text-xl font-semibold text-gray-800 mb-4'>Financial Behavior Comparison</h3>
      <p className='text-gray-600 mb-6'>
        See how your financial behaviors have improved over time.
      </p>

      <div className='h-80 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={comparisonData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' vertical={false} />
            <XAxis
              dataKey='name'
              stroke='#6b7280'
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              stroke='#6b7280'
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType='circle'
            />
            <Bar
              dataKey='past'
              name='Past Behavior'
              fill='#94a3b8'
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey='current'
              name='Current Behavior'
              fill='#952e8f'
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
