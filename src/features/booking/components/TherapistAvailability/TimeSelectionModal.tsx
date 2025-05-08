import { ChevronLeft, Clock } from 'lucide-react';
import { DateTime } from 'luxon';

import { COLORS } from '@/src/styles/colors';

interface TimeSlot {
  start: string;
  end: string;
}

export function TimeSelectionModal({
  open,
  onClose,
  slots,
  date,
  timezone,
  onSlotSelect,
  selectedSlot,
}: {
  open: boolean;
  onClose: () => void;
  slots: TimeSlot[];
  date: DateTime;
  timezone: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null | undefined;
}) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
      <div className='bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative flex flex-col'>
        <button
          className='absolute top-3 left-3 text-gray-400 hover:text-gray-600'
          onClick={onClose}
          aria-label='Back'
        >
          <ChevronLeft className='h-6 w-6' />
        </button>
        <div className='text-center mb-4'>
          <div className='text-xs text-gray-500'>{date.toFormat('cccc, LLLL d, yyyy')}</div>
          <div className='text-sm text-gray-700 mb-2'>Timezone: {timezone}</div>
        </div>
        <div className='flex flex-col gap-3'>
          {slots.length === 0 ? (
            <div className='text-gray-400 text-center'>No available slots for this date</div>
          ) : (
            slots.map((slot: TimeSlot, idx: number) => {
              const start = DateTime.fromISO(slot.start, { zone: timezone });
              const end = DateTime.fromISO(slot.end, { zone: timezone });
              const isSelected =
                selectedSlot && selectedSlot.start === slot.start && selectedSlot.end === slot.end;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSlotSelect(slot);
                    onClose();
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-150 font-semibold shadow-sm focus:outline-none
                    ${
                      isSelected
                        ? COLORS.WARM_PURPLE.bg + ' text-white border-transparent'
                        : 'bg-white border-gray-200 text-gray-900 hover:' +
                          COLORS.WARM_PURPLE.hover +
                          ' hover:border-' +
                          COLORS.WARM_PURPLE.DEFAULT
                    }
                  `}
                >
                  <Clock className={isSelected ? 'text-white' : COLORS.WARM_PURPLE.DEFAULT} />
                  <span className='flex flex-col items-start'>
                    <span
                      className={isSelected ? 'font-bold text-white' : 'font-bold text-gray-900'}
                    >
                      {start.toFormat('h:mm')} - {end.toFormat('h:mm')}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                      {start.toFormat('a')} - {end.toFormat('a')}
                    </span>
                  </span>
                  {isSelected && <span className='ml-2 text-white font-bold'>✓</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
