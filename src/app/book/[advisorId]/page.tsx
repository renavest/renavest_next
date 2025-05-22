import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { trackSessionSearch } from '@/src/app/api/track/calendly/route';
import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';

import UnifiedBookingFlow from '../../../features/booking/components/BookingFlow';

export default async function TherapistBookingPage({ params }: { params: { advisorId: string } }) {
  const { advisorId } = await params;

  // Validate and parse advisorId
  if (!advisorId) {
    redirect('/explore');
  }

  const user = await currentUser();
  if (!user) {
    redirect('/explore');
  }

  // Parse the advisor ID as therapist ID (from the enhanced marketplace flow)
  const therapistId = parseInt(advisorId);
  if (isNaN(therapistId)) {
    redirect('/explore');
  }

  // Fetch therapist data with user information
  const therapist = await db.query.therapists.findFirst({
    where: eq(therapists.id, therapistId),
    with: {
      user: true, // Get the associated user data
    },
  });

  if (!therapist) {
    redirect('/explore');
  }

  // Get the user data for the therapist
  const therapistUser = await db.query.users.findFirst({
    where: eq(users.id, therapist.userId),
  });

  if (!therapistUser) {
    redirect('/explore');
  }

  // Prepare advisor data for the booking flow
  const advisorData = {
    id: therapist.id.toString(), // Use therapist ID
    name: therapist.name,
    bookingURL: therapist.bookingURL || '',
    email: therapistUser.email || undefined,
    profileUrl: therapist.profileUrl || undefined,
  };

  // Track session search with correct IDs
  await trackSessionSearch({
    therapistId: therapist.id.toString(),
    therapistName: therapist.name,
    userId: user.id,
    userEmail: user.emailAddresses[0]?.emailAddress || '',
  });

  return (
    <UnifiedBookingFlow
      advisor={advisorData}
      userId={user.id}
      userEmail={user.emailAddresses[0]?.emailAddress || ''}
    />
  );
}
