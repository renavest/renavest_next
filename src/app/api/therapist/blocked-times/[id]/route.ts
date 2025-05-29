import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists, therapistBlockedTimes } from '@/src/db/schema';

// DELETE - Remove a blocked time
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockedTimeId = parseInt(params.id);
    if (isNaN(blockedTimeId)) {
      return NextResponse.json({ error: 'Invalid blocked time ID' }, { status: 400 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);
    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Get the blocked time and verify ownership
    const blockedTimeResult = await db
      .select({
        id: therapistBlockedTimes.id,
        therapistId: therapistBlockedTimes.therapistId,
        therapistUserId: therapists.userId,
      })
      .from(therapistBlockedTimes)
      .leftJoin(therapists, eq(therapistBlockedTimes.therapistId, therapists.id))
      .where(eq(therapistBlockedTimes.id, blockedTimeId))
      .limit(1);

    if (blockedTimeResult.length === 0) {
      return NextResponse.json({ error: 'Blocked time not found' }, { status: 404 });
    }

    const blockedTime = blockedTimeResult[0];

    // Verify ownership
    if (blockedTime.therapistUserId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the blocked time
    await db.delete(therapistBlockedTimes).where(eq(therapistBlockedTimes.id, blockedTimeId));

    return NextResponse.json({
      success: true,
      message: 'Blocked time removed successfully',
    });
  } catch (error) {
    console.error('[DELETE BLOCKED TIME] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
