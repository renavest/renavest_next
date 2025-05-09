'use client';

import posthog from 'posthog-js';
import { useState, useEffect } from 'react';

export interface FinancialTherapyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FinancialTherapyModal({ isOpen, onClose }: FinancialTherapyModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'What is Financial Therapy?',
      content:
        'Financial therapy is a holistic approach that combines emotional support with practical financial guidance. It helps you understand the psychological aspects of your financial decisions and behaviors.',
      icon: '💡',
    },
    {
      title: 'Who are our financial therapists?',
      content:
        'Our financial therapists are compassionate, licensed professionals with specialized training in both psychology and financial counseling. They blend emotional intelligence with practical financial expertise to provide holistic, personalized guidance.',
      icon: '🤝',
    },
    {
      title: 'How is financial therapy different from financial planning?',
      content:
        'While financial planning focuses on numbers and strategies, financial therapy explores the emotional roots of your financial behaviors. We help you understand the psychological patterns that influence your money decisions and create lasting, meaningful change.',
      icon: '🧠',
    },

    {
      title: 'Transform Your Financial Wellness Journey',
      content:
        'Empower yourself to break free from financial stress, challenge limiting beliefs, and build a confident, purposeful relationship with money. Our resources and support are designed to help you thrive financially and emotionally.',
      icon: '✨',
      image: 'https://d2qcuj7ucxw61o.cloudfront.net/shani_demo.jpg',
    },
  ];

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onClose();
    } else {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Track resource exploration
  const trackResourceExploration = () => {
    posthog.capture('financial_therapy_modal_viewed', {
      slide: slides[currentSlide].title,
    });
  };

  // Reset slide to first when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      trackResourceExploration();
    }
  }, [isOpen]);

  // Track slide changes
  useEffect(() => {
    if (isOpen) {
      trackResourceExploration();
    }
  }, [currentSlide, isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'
        >
          ✕
        </button>

        {/* Slide content */}
        <div className='text-center'>
          <div className='text-6xl mb-4'>{slides[currentSlide].icon}</div>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>{slides[currentSlide].title}</h2>
          <p className='text-gray-600 mb-6'>{slides[currentSlide].content}</p>

          {/* Conditionally render image for the last slide */}
          {slides[currentSlide].image && (
            <div className='flex justify-center mb-6'>
              <img
                src={slides[currentSlide].image}
                alt='Financial Wellness'
                className='max-w-full h-48 object-contain'
              />
            </div>
          )}

          {/* Navigation */}
          <div className='flex justify-between mt-6'>
            <button
              onClick={handlePrevious}
              className={`bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors ${
                currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={currentSlide === 0}
            >
              Previous
            </button>
            <div className='flex items-center space-x-2'>
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentSlide ? 'bg-purple-600' : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className='bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
            >
              {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
