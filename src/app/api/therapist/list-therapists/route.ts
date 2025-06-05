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

    // Combine all therapists
    const allTherapists = [...activeTherapists, ...pendingTherapistsData];

    // Find Seth Morton and separate him from others
    const sethMorton = allTherapists.find((therapist) => therapist.name === 'Seth Morton');
    const otherTherapists = allTherapists.filter((therapist) => therapist.name !== 'Seth Morton');

    // Shuffle other therapists
    const shuffledOthers = otherTherapists.sort(() => Math.random() - 0.5);

    // Ensure Seth Morton is always included in the results
    let finalTherapists = [];
    if (sethMorton) {
      finalTherapists.push(sethMorton);
      // Add other therapists up to the limit
      finalTherapists.push(...shuffledOthers.slice(0, limit - 1));
    } else {
      // If Seth Morton is not found, just use other therapists
      finalTherapists = shuffledOthers.slice(0, limit);
    }

    // Map results to use the correct image URL
    const therapistsWithImageUrl = finalTherapists.map((therapist) => ({
      ...therapist,
      profileUrl: getTherapistImageUrl(therapist.profileUrl),
    }));

    return NextResponse.json({ therapists: therapistsWithImageUrl });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
