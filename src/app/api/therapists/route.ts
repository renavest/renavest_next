import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export async function GET(request: Request) {
  try {
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

    return NextResponse.json({ therapists: results });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
