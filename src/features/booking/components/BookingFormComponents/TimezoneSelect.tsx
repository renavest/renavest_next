import { COLORS } from '@/src/styles/colors';

import { TimezoneIdentifier } from '../../utils/dateTimeUtils';

interface TimezoneOption {
  value: TimezoneIdentifier;
  label: string;
}

interface TimezoneSelectProps {
  value: TimezoneIdentifier;
  onChange: (value: TimezoneIdentifier) => void;
  options: TimezoneOption[];
}

export const TimezoneSelect = ({ value, onChange, options }: TimezoneSelectProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium text-gray-700'>Select Timezone</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimezoneIdentifier)}
        className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-${COLORS.WARM_PURPLE.DEFAULT} focus:border-${COLORS.WARM_PURPLE.DEFAULT} sm:text-sm`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
