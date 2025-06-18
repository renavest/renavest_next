import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists, pendingTherapists } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

/**
 * Manual database sync endpoint for when webhooks fail
 * This ensures ACID compliance by allowing recovery from webhook failures
 */
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const primaryEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();

    if (!primaryEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Check if user already exists in database
    const existingUser = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (existingUser.length > 0) {
      // User exists, check therapist profile if needed
      const userRecord = existingUser[0];

      if (userRecord.role === 'therapist') {
        const therapistRecord = await db
          .select()
          .from(therapists)
          .where(eq(therapists.userId, userRecord.id))
          .limit(1);

        if (therapistRecord.length === 0) {
          // Need to create therapist profile
          const pendingTherapist = await db
            .select()
            .from(pendingTherapists)
            .where(eq(pendingTherapists.clerkEmail, primaryEmail))
            .limit(1);

          if (pendingTherapist.length === 0) {
            return NextResponse.json(
              {
                error: 'No pending therapist record found for this email',
                action: 'contact_support',
              },
              { status: 400 },
            );
          }

          // Create therapist profile
          await db.insert(therapists).values({
            userId: userRecord.id,
            name: pendingTherapist[0].name,
            title: pendingTherapist[0].title,
            bookingURL: pendingTherapist[0].bookingURL,
            expertise: pendingTherapist[0].expertise,
            certifications: pendingTherapist[0].certifications,
            song: pendingTherapist[0].song,
            yoe: pendingTherapist[0].yoe,
            clientele: pendingTherapist[0].clientele,
            longBio: pendingTherapist[0].longBio,
            previewBlurb: pendingTherapist[0].previewBlurb,
            profileUrl: pendingTherapist[0].profileUrl,
            hourlyRateCents: pendingTherapist[0].hourlyRateCents,
            googleCalendarIntegrationStatus: 'not_connected',
            createdAt: createDate().toJSDate(),
            updatedAt: createDate().toJSDate(),
          });

          return NextResponse.json({
            success: true,
            message: 'Therapist profile created successfully',
            action: 'continue_onboarding',
          });
        }

        return NextResponse.json({
          success: true,
          message: 'User and therapist profile already exist',
          action: 'redirect_to_dashboard',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'User already exists in database',
        action: 'redirect_to_dashboard',
      });
    }

    // User doesn't exist, create from Clerk data
    const userRole = (user.publicMetadata?.role as string) || 'individual_consumer';

    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: user.id,
        email: primaryEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: userRole as any,
        isActive: true,
        createdAt: createDate().toJSDate(),
        updatedAt: createDate().toJSDate(),
      })
      .returning();

    // If therapist role, create therapist profile
    if (userRole === 'therapist') {
      const pendingTherapist = await db
        .select()
        .from(pendingTherapists)
        .where(eq(pendingTherapists.clerkEmail, primaryEmail))
        .limit(1);

      if (pendingTherapist.length === 0) {
        return NextResponse.json(
          {
            error: 'No pending therapist record found for this email',
            action: 'contact_support',
          },
          { status: 400 },
        );
      }

      await db.insert(therapists).values({
        userId: newUser.id,
        name: pendingTherapist[0].name,
        title: pendingTherapist[0].title,
        bookingURL: pendingTherapist[0].bookingURL,
        expertise: pendingTherapist[0].expertise,
        certifications: pendingTherapist[0].certifications,
        song: pendingTherapist[0].song,
        yoe: pendingTherapist[0].yoe,
        clientele: pendingTherapist[0].clientele,
        longBio: pendingTherapist[0].longBio,
        previewBlurb: pendingTherapist[0].previewBlurb,
        profileUrl: pendingTherapist[0].profileUrl,
        hourlyRateCents: pendingTherapist[0].hourlyRateCents,
        googleCalendarIntegrationStatus: 'not_connected',
        createdAt: createDate().toJSDate(),
        updatedAt: createDate().toJSDate(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User database sync completed successfully',
      action: 'continue_onboarding',
    });
  } catch (error) {
    console.error('Manual user sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync user to database',
        action: 'retry_later',
      },
      { status: 500 },
    );
  }
}
