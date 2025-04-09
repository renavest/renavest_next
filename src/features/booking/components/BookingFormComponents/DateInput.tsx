import { COLORS } from '@/src/styles/colors';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const DateInput = ({ label, value, onChange, error }: DateInputProps) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <input
        type='date'
        value={value}
        min={today}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border ${
          error ? 'border-red-500' : COLORS.WARM_PURPLE[20]
        } ${COLORS.WARM_PURPLE.focus} outline-none`}
      />
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
};
