import { COLORS } from '@/src/styles/colors';

const COMMON_TIMEZONES = [
  { value: 'EST', label: 'Eastern Time (EST)' },
  { value: 'CST', label: 'Central Time (CST)' },
  { value: 'MST', label: 'Mountain Time (MST)' },
  { value: 'PST', label: 'Pacific Time (PST)' },
];

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimezoneSelect = ({ value, onChange }: TimezoneSelectProps) => {
  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>Select Your Timezone</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
      >
        {COMMON_TIMEZONES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
