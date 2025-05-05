'use client';
import { TrendingUp, Users, Shield } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

function BusinessImpactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <>
      <span id='business-impact' className='block scroll-mt-16'></span>
      <section className='w-full py-24 bg-white'>
        <div
          ref={sectionRef}
          className={`max-w-6xl mx-auto px-6 md:px-10 transform transition-all duration-1000
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className='max-w-3xl mx-auto text-center mb-20'>
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
              WHY FINANCIAL THERAPY FOR YOUR TEAM
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              When your people feel heard, your business thrives
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Financial therapy is more than a benefit—it's a way to show your team you care. When
              employees feel truly supported, they bring more focus, loyalty, and energy to your
              organization.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
            <div className='flex flex-col h-full bg-white rounded-3xl p-10 shadow-md hover:shadow-xl transition-shadow duration-500 group'>
              <div className='bg-[#9071FF]/10 rounded-full w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
                <TrendingUp className='text-[#9071FF]' size={32} />
              </div>
              <div className='mb-6'>
                <span className='text-5xl font-bold text-[#9071FF] block mb-2'>2x</span>
                <h3 className='text-xl font-semibold text-gray-800'>More Focus, More Energy</h3>
              </div>
              <p className='text-gray-600 mt-auto'>
                When financial worries ease, your people find space to do their best work. Employers
                tell us: "I can see the difference in my team's energy and focus."
              </p>
            </div>

            <div className='flex flex-col h-full bg-white rounded-3xl p-10 shadow-md hover:shadow-xl transition-shadow duration-500 group'>
              <div className='bg-[#9071FF]/10 rounded-full w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
                <Users className='text-[#9071FF]' size={32} />
              </div>
              <div className='mb-6'>
                <span className='text-5xl font-bold text-[#9071FF] block mb-2'>13%</span>
                <h3 className='text-xl font-semibold text-gray-800'>People Stay Longer</h3>
              </div>
              <p className='text-gray-600 mt-auto'>
                When employees feel cared for, they stick around. Financial therapy helps your team
                feel valued—and that loyalty means less turnover for your business.
              </p>
            </div>

            <div className='flex flex-col h-full bg-white rounded-3xl p-10 shadow-md hover:shadow-xl transition-shadow duration-500 group'>
              <div className='bg-[#9071FF]/10 rounded-full w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
                <Shield className='text-[#9071FF]' size={32} />
              </div>
              <div className='mb-6'>
                <span className='text-5xl font-bold text-[#9071FF] block mb-2'>↑</span>
                <h3 className='text-xl font-semibold text-gray-800'>Benefits That Matter</h3>
              </div>
              <p className='text-gray-600 mt-auto'>
                Financial therapy gives your people the confidence to use all the resources you
                offer. When support feels real, benefits get used—and your investment pays off.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BusinessImpactSection;
