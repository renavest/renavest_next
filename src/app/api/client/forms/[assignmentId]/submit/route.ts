import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { formAssignments, users } from '@/src/db/schema';

// POST /api/client/forms/[assignmentId]/submit - Submit form responses
export async function POST(request: NextRequest, { params }: { params: { assignmentId: string } }) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId } = params;
    const body = await request.json();
    const { responses } = body;

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: 'Invalid responses data' }, { status: 400 });
    }

    // Get user by Clerk ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clientId = user[0].id;

    // Verify the assignment belongs to this client and is still active
    const assignment = await db
      .select({
        id: formAssignments.id,
        status: formAssignments.status,
        expiresAt: formAssignments.expiresAt,
      })
      .from(formAssignments)
      .where(
        and(eq(formAssignments.id, parseInt(assignmentId)), eq(formAssignments.clientId, clientId)),
      )
      .limit(1);

    if (!assignment.length) {
      return NextResponse.json({ error: 'Form assignment not found' }, { status: 404 });
    }

    const currentAssignment = assignment[0];

    // Check if form is already completed
    if (currentAssignment.status === 'completed') {
      return NextResponse.json({ error: 'Form has already been completed' }, { status: 400 });
    }

    // Check if form has expired
    if (
      currentAssignment.status === 'expired' ||
      (currentAssignment.expiresAt && new Date() > currentAssignment.expiresAt)
    ) {
      return NextResponse.json({ error: 'Form has expired' }, { status: 400 });
    }

    // Update the assignment with responses and mark as completed
    const [updatedAssignment] = await db
      .update(formAssignments)
      .set({
        responses,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(formAssignments.id, parseInt(assignmentId)))
      .returning();

    return NextResponse.json(
      {
        message: 'Form submitted successfully',
        assignment: {
          id: updatedAssignment.id.toString(),
          status: updatedAssignment.status,
          completedAt: updatedAssignment.completedAt?.toISOString(),
          responses: updatedAssignment.responses,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
