import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { trackSessionSearch } from '@/src/app/api/track/calendly/route';
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

import UnifiedBookingFlow from './BookingFlow';

export default async function TherapistCalendlyPage({ params }: { params: { advisorId: string } }) {
  const { advisorId } = await params;
  // Validate and parse advisorId
  if (!advisorId) {
    redirect('/explore');
  }

  const user = await currentUser();

  // Fetch therapist data server-side
  const advisor = await db.query.therapists.findFirst({
    where: eq(therapists.id, parseInt(advisorId)),
  });

  // Redirect if no user or advisor
  if (!user || !advisor?.id || !advisor?.bookingURL) {
    redirect('/explore');
  }

  // Track session search
  await trackSessionSearch({
    therapistId: advisor.id.toString(),
    therapistName: advisor.name,
    userId: user.id,
    userEmail: user.emailAddresses[0]?.emailAddress || '',
  });

  return (
    <UnifiedBookingFlow
      advisor={{
        id: advisor.id.toString(),
        name: advisor.name,
        bookingURL: advisor.bookingURL,
      }}
      userId={user.id}
      userEmail={user.emailAddresses[0]?.emailAddress || ''}
    />
  );
}
