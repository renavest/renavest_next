'use client';

import TherapistProfileCard from '@/src/features/therapist-dashboard/components/profile/TherapistProfileCard';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

export default function ProfilePage() {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar pageTitle='Profile' showBackButton={true} backButtonHref='/therapist' />
      <div className='max-w-2xl mx-auto mt-10'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Your Profile</h2>
        <TherapistProfileCard />
      </div>
    </div>
  );
}
