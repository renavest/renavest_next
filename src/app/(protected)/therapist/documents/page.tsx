import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';
import { DocumentsPage } from '@/src/features/therapist-dashboard/components/documents/DocumentsPage';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';

export default async function TherapistDocumentsPage() {
  const { userId, sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;

  if (!userId || metadata?.role !== 'therapist') {
    redirect('/login');
  }

  // Get user from database
  const userResult = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

  if (!userResult.length) {
    redirect('/login');
  }

  // Get therapist profile
  const therapistResult = await db
    .select()
    .from(therapists)
    .where(eq(therapists.userId, userResult[0].id))
    .limit(1);

  if (!therapistResult.length) {
    redirect('/therapist/onboarding');
  }

  return (
    <div className='min-h-screen bg-[#faf9f6]'>
      <TherapistNavbar
        pageTitle='Document Management'
        showBackButton={true}
        backButtonHref='/therapist'
      />

      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24'>
        <DocumentsPage />
      </div>
    </div>
  );
}
