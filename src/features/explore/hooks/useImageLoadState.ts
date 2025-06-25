import React from 'react';

import { ImageLoadState } from '../types';
import {
  advisorImageLoadingSignal,
  advisorImageErrorSignal,
  advisorActions,
} from '../state/exploreState';

/**
 * Custom hook for managing image loading state per advisor
 *
 * This hook provides a clean interface for tracking image loading and error states
 * for individual advisors, preventing flickering and providing consistent UX.
 *
 * @param advisorId - Unique identifier for the advisor
 * @returns Object with image state and event handlers
 */
export function useImageLoadState(advisorId: string) {
  // Initialize loading state immediately if not set
  React.useMemo(() => {
    if (advisorImageLoadingSignal.value[advisorId] === undefined) {
      advisorActions.setImageLoading(advisorId, true);
    }
  }, [advisorId]);

  // Get current state from signals with proper fallbacks
  const isLoading = advisorImageLoadingSignal.value[advisorId] !== false;
  const hasError = advisorImageErrorSignal.value[advisorId] || false;
  const isLoaded = !isLoading && !hasError;

  /**
   * Handle successful image load
   */
  const handleImageLoad = React.useCallback(() => {
    advisorActions.setImageLoading(advisorId, false);
    advisorActions.setImageError(advisorId, false);
  }, [advisorId]);

  /**
   * Handle image load error
   */
  const handleImageError = React.useCallback(() => {
    advisorActions.setImageLoading(advisorId, false);
    advisorActions.setImageError(advisorId, true);
  }, [advisorId]);

  const imageLoadState: ImageLoadState = {
    isLoaded,
    hasError,
    isLoading,
  };

  return {
    imageLoadState,
    handleImageLoad,
    handleImageError,
  };
}
