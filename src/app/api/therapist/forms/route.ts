import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { intakeForms, therapists, users } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/therapist/forms - Get all forms for therapist
export async function GET(request: NextRequest) {
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

    // Get all forms for this therapist
    const forms = await db
      .select()
      .from(intakeForms)
      .where(eq(intakeForms.therapistId, therapistId))
      .orderBy(intakeForms.updatedAt);

    return NextResponse.json({ forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/therapist/forms - Create new form
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

    const { title, description, fields, status = 'draft' } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
    }

    // Create the form
    const [newForm] = await db
      .insert(intakeForms)
      .values({
        title: title.trim(),
        description: description?.trim() || null,
        therapistId,
        fields,
        status,
      })
      .returning();

    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
