import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Mon', current: 40, previous: 35 },
  { name: 'Tue', current: 30, previous: 32 },
  { name: 'Wed', current: 120, previous: 60, flagged: true },
];

const DataCardExample = () => (
  <div
    className='w-full h-full rounded-3xl shadow-md flex flex-col items-center justify-center p-6'
    style={{ background: '#F9F9F7' }}
  >
    <div className='flex items-center gap-2 mb-2'>
      <span className='inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold'>
        Flagged
      </span>
      <span className='text-gray-700 text-sm font-medium'>Unusual Spending Pattern</span>
    </div>
    <div className='w-full h-32 mb-3'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey='name' fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} width={30} />
          <Tooltip />
          <Legend verticalAlign='top' height={24} />
          <Bar dataKey='previous' fill='#A9A9A9' radius={[4, 4, 0, 0]} name='Previous' />
          <Bar dataKey='current' fill='#9071FF' radius={[4, 4, 0, 0]} name='Current' />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className='text-xs text-gray-500 text-center'>
      <span className='font-semibold'>Wednesday:</span> Large transaction detected ($120 at Coffee
      Shop)
    </div>
  </div>
);

export default DataCardExample;
