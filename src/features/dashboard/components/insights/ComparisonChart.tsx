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
} from 'recharts';

import { comparisonData } from '../../state/dashboardState';

export default function ComparisonChart() {
  return (
    <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100'>
      <h3 className='text-xl font-semibold text-gray-800 mb-4'>Financial Behavior Comparison</h3>
      <p className='text-gray-600 mb-6'>
        See how your financial behaviors have improved over time.
      </p>

      <div className='h-80 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#E9D5FF' />
            <XAxis dataKey='name' stroke='#6B21A8' />
            <YAxis stroke='#6B21A8' />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F3E8FF',
                border: '1px solid #E9D5FF',
              }}
            />
            <Legend />
            <Bar dataKey='past' name='Past Behavior' fill='#9333EA' />
            <Bar dataKey='current' name='Current Behavior' fill='#7E22CE' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
