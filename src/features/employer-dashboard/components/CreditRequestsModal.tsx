'use client';

import { useEffect, useState } from 'react';

// Pure Tailwind modal component
interface CreditRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestCount: number;
}

export default function CreditRequestsModal({
  isOpen,
  onClose,
  requestCount,
}: CreditRequestsModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTopUp = () => {
    // TODO: Implement top-up flow
    console.log('Top up clicked');
    onClose();
  };

  if (!isMounted || !isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/25 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-center text-gray-900'>Credit Requests</h2>
        </div>

        {/* Content */}
        <div className='flex flex-col items-center gap-6'>
          <p className='text-center text-lg text-gray-700'>
            {requestCount} {requestCount === 1 ? 'employee has' : 'employees have'} used all their
            credits and would like more.
          </p>

          {/* Button */}
          <button
            onClick={handleTopUp}
            className='w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors'
          >
            Top Up Their Credits
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
