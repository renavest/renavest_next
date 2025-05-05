import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend,
  Cell,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { BarChart3 } from 'lucide-react';

// Mock data for team/department performance
const teamPerformanceData = [
  { name: 'Engineering', engagement: 92, utilization: 85, satisfaction: 88 },
  { name: 'Marketing', engagement: 78, utilization: 82, satisfaction: 90 },
  { name: 'Finance', engagement: 85, utilization: 91, satisfaction: 82 },
  { name: 'HR', engagement: 95, utilization: 86, satisfaction: 94 },
  { name: 'Product', engagement: 88, utilization: 89, satisfaction: 86 },
];

// Custom tooltip with proper typing
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 shadow-lg rounded-lg border border-purple-100'>
        <p className='font-semibold text-gray-800'>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} className='font-medium' style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TeamPerformanceChart() {
  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        <BarChart3 className='w-5 h-5 text-purple-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Team Performance</h3>
      </div>
      <p className='text-sm text-gray-600 mb-4'>Department-wise performance metrics (%)</p>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            layout='vertical'
            data={teamPerformanceData}
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' horizontal={true} vertical={false} />
            <XAxis type='number' domain={[0, 100]} tick={{ fill: '#6b7280' }} />
            <YAxis dataKey='name' type='category' scale='band' tick={{ fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey='engagement'
              name='Engagement'
              fill='#8b5cf6'
              radius={[0, 4, 4, 0]}
              barSize={10}
              animationDuration={1500}
            />
            <Bar
              dataKey='utilization'
              name='Program Utilization'
              fill='#3b82f6'
              radius={[0, 4, 4, 0]}
              barSize={10}
              animationDuration={1500}
            />
            <Bar
              dataKey='satisfaction'
              name='Satisfaction'
              fill='#ec4899'
              radius={[0, 4, 4, 0]}
              barSize={10}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
