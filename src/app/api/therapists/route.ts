import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
