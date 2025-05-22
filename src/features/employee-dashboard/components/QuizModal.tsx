'use client';

import { ClipboardList, X, ChevronLeft, ChevronRight } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal = ({ isOpen, onClose }: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    {
      id: 0,
      question: "What's your biggest financial challenge right now?",
      options: [
        { value: 'debt', label: 'Managing debt and payments' },
        { value: 'saving', label: 'Building savings and emergency fund' },
        { value: 'investing', label: 'Learning about investing' },
        { value: 'budgeting', label: 'Creating and sticking to a budget' },
        { value: 'stress', label: 'Reducing financial stress and anxiety' },
      ],
    },
    {
      id: 1,
      question: 'How would you describe your relationship with money?',
      options: [
        { value: 'anxious', label: 'Anxious and stressful' },
        { value: 'confused', label: 'Confused and overwhelming' },
        { value: 'neutral', label: 'Neutral and practical' },
        { value: 'confident', label: 'Confident and in control' },
        { value: 'avoidant', label: 'I prefer to avoid thinking about it' },
      ],
    },
    {
      id: 2,
      question: "What's your primary financial goal for the next year?",
      options: [
        { value: 'emergency_fund', label: 'Build an emergency fund' },
        { value: 'pay_debt', label: 'Pay off debt' },
        { value: 'invest', label: 'Start investing' },
        { value: 'buy_home', label: 'Save for a major purchase (home, car, etc.)' },
        { value: 'retirement', label: 'Plan for retirement' },
      ],
    },
  ];

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Quiz completed
      setIsCompleted(true);
      // Track quiz completion
      posthog.capture('quiz_completed', {
        answers,
        totalQuestions: questions.length,
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
    onClose();
  };

  const currentQuestionData = questions[currentQuestion];
  const hasAnswer = answers[currentQuestion] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <ClipboardList className='w-6 h-6 text-purple-600' />
            <h2 className='text-xl font-semibold text-gray-900'>Financial Wellness Quiz</h2>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Progress Bar */}
        <div className='px-6 pt-4'>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-purple-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className='text-sm text-gray-500 mt-2'>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Content */}
        <div className='p-6'>
          {!isCompleted ? (
            <div className='space-y-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-6'>
                {currentQuestionData.question}
              </h3>

              <div className='grid grid-cols-1 gap-3'>
                {currentQuestionData.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswerSelect(currentQuestion, option.value)}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
                      'hover:shadow-md hover:-translate-y-0.5',
                      'flex items-center justify-start text-left border-2',
                      answers[currentQuestion] === option.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-purple-300',
                    )}
                  >
                    <span className='font-medium'>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='text-center space-y-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900'>Quiz Complete!</h3>
              <p className='text-gray-600'>
                Thank you for completing our financial wellness quiz. Based on your responses, we'll
                help you find the perfect financial therapist to support your goals.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <button
                  onClick={() => window.open('/explore', '_blank')}
                  className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                >
                  Explore Therapists
                </button>
                <button
                  onClick={handleClose}
                  className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!isCompleted && (
          <div className='flex justify-between items-center p-6 border-t border-gray-200'>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
              )}
            >
              <ChevronLeft className='w-4 h-4' />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnswer}
              className={cn(
                'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors',
                hasAnswer
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed',
              )}
            >
              <span>{currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}</span>
              {currentQuestion < questions.length - 1 && <ChevronRight className='w-4 h-4' />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
