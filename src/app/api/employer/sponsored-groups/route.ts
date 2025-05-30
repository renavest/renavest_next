import { currentUser } from '@clerk/nextjs/server';
import { eq, and, count } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, sponsoredGroups, sponsoredGroupMembers } from '@/src/db/schema';

export async function GET(_req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the internal user record and verify they're an employer_admin
    const userRecord = await db
      .select({
        id: users.id,
        role: users.role,
        employerId: users.employerId,
      })
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserRecord = userRecord[0];

    if (currentUserRecord.role !== 'employer_admin') {
      return NextResponse.json(
        {
          error: 'Access denied. Employer admin role required.',
        },
        { status: 403 },
      );
    }

    if (!currentUserRecord.employerId) {
      return NextResponse.json(
        {
          error: 'No employer associated with this admin account',
        },
        { status: 400 },
      );
    }

    // Get sponsored groups for this employer with member counts
    const groupsWithMembers = await db
      .select({
        id: sponsoredGroups.id,
        name: sponsoredGroups.name,
        groupType: sponsoredGroups.groupType,
        description: sponsoredGroups.description,
        allocatedSessionCredits: sponsoredGroups.allocatedSessionCredits,
        remainingSessionCredits: sponsoredGroups.remainingSessionCredits,
        isActive: sponsoredGroups.isActive,
        createdAt: sponsoredGroups.createdAt,
        updatedAt: sponsoredGroups.updatedAt,
        memberCount: count(sponsoredGroupMembers.id),
      })
      .from(sponsoredGroups)
      .leftJoin(
        sponsoredGroupMembers,
        and(
          eq(sponsoredGroups.id, sponsoredGroupMembers.groupId),
          eq(sponsoredGroupMembers.isActive, true),
        ),
      )
      .where(eq(sponsoredGroups.employerId, currentUserRecord.employerId))
      .groupBy(
        sponsoredGroups.id,
        sponsoredGroups.name,
        sponsoredGroups.groupType,
        sponsoredGroups.description,
        sponsoredGroups.allocatedSessionCredits,
        sponsoredGroups.remainingSessionCredits,
        sponsoredGroups.isActive,
        sponsoredGroups.createdAt,
        sponsoredGroups.updatedAt,
      )
      .orderBy(sponsoredGroups.createdAt);

    // Format the response
    const formattedGroups = groupsWithMembers.map((group) => ({
      id: group.id,
      name: group.name,
      groupType: group.groupType,
      description: group.description || '',
      memberCount: group.memberCount || 0,
      allocatedSessionCredits: group.allocatedSessionCredits,
      remainingSessionCredits: group.remainingSessionCredits,
      isActive: group.isActive,
      createdAt: group.createdAt.toISOString(),
      creditsUsed: group.allocatedSessionCredits - group.remainingSessionCredits,
      utilizationRate:
        group.allocatedSessionCredits > 0
          ? Math.round(
              ((group.allocatedSessionCredits - group.remainingSessionCredits) /
                group.allocatedSessionCredits) *
                100,
            )
          : 0,
    }));

    // Calculate summary statistics
    const totalGroups = formattedGroups.length;
    const totalMembers = formattedGroups.reduce((sum, group) => sum + group.memberCount, 0);
    const totalCreditsAllocated = formattedGroups.reduce(
      (sum, group) => sum + group.allocatedSessionCredits,
      0,
    );
    const totalCreditsRemaining = formattedGroups.reduce(
      (sum, group) => sum + group.remainingSessionCredits,
      0,
    );
    const totalCreditsUsed = totalCreditsAllocated - totalCreditsRemaining;
    const overallUtilization =
      totalCreditsAllocated > 0 ? Math.round((totalCreditsUsed / totalCreditsAllocated) * 100) : 0;

    return NextResponse.json({
      success: true,
      sponsoredGroups: formattedGroups,
      summary: {
        totalGroups,
        totalMembers,
        totalCreditsAllocated,
        totalCreditsRemaining,
        totalCreditsUsed,
        overallUtilization,
      },
    });
  } catch (error) {
    console.error('[EMPLOYER SPONSORED GROUPS API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sponsored groups',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// POST - Create a new sponsored group (future enhancement)
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the internal user record and verify they're an employer_admin
    const userRecord = await db
      .select({
        id: users.id,
        role: users.role,
        employerId: users.employerId,
      })
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserRecord = userRecord[0];

    if (currentUserRecord.role !== 'employer_admin') {
      return NextResponse.json(
        {
          error: 'Access denied. Employer admin role required.',
        },
        { status: 403 },
      );
    }

    if (!currentUserRecord.employerId) {
      return NextResponse.json(
        {
          error: 'No employer associated with this admin account',
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name, groupType, description, allocatedSessionCredits } = body;

    if (!name || !groupType) {
      return NextResponse.json(
        {
          error: 'Name and group type are required',
        },
        { status: 400 },
      );
    }

    // Create the sponsored group
    const [newGroup] = await db
      .insert(sponsoredGroups)
      .values({
        employerId: currentUserRecord.employerId,
        name,
        groupType,
        description: description || `Sponsored group: ${name}`,
        allocatedSessionCredits: allocatedSessionCredits || 10,
        remainingSessionCredits: allocatedSessionCredits || 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      sponsoredGroup: {
        id: newGroup.id,
        name: newGroup.name,
        groupType: newGroup.groupType,
        description: newGroup.description,
        allocatedSessionCredits: newGroup.allocatedSessionCredits,
        remainingSessionCredits: newGroup.remainingSessionCredits,
        isActive: newGroup.isActive,
        createdAt: newGroup.createdAt.toISOString(),
        memberCount: 0,
      },
    });
  } catch (error) {
    console.error('[EMPLOYER SPONSORED GROUPS API] Error creating group:', error);
    return NextResponse.json(
      {
        error: 'Failed to create sponsored group',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
