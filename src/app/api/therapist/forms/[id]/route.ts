import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { intakeForms, therapists, users } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/therapist/forms/[id] - Get specific form
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const formId = parseInt(params.id);

    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    // Get form if it belongs to this therapist
    const form = await db
      .select()
      .from(intakeForms)
      .where(and(eq(intakeForms.id, formId), eq(intakeForms.therapistId, therapistId)))
      .limit(1);

    if (!form.length) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ form: form[0] });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/therapist/forms/[id] - Update existing form
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const formId = parseInt(params.id);

    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, fields, status = 'draft' } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
    }

    // Check if form exists and belongs to this therapist
    const existingForm = await db
      .select()
      .from(intakeForms)
      .where(and(eq(intakeForms.id, formId), eq(intakeForms.therapistId, therapistId)))
      .limit(1);

    if (!existingForm.length) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Update the form
    const [updatedForm] = await db
      .update(intakeForms)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        fields,
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(intakeForms.id, formId), eq(intakeForms.therapistId, therapistId)))
      .returning();

    return NextResponse.json({ form: updatedForm });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/therapist/forms/[id] - Delete form
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const formId = parseInt(params.id);

    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 });
    }

    // Check if form exists and belongs to this therapist
    const existingForm = await db
      .select()
      .from(intakeForms)
      .where(and(eq(intakeForms.id, formId), eq(intakeForms.therapistId, therapistId)))
      .limit(1);

    if (!existingForm.length) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Delete the form (this will cascade to assignments due to foreign key)
    await db
      .delete(intakeForms)
      .where(and(eq(intakeForms.id, formId), eq(intakeForms.therapistId, therapistId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
