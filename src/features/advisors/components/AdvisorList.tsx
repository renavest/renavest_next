'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';

import { Advisor } from '@/src/shared/types';

import { advisorSignal, isOpenSignal } from '../state/advisorSignals';

interface AdvisorListProps {
  advisors: Advisor[];
  filters?: {
    expertise?: string[];
    certifications?: string[];
    yearsOfExperience?: number;
  };
  searchQuery?: string;
}

export default function AdvisorList({ advisors, filters, searchQuery }: AdvisorListProps) {
  const [filteredAdvisors, setFilteredAdvisors] = useState<Advisor[]>(advisors);

  useEffect(() => {
    // Apply filters and search
    let filtered = advisors;

    if (searchQuery) {
      filtered = filtered.filter(
        (advisor) =>
          advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          advisor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          advisor.certifications.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      // Track search event
      posthog.capture('therapist_search', {
        search_query: searchQuery,
        results_count: filtered.length,
        total_advisors: advisors.length,
      });
    }

    if (filters) {
      if (filters.expertise?.length) {
        filtered = filtered.filter((advisor) =>
          filters.expertise?.some((exp) =>
            advisor.expertise.toLowerCase().includes(exp.toLowerCase()),
          ),
        );
      }

      if (filters.certifications?.length) {
        filtered = filtered.filter((advisor) =>
          filters.certifications?.some((cert) =>
            advisor.certifications.toLowerCase().includes(cert.toLowerCase()),
          ),
        );
      }

      if (filters.yearsOfExperience) {
        filtered = filtered.filter(
          (advisor) => parseInt(advisor.yoe) >= (filters.yearsOfExperience || 0),
        );
      }

      // Track filter application
      posthog.capture('therapist_filter_applied', {
        filters_applied: filters,
        results_count: filtered.length,
        total_advisors: advisors.length,
      });
    }

    setFilteredAdvisors(filtered);
  }, [advisors, filters, searchQuery]);

  const handleAdvisorClick = (advisor: Advisor) => {
    advisorSignal.value = advisor;
    isOpenSignal.value = true;

    // Track advisor selection
    posthog.capture('therapist_selected', {
      therapist_id: advisor.id,
      therapist_name: advisor.name,
      therapist_title: advisor.title,
      therapist_expertise: advisor.expertise,
      from_search: !!searchQuery,
      from_filters: !!filters,
    });
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {filteredAdvisors.map((advisor) => (
        <div
          key={advisor.id}
          className='cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors'
          onClick={() => handleAdvisorClick(advisor)}
        >
          {/* Advisor card content */}
        </div>
      ))}
    </div>
  );
}
