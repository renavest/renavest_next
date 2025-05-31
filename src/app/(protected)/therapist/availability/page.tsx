import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';
import { AvailabilityManagement } from '@/src/features/therapist-dashboard/components/availability-management/AvailabilityManagement';

export const metadata = {
  title: 'Availability Management - Renavest',
  description: 'Manage your availability and working hours',
};

export default async function AvailabilityPage() {
  // Check authentication
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Get the internal user record
  const userRecord = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

  if (userRecord.length === 0) {
    redirect('/onboarding');
  }

  const userRole = userRecord[0].role;

  // Ensure user is a therapist
  if (userRole !== 'therapist') {
    redirect('/client/dashboard');
  }

  // Get therapist record
  const therapistRecord = await db
    .select()
    .from(therapists)
    .where(eq(therapists.userId, userRecord[0].id))
    .limit(1);

  if (therapistRecord.length === 0) {
    redirect('/onboarding');
  }

  const therapistId = therapistRecord[0].id;

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar showBackButton={true} />

      <div className='mt-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Availability Management</h1>
          <p className='text-gray-600'>
            Manage your working hours, block time slots, and view your availability calendar.
          </p>
        </div>

        <AvailabilityManagement therapistId={therapistId} />
      </div>
    </div>
  );
}
