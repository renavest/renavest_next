import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ready: false });
  }

  // Query the users table for the current user
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, userId),
  });

  if (user) {
    return NextResponse.json({ ready: true });
  }
  return NextResponse.json({ ready: false });
}
