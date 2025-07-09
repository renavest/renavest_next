import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { MetadataManager } from '@/src/features/auth/utils/metadataManager';

/**
 * Metadata recovery endpoint to fix inconsistencies
 * Based on Clerk webhook audit recommendations
 */
export async function POST() {
  try {
    const { userId } = await auth();
    auth.protect();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run metadata consistency audit
    const audit = await MetadataManager.auditMetadataConsistency(userId);
    
    if (audit.isConsistent) {
      return NextResponse.json({
        success: true,
        message: 'Metadata is consistent',
        audit,
      });
    }

    // Attempt to repair inconsistencies
    await MetadataManager.repairMetadataInconsistencies(userId);

    // Re-run audit to verify fixes
    const postRepairAudit = await MetadataManager.auditMetadataConsistency(userId);

    return NextResponse.json({
      success: true,
      message: 'Metadata inconsistencies detected and repaired',
      beforeRepair: audit,
      afterRepair: postRepairAudit,
    });

  } catch (error) {
    console.error('Failed to recover metadata:', error);
    return NextResponse.json(
      { error: 'Failed to recover metadata', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get metadata consistency report for debugging
 */
export async function GET() {
  try {
    const { userId } = await auth();
    auth.protect();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audit = await MetadataManager.auditMetadataConsistency(userId);
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const normalizedMetadata = MetadataManager.getMetadata(user);

    return NextResponse.json({
      audit,
      rawMetadata: {
        publicMetadata: user.publicMetadata,
        unsafeMetadata: user.unsafeMetadata,
      },
      normalizedMetadata,
    });

  } catch (error) {
    console.error('Failed to get metadata report:', error);
    return NextResponse.json(
      { error: 'Failed to get metadata report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}