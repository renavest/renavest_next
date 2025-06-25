'use client';

import { ClipboardList } from 'lucide-react';

interface ConsultationBannerProps {
  onTakeQuizClick: () => void;
}

const ConsultationBanner = ({ onTakeQuizClick }: ConsultationBannerProps) => {
  return (
    <div className='bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-6 md:p-8 shadow-sm border border-purple-200 mb-8 md:mb-10 animate-fade-in-up'>
      <div className='flex flex-col md:flex-row items-center justify-between'>
        <div className='mb-4 md:mb-0 md:mr-6'>
          <h2 className='text-2xl md:text-3xl font-bold text-white mb-2'>
            Take Our Quick Quiz & Get a Free Consultation
          </h2>
          <p className='text-purple-50 md:text-lg max-w-2xl'>
            Answer a few questions about your financial goals and we'll match you with the perfect
            financial therapist for a free consultation.
          </p>
        </div>
        <button
          onClick={onTakeQuizClick}
          className='bg-white hover:bg-gray-50 text-purple-700 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-semibold flex items-center whitespace-nowrap'
        >
          <ClipboardList className='w-5 h-5 mr-2' />
          Take the Quiz
        </button>
      </div>
    </div>
  );
};

export default ConsultationBanner;
