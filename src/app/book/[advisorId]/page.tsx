import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { trackSessionSearch } from '@/src/app/api/track/calendly/route';
import { db } from '@/src/db';
import { therapists, users, pendingTherapists } from '@/src/db/schema';
import { hasRole } from '@/src/features/auth/utils/routerUtil';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

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

  // Check if user is a therapist and prevent self-booking
  if (hasRole(user, 'therapist')) {
    // Get the user's database record to find their therapist ID
    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id),
    });

    if (userRecord) {
      const therapistRecord = await db.query.therapists.findFirst({
        where: eq(therapists.userId, userRecord.id),
      });

      // If this is an active therapist trying to book themselves, redirect
      if (therapistRecord && !advisorId.startsWith('pending-')) {
        const targetTherapistId = parseInt(advisorId);
        if (therapistRecord.id === targetTherapistId) {
          redirect('/explore?error=cannot-book-self');
        }
      }
    }
  }

  let advisorData;

  // Check if this is a pending therapist (prefixed with "pending-")
  if (advisorId.startsWith('pending-')) {
    const pendingId = parseInt(advisorId.replace('pending-', ''));
    if (isNaN(pendingId)) {
      redirect('/explore');
    }

    // Fetch pending therapist data
    const pendingTherapist = await db.query.pendingTherapists.findFirst({
      where: eq(pendingTherapists.id, pendingId),
    });

    if (!pendingTherapist) {
      redirect('/explore');
    }

    advisorData = {
      id: advisorId, // Keep the full ID with prefix
      name: pendingTherapist.name,
      bookingURL: pendingTherapist.bookingURL || '',
      email: pendingTherapist.clerkEmail || undefined,
      profileUrl: getTherapistImageUrl(pendingTherapist.profileUrl),
      isPending: true,
    };

    // Track session search for pending therapist
    await trackSessionSearch({
      therapistId: advisorId,
      therapistName: pendingTherapist.name,
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress || '',
    });
  } else {
    // Handle active therapist
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

    advisorData = {
      id: therapist.id.toString(), // Use therapist ID
      name: therapist.name,
      bookingURL: therapist.bookingURL || '',
      email: therapistUser.email || undefined,
      profileUrl: getTherapistImageUrl(therapist.profileUrl),
      isPending: false,
    };

    // Track session search with correct IDs
    await trackSessionSearch({
      therapistId: therapist.id.toString(),
      therapistName: therapist.name,
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress || '',
    });
  }

  return (
    <UnifiedBookingFlow
      advisor={advisorData}
      userId={user.id}
      userEmail={user.emailAddresses[0]?.emailAddress || ''}
    />
  );
}
