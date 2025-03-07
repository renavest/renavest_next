'use client';
import DashboardHeader from '@/src/features/dashboard/components/DashboardHeader';
import ActionableInsights from '@/src/features/dashboard/components/insights/ActionableInsights';
import ComparisonChart from '@/src/features/dashboard/components/insights/ComparisonChart';
import TherapistConnection from '@/src/features/dashboard/components/insights/TherapistConnection';
import WeeklyMoneyScript from '@/src/features/dashboard/components/insights/WeeklyMoneyScript';

export default function DashboardPage() {
  return (
    <div className='min-h-screen bg-[#faf9f6] font-sans'>
      <DashboardHeader />

      {/* Main Content */}
      <main className='container mx-auto px-4 py-6'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-[#952e8f]'>Welcome back, Alex</h2>
          <p className='text-gray-600 mt-1'>Let's continue your financial wellness journey.</p>
        </div>

        {/* Content */}
        <div className='space-y-8'>
          <WeeklyMoneyScript />

          <div className='grid md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-xl font-semibold text-[#952e8f] mb-4'>Actionable Insights</h2>
              <ActionableInsights />
            </div>

            <div className='space-y-8'>
              <TherapistConnection />
              <ComparisonChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
