import { eq, and, desc } from 'drizzle-orm';

import { db } from '@/src/db';
import { formAssignments, intakeForms, therapists, users } from '@/src/db/schema';
import { withCache, CACHE_KEYS, CACHE_TTL, deleteFromCache } from '@/src/lib/cache';

export interface ClientFormAssignment {
  id: string;
  formId: string;
  formTitle: string;
  formDescription: string | null;
  fields: unknown;
  status: string;
  sentAt: string;
  completedAt?: string;
  expiresAt?: string;
  responses: unknown;
  therapistName: string;
}

export interface ClientFormsData {
  assignments: ClientFormAssignment[];
  total: number;
}

/**
 * Get form assignments for a client with caching and fallback queries
 */
export async function getClientFormAssignments(clientId: number): Promise<ClientFormsData> {
  return withCache(
    CACHE_KEYS.clientFormAssignments(clientId),
    async () => {
      try {
        // First check if user has any form assignments at all
        const assignmentCount = await db
          .select({ count: formAssignments.id })
          .from(formAssignments)
          .where(eq(formAssignments.clientId, clientId));

        // If no assignments exist, return empty array immediately
        if (assignmentCount.length === 0) {
          console.log('Client forms service: No form assignments found for client', { clientId });
          return { assignments: [], total: 0 };
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

          console.log('Client forms service: Complex query succeeded', {
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

          return {
            assignments: transformedAssignments,
            total: transformedAssignments.length,
          };
        } catch (joinError) {
          console.error('Client forms service: Complex join failed, attempting fallback', {
            clientId,
            joinError: joinError instanceof Error ? joinError.message : String(joinError),
          });

          // FALLBACK: Get assignments with minimal data if joins fail
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

          console.log('Client forms service: Fallback query succeeded', {
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
                console.error('Client forms service: Failed to enrich assignment', {
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

          console.log('Client forms service: Fallback enrichment completed', {
            clientId,
            totalAttempted: enrichedAssignments.length,
            successful: successfulAssignments.length,
          });

          return {
            assignments: successfulAssignments,
            total: successfulAssignments.length,
          };
        }
      } catch (error) {
        console.error('Client forms service: Top-level error', {
          clientId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Return empty array rather than throwing - client can handle gracefully
        return {
          assignments: [],
          total: 0,
          warning: 'Some form data could not be loaded due to database issues',
        };
      }
    },
    { ttl: CACHE_TTL.CLIENT_FORM_ASSIGNMENTS },
  );
}

/**
 * Get user ID by Clerk ID with basic caching
 */
export async function getUserByClerkId(
  clerkUserId: string,
): Promise<{ id: number; email: string; role: string } | null> {
  // Simple memory cache for user lookups since we can't use complex cache keys easily
  const cacheKey = `user:clerk:${clerkUserId}`;

  return withCache(
    cacheKey,
    async () => {
      const user = await db
        .select({ id: users.id, email: users.email, role: users.role })
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
        .limit(1);

      return user[0] || null;
    },
    { ttl: CACHE_TTL.THERAPIST_LOOKUP }, // Reuse therapist lookup TTL
  );
}

/**
 * Invalidate client forms cache when data changes
 */
export async function invalidateClientFormsCache(clientId: number): Promise<void> {
  await Promise.all([
    deleteFromCache(CACHE_KEYS.clientFormAssignments(clientId)),
    deleteFromCache(CACHE_KEYS.clientForms(clientId)),
  ]);

  console.log('Client forms cache invalidated', { clientId });
}

/**
 * Invalidate cache when form assignments change (call this from mutations)
 */
export async function invalidateOnFormAssignmentChange(
  clientId: number,
  action: 'create' | 'update' | 'delete' = 'update',
): Promise<void> {
  await invalidateClientFormsCache(clientId);
  console.log('Client forms cache invalidated due to assignment change', { clientId, action });
}
