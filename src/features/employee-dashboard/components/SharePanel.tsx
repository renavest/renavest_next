'use client';

import { Share2 } from 'lucide-react';

import { companyNameSignal } from '@/src/features/utm/utmCustomDemo';
import { cn } from '@/src/lib/utils';

interface SharePanelProps {
  onShareClick: () => void;
  referralLink: string;
}

const SharePanel = ({ onShareClick }: SharePanelProps) => {
  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-sm border animate-fade-in-up',
        'bg-purple-100',
        'border-blue-100 hover:shadow-md transition-shadow duration-300',
        'group', // Added for subtle hover interactions
      )}
    >
      <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
        <Share2 className='w-5 h-5 mr-2 text-purple-600 group-hover:scale-110 transition-transform' />
        Share Renavest
      </h3>
      <p className='text-gray-600 mb-4 text-sm'>
        Help your colleagues {companyNameSignal.value ? `at ${companyNameSignal.value}` : ''}{' '}
        discover financial wellness with Renavest. Share the link and track your impact!
      </p>

      <button
        onClick={onShareClick}
        className='w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-4 transition-colors font-medium group'
      >
        <Share2 className='w-4 h-4 mr-2 group-hover:rotate-6 transition-transform' />
        Share Now
      </button>
    </div>
  );
};

export default SharePanel;
