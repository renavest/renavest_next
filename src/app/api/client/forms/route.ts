import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { formAssignments, intakeForms, therapists, users } from '@/src/db/schema';

// GET /api/client/forms - Get all form assignments for the authenticated client
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get all form assignments for this client with form and therapist details
    const assignments = await db
      .select({
        id: formAssignments.id,
        formId: formAssignments.formId,
        formTitle: intakeForms.title,
        formDescription: intakeForms.description,
        fields: intakeForms.fields,
        status: formAssignments.status,
        sentAt: formAssignments.sentAt,
        completedAt: formAssignments.completedAt,
        expiresAt: formAssignments.expiresAt,
        responses: formAssignments.responses,
        therapistFirstName: users.firstName,
        therapistLastName: users.lastName,
      })
      .from(formAssignments)
      .innerJoin(intakeForms, eq(intakeForms.id, formAssignments.formId))
      .innerJoin(therapists, eq(therapists.id, formAssignments.therapistId))
      .innerJoin(users, eq(users.id, therapists.userId))
      .where(eq(formAssignments.clientId, clientId))
      .orderBy(desc(formAssignments.sentAt));

    // Transform the data to match the client interface
    const transformedAssignments = assignments.map((assignment) => ({
      id: assignment.id.toString(),
      formId: assignment.formId.toString(),
      formTitle: assignment.formTitle,
      formDescription: assignment.formDescription,
      fields: assignment.fields,
      status: assignment.status,
      sentAt: assignment.sentAt.toISOString(),
      completedAt: assignment.completedAt?.toISOString(),
      expiresAt: assignment.expiresAt?.toISOString(),
      responses: assignment.responses,
      therapistName:
        `${assignment.therapistFirstName || ''} ${assignment.therapistLastName || ''}`.trim(),
    }));

    return NextResponse.json({ assignments: transformedAssignments });
  } catch (error) {
    console.error('Error fetching client form assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
