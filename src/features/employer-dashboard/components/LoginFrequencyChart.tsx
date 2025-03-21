import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { engagementMetricsSignal } from '../state/employerDashboardState';

export default function LoginFrequencyChart() {
  const { loginFrequencyData } = engagementMetricsSignal.value;

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <h3 className='text-lg font-semibold text-gray-700 mb-6'>Weekly Login Activity</h3>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={loginFrequencyData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='day' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='users' fill='#9333EA' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
