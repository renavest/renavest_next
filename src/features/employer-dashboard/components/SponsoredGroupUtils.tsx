import { Heart, Sparkles, Users } from 'lucide-react';
import React from 'react';

/**
 * Utility functions for sponsored group styling and emotional design
 */

export const getGroupTypeColor = (type: string): string => {
  switch (type) {
    case 'erg':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'department':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'wellness_cohort':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getGroupTypeIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'erg':
      return <Heart className='w-3 h-3' />;
    case 'wellness_cohort':
      return <Sparkles className='w-3 h-3' />;
    default:
      return <Users className='w-3 h-3' />;
  }
};

export const getProgressBarStyle = (utilizationPercentage: number): string => {
  if (utilizationPercentage > 80) {
    return 'bg-gradient-to-r from-orange-400 to-red-500';
  } else if (utilizationPercentage > 50) {
    return 'bg-gradient-to-r from-yellow-400 to-orange-500';
  } else {
    return 'bg-gradient-to-r from-purple-500 to-pink-500';
  }
};

export interface EncouragementMessage {
  message: string;
  className: string;
}

export const getEncouragementMessage = (utilizationPercentage: number): EncouragementMessage => {
  if (utilizationPercentage === 0) {
    return {
      message: '🌟 Ready to help your team grow!',
      className: 'text-purple-600 bg-purple-50',
    };
  } else if (utilizationPercentage > 0 && utilizationPercentage < 50) {
    return {
      message: '💚 Great start! Your team is engaging with wellness.',
      className: 'text-green-600 bg-green-50',
    };
  } else if (utilizationPercentage >= 50 && utilizationPercentage < 80) {
    return {
      message: '🎯 Excellent engagement! Consider adding more credits.',
      className: 'text-blue-600 bg-blue-50',
    };
  } else {
    return {
      message: '⚡ High utilization! Time to replenish credits.',
      className: 'text-orange-600 bg-orange-50',
    };
  }
};
