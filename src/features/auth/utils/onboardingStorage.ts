import { OnboardingData } from '../types';

export const getOnboardingData = (): OnboardingData | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const data = localStorage.getItem('onboardingData');
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

export const setOnboardingData = (data: OnboardingData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('onboardingData', JSON.stringify(data));
  }
  return null;
};

export const clearOnboardingData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('onboardingData');
  }
};
