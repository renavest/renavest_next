'use client';
import { HeartHandshake, Brain, ClipboardList } from 'lucide-react';

function WhatIsFinancialTherapySection() {
  return (
    <>
      <span id='what-is-financial-therapy' className='block scroll-mt-16'></span>
      <section className='w-full py-24 bg-[#f9f8ff]'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <div className='max-w-3xl mx-auto text-center mb-20'>
          <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
            WHAT IS FINANCIAL THERAPY?
          </span>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
            Financial Therapy: Beyond Traditional Financial Wellness
          </h2>
          <p className='text-xl text-gray-600 leading-relaxed'>
            Unlike standard financial education or advice, financial therapy addresses the emotional
            and psychological factors that drive financial behavior. Our financial therapists help
            your employees:
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 mb-12'>
          <div className='flex flex-col h-full bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500 group items-center'>
            <div className='bg-[#9071FF]/10 rounded-full w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
              <HeartHandshake className='text-[#9071FF]' size={40} />
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
              Overcome Financial Anxiety & Stress
            </h3>
            <p className='text-gray-600 text-lg text-center'>
              Identify and address the root causes of financial anxiety and stress with expert
              support.
            </p>
          </div>
          <div className='flex flex-col h-full bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500 group items-center'>
            <div className='bg-[#9071FF]/10 rounded-full w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
              <Brain className='text-[#9071FF]' size={40} />
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
              Build Healthier Money Habits
            </h3>
            <p className='text-gray-600 text-lg text-center'>
              Develop sustainable, positive money habits through behavioral change techniques.
            </p>
          </div>
          <div className='flex flex-col h-full bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500 group items-center'>
            <div className='bg-[#9071FF]/10 rounded-full w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
              <ClipboardList className='text-[#9071FF]' size={40} />
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
              Personalized Wellness Plans
            </h3>
            <p className='text-gray-600 text-lg text-center'>
              Work with a therapist to create a financial wellness plan tailored to your unique
              needs.
            </p>
          </div>
        </div>
        <p className='text-center text-gray-600 text-lg max-w-2xl mx-auto'>
          All delivered through secure, confidential 1-on-1 sessions with licensed professionals.
        </p>
      </div>
    </section>
    </>
  );
}

export default WhatIsFinancialTherapySection;
