'use client';

import { financialGoals, selectedGoalSignal } from '../../state/dashboardState';

function GoalProgressBar({
  current,
  target,
  category,
}: {
  current: number;
  target: number;
  category: string;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const barColor = category === 'savings' ? 'bg-[#952e8f]' : 'bg-[#6366f1]';

  return (
    <div className='w-full h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden'>
      <div
        className={`h-full ${barColor} transition-all duration-500 ease-in-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Goals() {
  const handleGoalClick = (goalId: number) => {
    selectedGoalSignal.value = selectedGoalSignal.value === goalId ? null : goalId;
  };

  return (
    <div className='bg-white rounded-xl p-4 md:p-8 border border-gray-100 shadow-sm'>
      <div className='space-y-6 md:space-y-8'>
        {financialGoals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => handleGoalClick(goal.id)}
            className={`space-y-2 md:space-y-3 p-3 md:p-4 rounded-lg transition-colors cursor-pointer
              ${selectedGoalSignal.value === goal.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
          >
            <div className='flex justify-between items-baseline'>
              <div>
                <h4 className='text-base md:text-lg font-medium text-gray-800'>{goal.title}</h4>
                <p className='text-xs md:text-sm text-gray-500'>{goal.description}</p>
              </div>
              <span className='text-xs md:text-sm font-medium text-gray-600'>{goal.timeframe}</span>
            </div>

            <GoalProgressBar current={goal.current} target={goal.target} category={goal.category} />

            <div className='flex justify-between items-center text-xs md:text-sm'>
              <span className='text-gray-600'>
                ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
              </span>
              <span
                className={`font-medium ${
                  goal.category === 'savings' ? 'text-[#952e8f]' : 'text-[#6366f1]'
                }`}
              >
                {Math.round((goal.current / goal.target) * 100)}% Complete
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
