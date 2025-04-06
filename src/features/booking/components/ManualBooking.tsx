import { COLORS } from '@/src/styles/colors';

interface ManualBookingProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onBook: () => void;
  onCancel: () => void;
}

export const ManualBooking = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onBook,
  onCancel,
}: ManualBookingProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
    >
      <div className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full`}>
        <h2 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-6 text-center`}>
          Schedule Your Session
        </h2>

        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Select Date</label>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Select Time</label>
            <input
              type='time'
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
            />
          </div>

          <div className='space-y-3'>
            <button
              onClick={onBook}
              disabled={!selectedDate || !selectedTime}
              className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Book Session
            </button>
            <button
              onClick={onCancel}
              className={`w-full ${COLORS.WARM_PURPLE.DEFAULT} border ${COLORS.WARM_PURPLE.border} py-3 rounded-lg ${COLORS.WARM_PURPLE.hoverBorder} transition-colors`}
            >
              Use Calendly Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
