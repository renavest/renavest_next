import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

import { db } from '@/src/db';
import { formAssignments, intakeForms, therapists, users } from '@/src/db/schema';
import { invalidateOnFormAssignmentChange } from '@/src/services/clientFormsDataService';

// POST /api/therapist/forms/assign - Assign a form to a client
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get therapist by user ID
    const therapist = await db
      .select({ id: therapists.id })
      .from(therapists)
      .innerJoin(users, eq(users.id, therapists.userId))
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!therapist.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const therapistId = therapist[0].id;
    const body = await request.json();

    const { formId, clientId, expiresInDays } = body;

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Verify the form belongs to this therapist
    const form = await db
      .select({ id: intakeForms.id })
      .from(intakeForms)
      .where(and(eq(intakeForms.id, parseInt(formId)), eq(intakeForms.therapistId, therapistId)))
      .limit(1);

    if (!form.length) {
      return NextResponse.json({ error: 'Form not found or not accessible' }, { status: 404 });
    }

    // Verify the client exists
    const client = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, parseInt(clientId)))
      .limit(1);

    if (!client.length) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await db
      .select({ id: formAssignments.id })
      .from(formAssignments)
      .where(
        and(
          eq(formAssignments.formId, parseInt(formId)),
          eq(formAssignments.clientId, parseInt(clientId)),
          eq(formAssignments.status, 'sent'),
        ),
      )
      .limit(1);

    if (existingAssignment.length) {
      return NextResponse.json({ error: 'Form already assigned to this client' }, { status: 400 });
    }

    // Calculate expiration date if provided
    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Create the assignment
    const [newAssignment] = await db
      .insert(formAssignments)
      .values({
        formId: parseInt(formId),
        clientId: parseInt(clientId),
        therapistId,
        status: 'sent',
        expiresAt,
      })
      .returning();

    // Invalidate the client's forms cache so they see the new assignment immediately
    try {
      await invalidateOnFormAssignmentChange(parseInt(clientId), 'create');
      console.log('Cache invalidated for client forms after assignment', {
        clientId: parseInt(clientId),
        formId: parseInt(formId),
      });
    } catch (cacheError) {
      console.error('Failed to invalidate client forms cache (non-blocking):', cacheError);
      // Don't fail the API call for cache issues
    }

    return NextResponse.json(
      {
        message: 'Form assigned successfully',
        assignment: {
          id: newAssignment.id.toString(),
          formId: newAssignment.formId.toString(),
          clientId: newAssignment.clientId.toString(),
          status: newAssignment.status,
          sentAt: newAssignment.sentAt.toISOString(),
          expiresAt: newAssignment.expiresAt?.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error assigning form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
