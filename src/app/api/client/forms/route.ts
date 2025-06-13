import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { getClientFormAssignments, getUserByClerkId } from '@/src/services/clientFormsDataService';

// GET /api/client/forms - Get all form assignments for the authenticated client
export async function GET(_request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.error('Client forms API: No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Client forms API: Processing request for user', { clerkUserId });

    // Get user by Clerk ID with caching
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      console.error('Client forms API: User not found in database', { clerkUserId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clientId = user.id;
    const userRole = user.role;

    console.log('Client forms API: Found user', {
      clientId,
      userRole,
      email: user.email,
    });

    // Use cached client forms data service
    const formsData = await getClientFormAssignments(clientId);

    // Check for warnings from the service
    if ('warning' in formsData && formsData.warning) {
      console.warn('Client forms API: Service returned warning:', formsData.warning);
    }

    console.log('Client forms API: Successfully retrieved forms', {
      clientId,
      assignmentsFound: formsData.assignments.length,
      total: formsData.total,
    });

    return NextResponse.json(
      {
        assignments: formsData.assignments,
        total: formsData.total,
        warning: 'warning' in formsData ? formsData.warning : undefined,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
        },
      },
    );
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
