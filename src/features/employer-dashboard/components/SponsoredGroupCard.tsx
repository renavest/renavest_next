'use client';

import { Users, TrendingUp, CreditCard, Link, Copy, Heart } from 'lucide-react';
import { useState } from 'react';

import { generateSponsoredGroupSignupURL } from '@/src/features/auth/utils/urlParamUtil';

import {
  getGroupTypeColor,
  getGroupTypeIcon,
  getProgressBarStyle,
  getEncouragementMessage,
} from './SponsoredGroupUtils';

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

interface SponsoredGroupCardProps {
  group: SponsoredGroup;
}

export function SponsoredGroupCard({ group }: SponsoredGroupCardProps) {
  const [copiedGroupId, setCopiedGroupId] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopySignupLink = async (group: SponsoredGroup) => {
    try {
      const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
      const signupURL = generateSponsoredGroupSignupURL(baseURL, group.name);

      await navigator.clipboard.writeText(signupURL);
      setCopiedGroupId(group.id);

      setTimeout(() => setCopiedGroupId(null), 2000);
    } catch (error) {
      console.error('Failed to copy signup link:', error);
      const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
      const signupURL = generateSponsoredGroupSignupURL(baseURL, group.name);
      alert(`Signup link: ${signupURL}`);
    }
  };

  const utilizationPercentage =
    group.allocatedSessionCredits > 0
      ? Math.round(
          ((group.allocatedSessionCredits - group.remainingSessionCredits) /
            group.allocatedSessionCredits) *
            100,
        )
      : 0;

  const encouragement = getEncouragementMessage(utilizationPercentage);

  return (
    <div
      className={`p-6 transition-all duration-300 ease-in-out transform ${
        isHovered
          ? 'bg-gradient-to-r from-purple-50 to-pink-50 scale-[1.01] shadow-lg'
          : 'bg-white hover:bg-gray-50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='flex items-center gap-2'>
              <h4 className='text-lg font-semibold text-gray-900 group-hover:text-purple-800 transition-colors'>
                {group.name}
              </h4>
              {group.memberCount > 0 && (
                <div className='flex items-center text-purple-600'>
                  <Heart className='w-4 h-4 fill-current' />
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 mb-3'>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                group.isActive
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {group.isActive ? '🟢 Active' : '⚪ Inactive'}
            </span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getGroupTypeColor(group.groupType)}`}
            >
              {getGroupTypeIcon(group.groupType)}
              <span className='capitalize'>{group.groupType.replace('_', ' ')}</span>
            </span>
          </div>

          {group.description && (
            <p className='text-gray-600 mb-4 leading-relaxed'>{group.description}</p>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div className='flex items-center gap-2 text-purple-700 bg-purple-50 rounded-lg px-3 py-2'>
              <Users className='w-4 h-4 text-purple-600' />
              <span className='font-medium'>{group.memberCount}</span>
              <span className='text-purple-600'>members</span>
            </div>
            <div className='flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg px-3 py-2'>
              <CreditCard className='w-4 h-4 text-blue-600' />
              <span className='font-medium'>{group.remainingSessionCredits}</span>
              <span className='text-blue-600'>of {group.allocatedSessionCredits} credits</span>
            </div>
            <div className='flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2'>
              <TrendingUp className='w-4 h-4 text-green-600' />
              <span className='font-medium'>{utilizationPercentage}%</span>
              <span className='text-green-600'>utilized</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 ml-6'>
          <button
            onClick={() => handleCopySignupLink(group)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
              copiedGroupId === group.id
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:scale-105 hover:shadow-md'
            }`}
            title='Copy signup link for this group'
          >
            {copiedGroupId === group.id ? (
              <>
                <Copy className='w-4 h-4' />
                <span>Copied! ✨</span>
              </>
            ) : (
              <>
                <Link className='w-4 h-4' />
                <span>Copy Link</span>
              </>
            )}
          </button>
          <button className='px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:scale-105 transition-all duration-200'>
            View Details
          </button>
          <button className='px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200'>
            Manage Credits
          </button>
        </div>
      </div>

      {/* Enhanced Progress Bar with Emotional Design */}
      <div className='mt-6'>
        <div className='flex justify-between items-center text-sm text-gray-600 mb-2'>
          <span className='font-medium'>Session Credits Progress</span>
          <span className='text-gray-500'>
            {group.allocatedSessionCredits - group.remainingSessionCredits} of{' '}
            {group.allocatedSessionCredits} used
          </span>
        </div>
        <div className='relative w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
          <div
            className={`h-3 rounded-full transition-all duration-700 ease-out ${getProgressBarStyle(utilizationPercentage)}`}
            style={{
              width: `${utilizationPercentage}%`,
              boxShadow: utilizationPercentage > 0 ? '0 0 8px rgba(156, 113, 255, 0.3)' : 'none',
            }}
          >
            {utilizationPercentage > 20 && (
              <div className='absolute inset-0 bg-white bg-opacity-20 rounded-full animate-pulse' />
            )}
          </div>
          {utilizationPercentage > 0 && (
            <div className='absolute right-2 top-0.5 text-xs text-white font-medium'>
              {utilizationPercentage}%
            </div>
          )}
        </div>

        <div className='mt-3 text-xs text-center'>
          <span className={`${encouragement.className} px-3 py-1 rounded-full`}>
            {encouragement.message}
          </span>
        </div>
      </div>
    </div>
  );
}
