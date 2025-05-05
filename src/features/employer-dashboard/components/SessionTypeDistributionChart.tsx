import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Mock data for session types (since this isn't in the existing state)
const sessionTypeData = [
  { name: 'Financial Planning', value: 45, color: '#8b5cf6' },
  { name: 'Stress Management', value: 25, color: '#ec4899' },
  { name: 'Career Coaching', value: 20, color: '#10b981' },
  { name: 'Mindfulness', value: 10, color: '#3b82f6' },
];

const RADIAN = Math.PI / 180;

// Custom label for pie slices
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill='white'
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline='central'
      className='text-xs font-medium'
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip with proper typing
const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 shadow-lg rounded-lg border border-purple-100'>
        <p className='font-semibold text-gray-800'>{payload[0].name}</p>
        <p className='font-medium' style={{ color: payload[0].payload.color }}>
          {`${payload[0].value} Sessions (${(((payload[0].value as number) / 100) * 100).toFixed(0)}%)`}
        </p>
      </div>
    );
  }
  return null;
};

export default function SessionTypeDistributionChart() {
  return (
    <div className='bg-white rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        <PieChartIcon className='w-5 h-5 text-purple-600' />
        <h3 className='text-lg font-semibold text-gray-700'>Session Type Distribution</h3>
      </div>
      <p className='text-sm text-gray-600 mb-4'>Breakdown of employee sessions by type</p>
      <div className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={sessionTypeData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={110}
              innerRadius={60}
              fill='#8884d8'
              dataKey='value'
              animationDuration={1500}
            >
              {sessionTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout='horizontal'
              verticalAlign='bottom'
              align='center'
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
