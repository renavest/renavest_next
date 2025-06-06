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

    // First, try to get Seth Morton specifically
    const sethMortonActive = await db
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
      .where(
        and(
          isNotNull(therapists.profileUrl),
          sql`${therapists.profileUrl} != ''`,
          sql`${therapists.name} = 'Seth Morton'`,
        ),
      )
      .limit(1);

    const sethMortonPending = await db
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
        and(
          isNotNull(pendingTherapists.profileUrl),
          sql`${pendingTherapists.profileUrl} != ''`,
          sql`${pendingTherapists.name} = 'Seth Morton'`,
        ),
      )
      .limit(1);

    const sethMorton = [...sethMortonActive, ...sethMortonPending][0];

    // Calculate how many other therapists we need
    const remainingLimit = sethMorton ? Math.max(0, limit - 1) : limit;

    // Fetch other active therapists (excluding Seth Morton)
    const otherActiveTherapists = await db
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
      .where(
        and(
          isNotNull(therapists.profileUrl),
          sql`${therapists.profileUrl} != ''`,
          sql`${therapists.name} != 'Seth Morton'`,
        ),
      )
      .limit(remainingLimit);

    // Fetch other pending therapists (excluding Seth Morton)
    const otherPendingTherapists = await db
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
        and(
          isNotNull(pendingTherapists.profileUrl),
          sql`${pendingTherapists.profileUrl} != ''`,
          sql`${pendingTherapists.name} != 'Seth Morton'`,
        ),
      )
      .limit(remainingLimit);

    // Combine other therapists and shuffle them
    const otherTherapists = [...otherActiveTherapists, ...otherPendingTherapists];
    const shuffledOthers = otherTherapists.sort(() => Math.random() - 0.5);
    const limitedOthers = shuffledOthers.slice(0, remainingLimit);

    // Build final result with Seth Morton first (if available)
    const finalTherapists = [];
    if (sethMorton) {
      finalTherapists.push(sethMorton);
    }
    finalTherapists.push(...limitedOthers);

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
