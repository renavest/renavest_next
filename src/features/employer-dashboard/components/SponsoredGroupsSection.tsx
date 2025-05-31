'use client';

import { Users, Sparkles, Heart, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

import MetricCard from '@/src/shared/components/MetricCard';

import { SponsoredGroupCard } from './SponsoredGroupCard';

interface SponsoredGroup {
  id: number;
  name: string;
  groupType: string;
  description: string;
  memberCount: number;
  allocatedSessionCredits: number;
  remainingSessionCredits: number;
  isActive: boolean;
  createdAt: string;
}

export function SponsoredGroupsSection() {
  const [sponsoredGroups, setSponsoredGroups] = useState<SponsoredGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSponsoredGroups();
  }, []);

  const fetchSponsoredGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employer/sponsored-groups');

      if (!response.ok) {
        throw new Error('Failed to fetch sponsored groups');
      }

      const data = await response.json();
      setSponsoredGroups(data.sponsoredGroups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const totalGroups = sponsoredGroups.length;
  const totalMembers = sponsoredGroups.reduce((sum, group) => sum + group.memberCount, 0);
  const totalCreditsAllocated = sponsoredGroups.reduce(
    (sum, group) => sum + group.allocatedSessionCredits,
    0,
  );
  const totalCreditsRemaining = sponsoredGroups.reduce(
    (sum, group) => sum + group.remainingSessionCredits,
    0,
  );
  const creditsUtilization =
    totalCreditsAllocated > 0
      ? Math.round(((totalCreditsAllocated - totalCreditsRemaining) / totalCreditsAllocated) * 100)
      : 0;

  if (loading) {
    return (
      <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 shadow-sm'>
        <div className='animate-pulse'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-8 w-8 bg-purple-200 rounded-full'></div>
            <div className='h-6 bg-purple-200 rounded w-48'></div>
          </div>
          <div className='space-y-4'>
            <div className='h-4 bg-purple-200 rounded w-full'></div>
            <div className='h-4 bg-purple-200 rounded w-3/4'></div>
            <div className='h-4 bg-purple-200 rounded w-1/2'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200 shadow-sm'>
        <div className='text-center'>
          <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
            <span className='text-2xl'>😔</span>
          </div>
          <h3 className='text-lg font-semibold text-red-700 mb-2'>Oops! Something went wrong</h3>
          <p className='text-red-600 mb-6'>{error}</p>
          <button
            onClick={fetchSponsoredGroups}
            className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg'
          >
            ✨ Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Enhanced Overview Metrics with Emotional Design */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <MetricCard
          title='Active Sponsored Groups'
          value={totalGroups.toString()}
          subtitle='Empowering teams together'
          className='bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
          titleClassName='text-purple-700 font-semibold'
          valueClassName='text-purple-800 text-3xl font-bold'
          subtitleClassName='text-purple-600'
        />

        <MetricCard
          title='Total Members'
          value={totalMembers.toString()}
          subtitle="Lives we're transforming"
          className='bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
          titleClassName='text-green-700 font-semibold'
          valueClassName='text-green-800 text-3xl font-bold'
          subtitleClassName='text-green-600'
        />

        <MetricCard
          title='Credits Utilization'
          value={`${creditsUtilization}%`}
          subtitle={`${totalCreditsRemaining} of ${totalCreditsAllocated} remaining`}
          className='bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-md rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1'
          titleClassName='text-blue-700 font-semibold'
          valueClassName='text-blue-800 text-3xl font-bold'
          subtitleClassName='text-blue-600'
        />
      </div>

      {/* Sponsored Groups List with Enhanced Emotional Design */}
      <div className='bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden'>
        <div className='px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-full'>
              <Heart className='w-5 h-5' />
            </div>
            <h3 className='text-xl font-bold'>Sponsored Groups</h3>
          </div>
          <p className='text-purple-100 leading-relaxed'>
            Nurture your organization's sponsored groups and celebrate their wellness journey
          </p>
        </div>

        {sponsoredGroups.length === 0 ? (
          <div className='p-12 text-center bg-gradient-to-br from-gray-50 to-purple-50'>
            <div className='mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg'>
              <div className='relative'>
                <Users className='w-8 h-8 text-purple-600' />
                <Sparkles className='w-4 h-4 text-pink-500 absolute -top-1 -right-1 animate-pulse' />
              </div>
            </div>
            <h4 className='text-xl font-bold text-gray-800 mb-3'>
              Ready to Begin Something Beautiful? ✨
            </h4>
            <p className='text-gray-600 mb-6 max-w-md mx-auto leading-relaxed'>
              Your sponsored groups will bloom here when employees join through their personalized
              signup links. Each group represents a community growing stronger together.
            </p>
            <div className='inline-flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-full text-sm font-medium'>
              <TrendingUp className='w-4 h-4' />
              <span>Great things are coming! 🌟</span>
            </div>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {sponsoredGroups.map((group, index) => (
              <div
                key={group.id}
                className='opacity-0 animate-fade-in-up'
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <SponsoredGroupCard group={group} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
