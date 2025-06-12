import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getTherapistByEmail, getClientsData } from '@/src/services/therapistDataService';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;

    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Use cached clients data
    const clientsData = await getClientsData(therapistLookup.therapistId);

    return NextResponse.json(clientsData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch clients',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
