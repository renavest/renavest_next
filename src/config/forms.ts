// src/config/forms.ts
// Centralized form options and validation configurations

import { Scale, HeartPulse, Rocket, TrendingUp, CircleDollarSign, Ellipsis } from 'lucide-react';

// Onboarding form options
export const PURPOSE_OPTIONS = [
  {
    value: 'financial_stress_relief',
    label: 'Reduce financial stress and anxiety',
    icon: HeartPulse,
  },
  {
    value: 'emotional_money_relationship',
    label: 'Improve my relationship with money',
    icon: Scale,
  },
  {
    value: 'financial_confidence',
    label: 'Build financial confidence and security',
    icon: Rocket,
  },
  {
    value: 'financial_therapy_support',
    label: 'Get therapeutic support for money issues',
    icon: CircleDollarSign,
  },
  {
    value: 'workplace_financial_wellness',
    label: 'Access workplace financial wellness',
    icon: TrendingUp,
  },
  {
    value: 'other',
    label: 'Other',
    icon: Ellipsis,
  },
] as const;

export const AGE_RANGE_OPTIONS = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65+', label: '65+' },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'domestic_partnership', label: 'Domestic Partnership' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const ETHNICITY_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'black_african_american', label: 'Black or African American' },
  { value: 'hispanic_latino', label: 'Hispanic or Latino' },
  { value: 'asian', label: 'Asian' },
  { value: 'american_indian_alaska_native', label: 'American Indian or Alaska Native' },
  { value: 'native_hawaiian_pacific_islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'two_or_more_races', label: 'Two or more races' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// Type exports for form options
export type PurposeValue = typeof PURPOSE_OPTIONS[number]['value'];
export type AgeRangeValue = typeof AGE_RANGE_OPTIONS[number]['value'];
export type MaritalStatusValue = typeof MARITAL_STATUS_OPTIONS[number]['value'];
export type EthnicityValue = typeof ETHNICITY_OPTIONS[number]['value'];