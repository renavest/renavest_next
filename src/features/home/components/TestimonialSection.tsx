'use client';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

function TestimonialCard({
  isVisible,
  sectionRef,
}: {
  isVisible: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={sectionRef}
      className={`bg-white rounded-3xl p-10 shadow-lg relative transform transition-all duration-1000 mx-auto max-w-2xl
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className='absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 transform rotate-45 bg-white'></div>
      <div className='flex justify-center mb-6'>
        <div className='w-16 h-16 rounded-full border-4 border-white overflow-hidden'>
          <img
            src='https://d2qcuj7ucxw61o.cloudfront.net/esmaa.png'
            alt='Essma Litmim'
            className='w-full h-full object-cover'
          />
        </div>
      </div>
      <p className='text-xl text-gray-800 mb-8 italic text-center'>
        "My session with financial therapy coach Paige was nothing short of transformative. Her
        insight, compassion, and affirming guidance created a space where I felt truly seen and
        empowered... I walked away with a renewed sense of confidence and motivation to pursue my
        goals with intention and clarity. I'm so grateful to Renavest for creating this healing
        space... This work is transformational and will absolutely change lives."
      </p>
      <div className='text-center'>
        <span className='block font-semibold text-gray-900 text-lg'>Essma Litmim</span>
        <span className='text-gray-600'>Renavest User</span>
      </div>
    </div>
  );
}

function TestimonialSection() {
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
    <section className='w-full py-32 bg-gradient-to-b from-[#f9f8ff] to-white'>
      <div className='max-w-3xl mx-auto px-6 md:px-10 flex flex-col items-center'>
        <TestimonialCard isVisible={isVisible} sectionRef={sectionRef} />
        <div className='mt-12 flex flex-col sm:flex-row gap-4 justify-center w-full'>
          <a
            href='https://calendly.com/rameau-stan/one-on-one'
            target='_blank'
            rel='noopener noreferrer'
          >
            <button className='w-full sm:w-auto px-8 py-4 bg-[#9071FF] text-white rounded-full shadow-md hover:shadow-lg transition font-medium text-lg flex items-center justify-center'>
              <span>Book a Demo</span>
              <ArrowRight size={20} className='ml-2' />
            </button>
          </a>
          <a
            href='https://calendly.com/rameau-stan/one-on-one'
            target='_blank'
            rel='noopener noreferrer'
          >
            <button className='w-full sm:w-auto px-8 py-4 bg-white text-[#9071FF] border border-[#9071FF] rounded-full shadow-md hover:bg-[#f3f0ff] transition font-medium text-lg flex items-center justify-center'>
              <span>Talk to Sales</span>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
