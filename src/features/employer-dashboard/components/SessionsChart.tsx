import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { sessionMetricsSignal } from '../state/employerDashboardState';

export default function SessionsChart() {
  const { sessionsByMonth } = sessionMetricsSignal.value;

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <h3 className='text-lg font-semibold text-gray-700 mb-2'>Monthly Session Usage</h3>
      <p className='text-sm text-gray-600 mb-6'>
        Track monthly session completion against allocated credits
      </p>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={sessionsByMonth}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey='completed'
              fill='#8B5CF6'
              name='Completed Sessions'
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='allocated'
              fill='#DDD6FE'
              name='Allocated Sessions'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
