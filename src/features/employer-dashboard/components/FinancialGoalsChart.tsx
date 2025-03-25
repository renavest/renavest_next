import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { financialGoalsMetricsSignal } from '../state/employerDashboardState';

export default function FinancialGoalsChart() {
  const { goalProgressData } = financialGoalsMetricsSignal.value;

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <h3 className='text-lg font-semibold text-gray-700 mb-6'>Monthly Goals Progress</h3>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={goalProgressData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip />
            <Area
              type='monotone'
              dataKey='completed'
              stackId='1'
              stroke='#4C1D95'
              fill='#8B5CF6'
              name='Completed Goals'
            />
            <Area
              type='monotone'
              dataKey='total'
              stackId='2'
              stroke='#6D28D9'
              fill='#DDD6FE'
              name='Total Goals'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
