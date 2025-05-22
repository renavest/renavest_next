import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { trackSessionSearch } from '@/src/app/api/track/calendly/route';
import { db } from '@/src/db';
import { therapists, users, pendingTherapists } from '@/src/db/schema';

import UnifiedBookingFlow from '../../../features/booking/components/BookingFlow';

export default async function TherapistCalendlyPage({ params }: { params: { advisorId: string } }) {
  const { advisorId } = await params;
  // Validate and parse advisorId
  if (!advisorId) {
    redirect('/explore');
  }

  const user = await currentUser();
  if (!user) {
    redirect('/explore');
  }
  // Fetch therapist data server-side
  let therapistUser = await db.query.users.findFirst({
    where: eq(users.id, parseInt(advisorId)),
  });
  let therapist = await db.query.therapists.findFirst({
    where: eq(therapists.userId, therapistUser?.id || 0),
  });
  let pendingTherapist = await db.query.pendingTherapists.findFirst({
    where: eq(pendingTherapists.id, parseInt(advisorId)),
  });

  // If found in pendingTherapists, use that for bookingURL and details
  let advisorData;
  if (pendingTherapist) {
    advisorData = {
      id: pendingTherapist.id.toString(),
      name: pendingTherapist.name,
      bookingURL: pendingTherapist.bookingURL || '',
      email: user.emailAddresses[0]?.emailAddress || undefined,
      profileUrl: pendingTherapist.profileUrl || undefined,
    };
  } else if (therapist && therapistUser) {
    advisorData = {
      id: therapist.id.toString(),
      name: therapist.name,
      bookingURL: therapist.bookingURL || '',
      email: therapistUser.email || undefined,
      profileUrl: therapist.profileUrl || undefined,
    };
  } else {
    redirect('/explore');
  }

  // Track session search
  await trackSessionSearch({
    therapistId: advisorData.id,
    therapistName: advisorData.name,
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
