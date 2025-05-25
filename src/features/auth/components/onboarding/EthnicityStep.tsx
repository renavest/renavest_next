// src/features/auth/components/onboarding/EthnicityStep.tsx
'use client';

import React from 'react';

import { selectedEthnicity, firstName, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const ethnicityOptions = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Two or More Races',
  'Other',
  'Prefer not to answer',
];

export function EthnicityStep() {
  const handleEthnicitySelect = (ethnicity: string) => {
    selectedEthnicity.value = ethnicity;
  };
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEthnicity.value) {
      currentStep.value = OnboardingStep.PRIVACY_PLEDGE;
    }
  };
  const handleBack = () => {
    currentStep.value = OnboardingStep.MARITAL_STATUS;
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          What's your ethnicity, {firstName.value}?
        </h2>
        <p className='text-sm text-gray-600 text-center'>
          This information helps us better serve our diverse community. Your privacy is important to
          us.
        </p>
      </div>
      {/* Use a form for semantic grouping and easier submission handling */}
      <form onSubmit={handleContinue} className='space-y-4'>
        {/* Ethnicity options */}
        <div className='space-y-3'>
          {ethnicityOptions.map((ethnicity) => (
            <label
              key={ethnicity}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedEthnicity.value === ethnicity
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type='radio'
                name='ethnicity'
                value={ethnicity}
                checked={selectedEthnicity.value === ethnicity}
                onChange={() => handleEthnicitySelect(ethnicity)}
                className='sr-only' // Hide the default radio button
              />
              <div
                className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedEthnicity.value === ethnicity
                    ? 'border-gray-600 bg-gray-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedEthnicity.value === ethnicity && (
                  <div className='w-2 h-2 rounded-full bg-white'></div>
                )}
              </div>
              <span className='text-gray-900 font-medium'>{ethnicity}</span>
            </label>
          ))}
        </div>

        {/* Continue button */}
        <button
          type='submit'
          disabled={!selectedEthnicity.value}
          className={`w-full py-3 px-6 rounded-full shadow-md text-sm font-medium transition-all duration-300 ease-in-out transform ${
            selectedEthnicity.value
              ? 'text-white bg-black hover:bg-gray-800 hover:scale-105'
              : 'text-gray-400 bg-gray-200 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </form>

      {/* Navigation buttons */}
      <div className='flex justify-between items-center mt-6'>
        <button
          type='button'
          onClick={handleBack}
          className='text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200'
        >
          ← Back
        </button>
        <button
          type='button'
          onClick={handleBackToLogin}
          className='text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200'
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
