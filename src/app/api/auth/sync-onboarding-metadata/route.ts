import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Syncs onboardingComplete and role from unsafeMetadata to publicMetadata
 * This is useful when these values are set in unsafeMetadata during signup
 * but haven't been synced to publicMetadata yet
 */
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if onboardingComplete is true in unsafeMetadata
    const unsafeOnboardingComplete = user.unsafeMetadata?.onboardingComplete as boolean | undefined;
    const publicOnboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined;
    
    // Check if role is in unsafeMetadata but not in publicMetadata
    const unsafeRole = user.unsafeMetadata?.role as string | undefined;
    const publicRole = user.publicMetadata?.role as string | undefined;

    // Determine if we need to sync
    const needsOnboardingSync = unsafeOnboardingComplete === true && publicOnboardingComplete !== true;
    const needsRoleSync = unsafeRole && !publicRole;

    // Only sync if we need to update something
    if (needsOnboardingSync || needsRoleSync) {
      const clerk = await clerkClient();
      
      // Get current publicMetadata to preserve existing data
      const currentPublicMetadata = (user.publicMetadata || {}) as Record<string, unknown>;
      
      // Build updated metadata
      const updatedMetadata: Record<string, unknown> = {
        ...currentPublicMetadata,
      };
      
      if (needsOnboardingSync) {
        updatedMetadata.onboardingComplete = true;
      }
      
      if (needsRoleSync && unsafeRole) {
        updatedMetadata.role = unsafeRole;
      }
      
      await clerk.users.updateUserMetadata(user.id, {
        publicMetadata: updatedMetadata,
      });

      return NextResponse.json({
        success: true,
        message: 'Metadata synced successfully',
        synced: true,
        syncedOnboarding: needsOnboardingSync,
        syncedRole: needsRoleSync,
      });
    }

    // Already synced or not needed
    return NextResponse.json({
      success: true,
      message: 'No sync needed',
      synced: false,
    });
  } catch (error) {
    console.error('Error syncing onboarding metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync onboarding metadata',
      },
      { status: 500 },
    );
  }
}

