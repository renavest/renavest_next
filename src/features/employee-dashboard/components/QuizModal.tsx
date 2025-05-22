'use client';

import { ClipboardList, X, ChevronLeft, ChevronRight } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 0,
    question:
      'Thinking about your finances, which of these topics currently feels like the heaviest weight or biggest source of stress for you?',
    options: [
      { value: 'daily_expenses', label: 'Managing day-to-day expenses' },
      { value: 'debt_amount', label: 'The amount of debt I have' },
      { value: 'saving_goals', label: 'Saving for important goals' },
      { value: 'unexpected_bills', label: 'Dealing with unexpected bills' },
      { value: 'money_anxiety', label: 'Feeling anxious or worried about money generally' },
      { value: 'not_enough', label: 'Not enough to meet my needs' },
    ],
  },
  {
    id: 1,
    question:
      "Looking ahead at your financial life over the next one to three years, what's your most important financial goal?",
    options: [
      { value: 'debt_free', label: 'Becoming debt-free' },
      { value: 'emergency_fund', label: 'Building an emergency fund' },
      { value: 'home_purchase', label: 'Saving for a home purchase' },
      { value: 'retirement_planning', label: 'Planning for retirement' },
      { value: 'investment_growth', label: 'Growing my investments' },
      { value: 'financial_stability', label: 'Achieving overall financial stability' },
    ],
  },
  {
    id: 2,
    question:
      'On a scale of one to five, where one is not at all confident and five is very confident, how confident do you feel about managing your finances right now?',
    options: [
      { value: '1', label: '1 - Not at all confident' },
      { value: '2', label: '2 - Slightly confident' },
      { value: '3', label: '3 - Moderately confident' },
      { value: '4', label: '4 - Very confident' },
      { value: '5', label: '5 - Extremely confident' },
    ],
  },
  {
    id: 3,
    question:
      'Are there any specific therapist qualities or communication styles that are important to you?',
    options: [
      { value: 'direct_concise', label: 'Short and direct communication' },
      { value: 'detailed_thorough', label: 'Detailed and thorough explanations' },
      { value: 'empathetic_supportive', label: 'Empathetic and emotionally supportive' },
      { value: 'practical_actionable', label: 'Practical and action-oriented' },
      { value: 'experienced_credentials', label: 'Strong credentials and experience' },
      { value: 'no_preference', label: 'No specific preference' },
    ],
  },
];

export const QuizModal = ({ isOpen, onClose }: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Quiz completed
      setIsCompleted(true);
      // Track quiz completion
      posthog.capture('quiz_completed', {
        answers,
        totalQuestions: QUIZ_QUESTIONS.length,
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

  const currentQuestionData = QUIZ_QUESTIONS[currentQuestion];
  const hasAnswer = answers[currentQuestion] !== undefined;
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto'>
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
            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
          </p>
        </div>

        {/* Content */}
        <div className='p-8'>
          {!isCompleted ? (
            <div className='space-y-8'>
              <h3 className='text-xl font-medium text-gray-900 mb-8 text-center leading-relaxed'>
                {currentQuestionData.question}
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {currentQuestionData.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswerSelect(currentQuestion, option.value)}
                    className={cn(
                      'w-full p-6 rounded-xl text-left transition-all duration-300 ease-out min-h-[80px]',
                      'hover:shadow-md hover:-translate-y-0.5',
                      'flex items-center justify-start text-left border-2',
                      answers[currentQuestion] === option.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-purple-300',
                    )}
                  >
                    <span className='font-medium text-base leading-relaxed'>{option.label}</span>
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
              <span>{currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Complete' : 'Next'}</span>
              {currentQuestion < QUIZ_QUESTIONS.length - 1 && <ChevronRight className='w-4 h-4' />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
