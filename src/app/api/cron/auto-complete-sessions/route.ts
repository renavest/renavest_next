import { NextRequest, NextResponse } from 'next/server';

import { SessionCompletionService } from '@/src/features/stripe/services/session-completion';

// POST - Auto-complete eligible sessions (for cron jobs)
export async function POST(req: NextRequest) {
  try {
    // Verify this is called from a cron job or authorized source
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[AUTO COMPLETE] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[AUTO COMPLETE] Starting auto-completion of eligible sessions');

    // Run the auto-completion process
    const results = await SessionCompletionService.autoCompleteEligibleSessions();

    // Log results for monitoring
    console.log('[AUTO COMPLETE] Completed:', {
      processed: results.processed,
      completed: results.completed,
      errorCount: results.errors.length,
    });

    if (results.errors.length > 0) {
      console.error('[AUTO COMPLETE] Errors encountered:', results.errors);
    }

    return NextResponse.json({
      success: true,
      message: 'Auto-completion process completed',
      results,
    });
  } catch (error) {
    console.error('[AUTO COMPLETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to auto-complete sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET - Health check and manual trigger (for testing)
export async function GET(req: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get eligible sessions without completing them
    const eligibleSessions = await SessionCompletionService.getEligibleSessionsForAutoCompletion();

    return NextResponse.json({
      success: true,
      eligibleSessionsCount: eligibleSessions.length,
      eligibleSessions: eligibleSessions.map((s) => ({
        id: s.id,
        therapistId: s.therapistId,
        sessionEndTime: s.sessionEndTime,
      })),
    });
  } catch (error) {
    console.error('[AUTO COMPLETE CHECK] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check eligible sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
