import { useState } from 'react';

import { COLORS } from '@/src/styles/colors';

interface TimeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const TimeSelect = ({ label, value, onChange }: TimeSelectProps) => {
  const [inputMode, setInputMode] = useState<'select' | 'custom'>('select');

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === 'custom') {
      setInputMode('custom');
      onChange('');
    } else {
      setInputMode('select');
      onChange(selectedValue);
    }
  };

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      {inputMode === 'select' ? (
        <select
          value={value}
          onChange={handleTimeChange}
          className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
        >
          <option value=''>Select a time</option>
          <option value='9:00 AM'>9:00 AM</option>
          <option value='10:00 AM'>10:00 AM</option>
          <option value='11:00 AM'>11:00 AM</option>
          <option value='12:00 PM'>12:00 PM</option>
          <option value='1:00 PM'>1:00 PM</option>
          <option value='2:00 PM'>2:00 PM</option>
          <option value='3:00 PM'>3:00 PM</option>
          <option value='4:00 PM'>4:00 PM</option>
          <option value='5:00 PM'>5:00 PM</option>
          <option value='custom'>Custom Time</option>
        </select>
      ) : (
        <input
          type='time'
          value={value}
          onChange={handleTimeChange}
          className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
        />
      )}
    </div>
  );
};
