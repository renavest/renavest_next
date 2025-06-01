'use client';

import { useUser } from '@clerk/nextjs';
import { Heart, Users, TrendingUp, Sparkles, Award, Zap } from 'lucide-react';
import { redirect } from 'next/navigation';

import { ALLOWED_EMAILS } from '@/src/constants';
import { ChartsSections } from '@/src/features/employer-dashboard/components/ChartsSections';
import EmployeeInsightsCard from '@/src/features/employer-dashboard/components/EmployeeInsightsCard';
import EmployerNavbar from '@/src/features/employer-dashboard/components/EmployerNavbar';
import { EngagementSection } from '@/src/features/employer-dashboard/components/EngagementSection';
import { ProgramOverviewSection } from '@/src/features/employer-dashboard/components/ProgramOverviewSection';
import { SessionsSection } from '@/src/features/employer-dashboard/components/SessionsSection';

export default function EmployerDashboardView() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
          <p className='text-purple-700 text-lg font-medium'>Loading your impact dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect('/login');
  }

  if (!ALLOWED_EMAILS.includes(user?.emailAddresses[0]?.emailAddress || '')) {
    redirect('/explore');
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'>
      <EmployerNavbar />

      <main className='container mx-auto px-6 pt-16 md:pt-24 pb-12'>
        {/* Hero Section with Impact Statement */}
        <div className='bg-white rounded-2xl shadow-lg border border-purple-100 p-8 mb-12 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full -mr-16 -mt-16 opacity-50'></div>
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full -ml-12 -mb-12 opacity-50'></div>

          <div className='relative z-10'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl'>
                <Heart className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent'>
                  ERG Wellbeing Program
                </h1>
                <p className='text-gray-600 text-lg'>
                  Supporting your community's mental health needs
                </p>
              </div>
            </div>

            {/* Impact Highlights */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Sparkles className='w-5 h-5 text-yellow-500 mr-1' />
                  <span className='text-2xl font-bold text-purple-700'>2,840</span>
                </div>
                <p className='text-sm text-gray-600'>Sessions Completed</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <TrendingUp className='w-5 h-5 text-green-500 mr-1' />
                  <span className='text-2xl font-bold text-green-700'>87%</span>
                </div>
                <p className='text-sm text-gray-600'>Platform Adoption</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Users className='w-5 h-5 text-blue-500 mr-1' />
                  <span className='text-2xl font-bold text-blue-700'>650</span>
                </div>
                <p className='text-sm text-gray-600'>Active Participants</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-2'>
                  <Award className='w-5 h-5 text-purple-500 mr-1' />
                  <span className='text-2xl font-bold text-purple-700'>28</span>
                </div>
                <p className='text-sm text-gray-600'>Requesting More Credits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Overview Section */}
        <div className='mb-12'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg'>
              <Zap className='w-5 h-5 text-white' />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>Program Pulse</h2>
          </div>

          <div className='flex flex-col md:flex-row gap-8 items-stretch'>
            <ProgramOverviewSection />
            <div className='flex-1' />
            <EmployeeInsightsCard />
          </div>
        </div>

        <div className='space-y-16'>
          {/* Charts in a container */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg'>
                <TrendingUp className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-xl md:text-2xl font-bold text-gray-800'>
                  Analytics & Insights
                </h3>
                <p className='text-gray-600'>Data-driven view of your program's impact</p>
              </div>
            </div>
            <ChartsSections />
          </div>

          {/* Sessions with enhanced styling */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'>
                <Heart className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-xl md:text-2xl font-bold text-gray-800'>Session Activity</h3>
                <p className='text-gray-600'>Real-time view of employee engagement</p>
              </div>
            </div>
            <SessionsSection />
          </div>

          {/* Engagement with enhanced styling */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg'>
                <Sparkles className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-xl md:text-2xl font-bold text-gray-800'>Engagement Metrics</h3>
                <p className='text-gray-600'>
                  Understanding how employees connect with the platform
                </p>
              </div>
            </div>
            <EngagementSection />
          </div>
        </div>

        {/* Support Footer */}
        <div className='mt-16 bg-gray-50 rounded-2xl p-6 text-center border border-gray-200'>
          <h3 className='text-xl font-semibold text-gray-800 mb-2'>Need Help with Your Program?</h3>
          <p className='text-gray-600 mb-4'>
            Our team is here to support your ERG's mental health initiative
          </p>
          <button className='bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors'>
            Contact Support
          </button>
        </div>
      </main>
    </div>
  );
}
