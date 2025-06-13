import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { formAssignments, intakeForms, therapists, users } from '@/src/db/schema';

// GET /api/client/forms - Get all form assignments for the authenticated client
export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error('Client forms API: No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Client forms API: Processing request for user', { clerkUserId });

    // Get user by Clerk ID with enhanced error logging
    const user = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user.length) {
      console.error('Client forms API: User not found in database', { clerkUserId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clientId = user[0].id;
    const userRole = user[0].role;

    console.log('Client forms API: Found user', {
      clientId,
      userRole,
      email: user[0].email,
    });

    // First check if user has any form assignments at all
    const assignmentCount = await db
      .select({ count: formAssignments.id })
      .from(formAssignments)
      .where(eq(formAssignments.clientId, clientId));

    console.log('Client forms API: Assignment check', {
      clientId,
      assignmentCount: assignmentCount.length,
    });

    // If no assignments exist, return empty array immediately
    if (assignmentCount.length === 0) {
      console.log('Client forms API: No form assignments found for client', { clientId });
      return NextResponse.json({ assignments: [] });
    }

    // Try the complex join first, with fallback on failure
    try {
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

      console.log('Client forms API: Complex query succeeded', {
        clientId,
        assignmentsFound: assignments.length,
      });

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
    } catch (joinError) {
      console.error('Client forms API: Complex join failed, attempting fallback', {
        clientId,
        joinError: joinError instanceof Error ? joinError.message : String(joinError),
      });

      // FALLBACK: Get assignments with minimal data if joins fail
      try {
        const basicAssignments = await db
          .select({
            id: formAssignments.id,
            formId: formAssignments.formId,
            status: formAssignments.status,
            sentAt: formAssignments.sentAt,
            completedAt: formAssignments.completedAt,
            expiresAt: formAssignments.expiresAt,
            responses: formAssignments.responses,
          })
          .from(formAssignments)
          .where(eq(formAssignments.clientId, clientId))
          .orderBy(desc(formAssignments.sentAt));

        console.log('Client forms API: Fallback query succeeded', {
          clientId,
          basicAssignmentsFound: basicAssignments.length,
        });

        // Get form details separately for each assignment
        const enrichedAssignments = await Promise.allSettled(
          basicAssignments.map(async (assignment) => {
            try {
              const form = await db
                .select({
                  title: intakeForms.title,
                  description: intakeForms.description,
                  fields: intakeForms.fields,
                })
                .from(intakeForms)
                .where(eq(intakeForms.id, assignment.formId))
                .limit(1);

              return {
                id: assignment.id.toString(),
                formId: assignment.formId.toString(),
                formTitle: form[0]?.title || 'Unknown Form',
                formDescription: form[0]?.description || null,
                fields: form[0]?.fields || [],
                status: assignment.status,
                sentAt: assignment.sentAt.toISOString(),
                completedAt: assignment.completedAt?.toISOString(),
                expiresAt: assignment.expiresAt?.toISOString(),
                responses: assignment.responses,
                therapistName: 'Unknown Therapist', // Fallback when therapist join fails
              };
            } catch (error) {
              console.error('Client forms API: Failed to enrich assignment', {
                assignmentId: assignment.id,
                error: error instanceof Error ? error.message : String(error),
              });

              // Return basic assignment even if enrichment fails
              return {
                id: assignment.id.toString(),
                formId: assignment.formId.toString(),
                formTitle: 'Form (Error Loading Details)',
                formDescription: null,
                fields: [],
                status: assignment.status,
                sentAt: assignment.sentAt.toISOString(),
                completedAt: assignment.completedAt?.toISOString(),
                expiresAt: assignment.expiresAt?.toISOString(),
                responses: assignment.responses,
                therapistName: 'Unknown Therapist',
              };
            }
          }),
        );

        // Filter out failed enrichment attempts and extract successful results
        const successfulAssignments = [];
        for (const result of enrichedAssignments) {
          if (result.status === 'fulfilled') {
            successfulAssignments.push(result.value);
          }
        }

        console.log('Client forms API: Fallback enrichment completed', {
          clientId,
          totalAttempted: enrichedAssignments.length,
          successful: successfulAssignments.length,
        });

        return NextResponse.json({ assignments: successfulAssignments });
      } catch (fallbackError) {
        console.error('Client forms API: Even fallback query failed', {
          clientId,
          fallbackError:
            fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });

        // Return empty array rather than throwing - client can handle gracefully
        return NextResponse.json({
          assignments: [],
          warning: 'Some form data could not be loaded due to database issues',
        });
      }
    }
  } catch (error) {
    console.error('Client forms API: Top-level error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
