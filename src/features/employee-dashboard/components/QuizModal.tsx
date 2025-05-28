'use client';

import { ClipboardList, X, ChevronLeft, ChevronRight } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const QUIZ_QUESTIONS = [
  {
    id: 0,
    question:
      'You get a notification that your bank balance is lower than expected. What are you most likely to do first?',
    options: [
      { value: 'put_off', label: 'Put it off and come back to it later' },
      {
        value: 'check_transactions',
        label: "Go through recent transactions to check what's going on",
      },
      { value: 'talk_through', label: 'Talk it through with someone you trust' },
      { value: 'think_differently', label: 'Think about what you could have done differently' },
    ],
  },
  {
    id: 1,
    question: "When money comes up in conversation, what's your usual reaction?",
    options: [
      { value: 'get_quiet', label: 'I get quiet or try to steer the topic elsewhere' },
      { value: 'explain_defensive', label: 'I tend to explain a lot or feel defensive' },
      { value: 'keep_simple', label: "I keep it simple and don't say much" },
      { value: 'share_lots', label: 'I usually have a lot to share about it' },
    ],
  },
  {
    id: 2,
    question:
      'If you were meeting with a financial therapist, what kind of session would feel most helpful?',
    options: [
      { value: 'bigger_picture', label: 'Taking time to talk and understand the bigger picture' },
      { value: 'clear_goals', label: 'Setting clear goals and working toward them' },
      { value: 'daily_habits', label: 'Exploring how money affects your daily life or habits' },
      { value: 'collaborate', label: 'Collaborating together to figure things out' },
    ],
  },
  {
    id: 3,
    question: 'Which of these situations feels most relatable right now?',
    options: [
      { value: 'income_coverage', label: "Income doesn't seem to cover everything" },
      { value: 'spending_debt', label: 'Spending or debt feels hard to keep up with' },
      { value: 'tension_others', label: "There's tension with others around money" },
      { value: 'surprise_expenses', label: 'Worrying about surprise expenses or emergencies' },
    ],
  },
  {
    id: 4,
    question: 'How confident do you feel managing your money right now?',
    options: [
      { value: '1', label: '1 - Not confident at all' },
      { value: '2', label: '2 - Slightly confident' },
      { value: '3', label: '3 - Moderately confident' },
      { value: '4', label: '4 - Very confident' },
      { value: '5', label: '5 - Extremely confident' },
    ],
  },
];

export const QuizModal = ({ isOpen, onClose, onComplete }: QuizModalProps) => {
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
      // Call the completion callback if provided
      if (onComplete) {
        onComplete();
      }
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
              <p className='text-gray-600 max-w-md mx-auto'>
                Thank you for completing our financial wellness quiz! Based on your responses, we've
                prepared personalized therapist recommendations just for you. Close this window to
                view your matches and book a free consultation.
              </p>
              <div className='flex justify-center'>
                <button
                  onClick={handleClose}
                  className='bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors'
                >
                  View My Recommendations
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
