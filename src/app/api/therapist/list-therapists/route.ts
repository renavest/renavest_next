import { auth } from '@clerk/nextjs/server';
import { isNotNull, sql, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Only fetch full user if needed (not needed here, so skip currentUser)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '2', 10);
    const results = await db
      .select({
        id: therapists.id,
        name: therapists.name,
        title: therapists.title,
        profileUrl: therapists.profileUrl,
        previewBlurb: therapists.previewBlurb,
      })
      .from(therapists)
      .where(and(isNotNull(therapists.profileUrl), sql`${therapists.profileUrl} != ''`))
      .limit(limit);

    // Map results to use the correct image URL
    const therapistsWithImageUrl = results.map((therapist) => ({
      ...therapist,
      profileUrl: getTherapistImageUrl(therapist.profileUrl),
    }));

    return NextResponse.json({ therapists: therapistsWithImageUrl });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
