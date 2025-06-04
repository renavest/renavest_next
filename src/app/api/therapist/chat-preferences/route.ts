import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/src/db';
import { therapists, therapistChatPreferences } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get therapist ID from user ID
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, parseInt(userId)))
      .limit(1);

    if (!therapist.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Get chat preferences
    const preferences = await db
      .select()
      .from(therapistChatPreferences)
      .where(eq(therapistChatPreferences.therapistId, therapist[0].id))
      .limit(1);

    return NextResponse.json({
      preferences: preferences.length > 0 ? preferences[0] : null,
    });
  } catch (error) {
    console.error('Failed to fetch chat preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      acceptingChats,
      maxActiveChats,
      autoReplyEnabled,
      autoReplyMessage,
      businessHoursOnly,
      businessHoursStart,
      businessHoursEnd,
      timezone,
    } = body;

    // Get therapist ID from user ID
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, parseInt(userId)))
      .limit(1);

    if (!therapist.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const therapistId = therapist[0].id;

    // Check if preferences already exist
    const existingPreferences = await db
      .select()
      .from(therapistChatPreferences)
      .where(eq(therapistChatPreferences.therapistId, therapistId))
      .limit(1);

    const preferencesData = {
      therapistId,
      acceptingChats: acceptingChats ?? false,
      maxActiveChats: maxActiveChats ?? 5,
      autoReplyEnabled: autoReplyEnabled ?? false,
      autoReplyMessage: autoReplyMessage ?? '',
      businessHoursOnly: businessHoursOnly ?? true,
      businessHoursStart: businessHoursStart ?? '09:00',
      businessHoursEnd: businessHoursEnd ?? '17:00',
      timezone: timezone ?? 'UTC',
      updatedAt: new Date(),
    };

    if (existingPreferences.length > 0) {
      // Update existing preferences
      await db
        .update(therapistChatPreferences)
        .set(preferencesData)
        .where(eq(therapistChatPreferences.therapistId, therapistId));
    } else {
      // Insert new preferences
      await db.insert(therapistChatPreferences).values({
        ...preferencesData,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Chat preferences updated successfully',
    });
  } catch (error) {
    console.error('Failed to update chat preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
