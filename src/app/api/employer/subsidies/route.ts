import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, employers, employerSubsidies } from '@/src/db/schema';

// GET - Fetch subsidies
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const employerId = url.searchParams.get('employerId');
    const targetUserId = url.searchParams.get('userId');

    // Get the current user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserRole = userRecord[0].role;

    // Check permissions
    if (!['employer_admin', 'super_admin'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build where conditions
    const whereConditions = [];

    if (employerId) {
      whereConditions.push(eq(employerSubsidies.employerId, parseInt(employerId)));
    }

    if (targetUserId) {
      whereConditions.push(eq(employerSubsidies.userId, parseInt(targetUserId)));
    }

    // If user is employer_admin, only show subsidies for their employer
    if (currentUserRole === 'employer_admin') {
      const currentUserEmployerId = userRecord[0].employerId;
      if (!currentUserEmployerId) {
        return NextResponse.json(
          { error: 'Employer admin must be associated with an employer' },
          { status: 400 },
        );
      }
      whereConditions.push(eq(employerSubsidies.employerId, currentUserEmployerId));
    }

    // Simple query without complex joins to avoid TypeScript issues
    const subsidiesQuery = db.select().from(employerSubsidies).orderBy(employerSubsidies.createdAt);

    const subsidies =
      whereConditions.length > 0
        ? await subsidiesQuery.where(and(...whereConditions))
        : await subsidiesQuery;

    return NextResponse.json({ subsidies });
  } catch (error) {
    console.error('[SUBSIDIES API] Error fetching subsidies:', error);
    return NextResponse.json({ error: 'Failed to fetch subsidies' }, { status: 500 });
  }
}

// POST - Add subsidy
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { employerId, userId, creditAmountCents, reason, expiresAt } = body;

    if (!employerId || !userId || !creditAmountCents) {
      return NextResponse.json(
        { error: 'Employer ID, user ID, and credit amount are required' },
        { status: 400 },
      );
    }

    if (creditAmountCents <= 0) {
      return NextResponse.json({ error: 'Credit amount must be positive' }, { status: 400 });
    }

    // Get the current user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserRole = userRecord[0].role;

    // Check permissions
    if (!['employer_admin', 'super_admin'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // If user is employer_admin, ensure they can only add subsidies for their employer
    if (currentUserRole === 'employer_admin') {
      const currentUserEmployerId = userRecord[0].employerId;
      if (!currentUserEmployerId || currentUserEmployerId !== employerId) {
        return NextResponse.json(
          { error: 'Can only add subsidies for your own employer' },
          { status: 403 },
        );
      }
    }

    // Verify the employer exists
    const employer = await db.select().from(employers).where(eq(employers.id, employerId)).limit(1);

    if (employer.length === 0) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Verify the target user exists and is associated with the employer
    const targetUser = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.employerId, employerId)))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found or not associated with this employer' },
        { status: 404 },
      );
    }

    // Parse expiry date if provided
    let expiryDate: Date | null = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return NextResponse.json({ error: 'Invalid expiry date' }, { status: 400 });
      }
    }

    // Create the subsidy
    const newSubsidy = await db
      .insert(employerSubsidies)
      .values({
        employerId,
        userId,
        originalCents: creditAmountCents,
        remainingCents: creditAmountCents,
        reason: reason || 'Employer credit',
        expiresAt: expiryDate,
      })
      .returning();

    return NextResponse.json({
      success: true,
      subsidy: newSubsidy[0],
    });
  } catch (error) {
    console.error('[SUBSIDIES API] Error adding subsidy:', error);
    return NextResponse.json({ error: 'Failed to add subsidy' }, { status: 500 });
  }
}

// DELETE - Remove subsidy
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const subsidyId = url.searchParams.get('id');

    if (!subsidyId) {
      return NextResponse.json({ error: 'Subsidy ID is required' }, { status: 400 });
    }

    // Get the current user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUserRole = userRecord[0].role;

    // Check permissions
    if (!['employer_admin', 'super_admin'].includes(currentUserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the subsidy to verify ownership
    const subsidy = await db
      .select()
      .from(employerSubsidies)
      .where(eq(employerSubsidies.id, parseInt(subsidyId)))
      .limit(1);

    if (subsidy.length === 0) {
      return NextResponse.json({ error: 'Subsidy not found' }, { status: 404 });
    }

    // If user is employer_admin, ensure they can only delete subsidies for their employer
    if (currentUserRole === 'employer_admin') {
      const currentUserEmployerId = userRecord[0].employerId;
      if (!currentUserEmployerId || currentUserEmployerId !== subsidy[0].employerId) {
        return NextResponse.json(
          { error: 'Can only delete subsidies for your own employer' },
          { status: 403 },
        );
      }
    }

    // Delete the subsidy
    await db.delete(employerSubsidies).where(eq(employerSubsidies.id, parseInt(subsidyId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SUBSIDIES API] Error deleting subsidy:', error);
    return NextResponse.json({ error: 'Failed to delete subsidy' }, { status: 500 });
  }
}
