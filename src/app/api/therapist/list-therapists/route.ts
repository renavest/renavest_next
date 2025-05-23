import { auth } from '@clerk/nextjs/server';
import { isNotNull, sql, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, pendingTherapists } from '@/src/db/schema';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '2', 10);

    // Fetch active therapists
    const activeTherapists = await db
      .select({
        id: therapists.id,
        name: therapists.name,
        title: therapists.title,
        profileUrl: therapists.profileUrl,
        previewBlurb: therapists.previewBlurb,
        bookingURL: therapists.bookingURL,
        isPending: sql<boolean>`false`,
      })
      .from(therapists)
      .where(and(isNotNull(therapists.profileUrl), sql`${therapists.profileUrl} != ''`));

    // Fetch pending therapists
    const pendingTherapistsData = await db
      .select({
        id: pendingTherapists.id,
        name: pendingTherapists.name,
        title: pendingTherapists.title,
        profileUrl: pendingTherapists.profileUrl,
        previewBlurb: pendingTherapists.previewBlurb,
        bookingURL: pendingTherapists.bookingURL,
        isPending: sql<boolean>`true`,
      })
      .from(pendingTherapists)
      .where(
        and(isNotNull(pendingTherapists.profileUrl), sql`${pendingTherapists.profileUrl} != ''`),
      );

    // Combine and shuffle the results
    const allTherapists = [...activeTherapists, ...pendingTherapistsData];
    const shuffledTherapists = allTherapists.sort(() => Math.random() - 0.5);
    const limitedTherapists = shuffledTherapists.slice(0, limit);

    // Map results to use the correct image URL
    const therapistsWithImageUrl = limitedTherapists.map((therapist) => ({
      ...therapist,
      profileUrl: getTherapistImageUrl(therapist.profileUrl),
    }));

    return NextResponse.json({ therapists: therapistsWithImageUrl });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
