import { PieChart } from 'lucide-react';
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

export default function SessionAllocationChart() {
  const { sessionsByMonth } = sessionMetricsSignal.value;

  // Calculate utilization percentage
  const totalAllocated = sessionsByMonth.reduce((sum, month) => sum + month.allocated, 0);
  const totalCompleted = sessionsByMonth.reduce((sum, month) => sum + month.completed, 0);
  const utilizationPercentage =
    totalAllocated > 0 ? ((totalCompleted / totalAllocated) * 100).toFixed(2) : '0';

  // Prepare data for the chart with allocation and utilization percentage
  const chartData = sessionsByMonth.map((monthData) => ({
    month: monthData.month,
    allocated: monthData.allocated,
    utilizationRate:
      monthData.completed > 0 ? (monthData.completed / monthData.allocated) * 100 : 0,
  }));

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-2'>
        <PieChart className='w-5 h-5 text-indigo-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Session Allocation</h3>
      </div>
      <div className='flex justify-between mb-6'>
        <div>
          <p className='text-sm text-gray-600'>Session Utilization</p>
          <p className='text-2xl font-bold text-indigo-600'>{utilizationPercentage}%</p>
        </div>
        <div className='text-right'>
          <p className='text-sm text-gray-600'>Session Metrics</p>
          <div className='flex gap-4'>
            <div>
              <p className='text-md font-semibold text-green-600'>Allocated: {totalAllocated}</p>
              <p className='text-md font-semibold text-blue-600'>Completed: {totalCompleted}</p>
            </div>
          </div>
        </div>
      </div>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id='colorAllocated' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id='colorUtilization' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#a78bfa' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#a78bfa' stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
            <XAxis dataKey='month' tick={{ fill: '#6b7280' }} />
            <YAxis
              yAxisId='left'
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Allocated Sessions', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Utilization %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId='left'
              dataKey='allocated'
              name='Allocated Sessions'
              fill='url(#colorAllocated)'
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='utilizationRate'
              name='Utilization Rate'
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
