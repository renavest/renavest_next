import { ChevronLeft } from 'lucide-react';
import { DateTime } from 'luxon';
import React from 'react';

import { COLORS } from '@/src/styles/colors';

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  slots: TimeSlot[];
  date: DateTime;
  timezone: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null | undefined;
}

export function TimeSelectionModal({
  open,
  onClose,
  slots,
  date,
  timezone,
  onSlotSelect,
  selectedSlot,
}: TimeSelectionModalProps) {
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
              const isSelected =
                selectedSlot && selectedSlot.start === slot.start && selectedSlot.end === slot.end;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSlotSelect(slot);
                    onClose();
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all duration-150 font-semibold shadow-sm focus:outline-none min-w-[56px] max-w-[80px] justify-center
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
                  <span className='font-bold'>{start.toFormat('h a')}</span>
                  {isSelected && <span className='ml-1 text-white font-bold'>✓</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
