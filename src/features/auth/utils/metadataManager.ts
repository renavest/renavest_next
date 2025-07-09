import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import type { User } from '@clerk/nextjs/server';

// Centralized metadata schema based on Clerk best practices
const MetadataSchema = z.object({
  role: z.enum(['employee', 'therapist', 'employer_admin', 'individual_consumer']).optional(),
  onboardingComplete: z.boolean().optional(),
  onboardingVersion: z.number().optional(),
  onboardingCompletedAt: z.string().optional(),
  sponsoredGroupName: z.string().optional(),
  employerName: z.string().optional(),
  signupTimestamp: z.string().optional(),
  signupMethod: z.enum(['email_password', 'google_oauth']).optional(),
  purpose: z.string().optional(),
  ageRange: z.string().optional(),
  maritalStatus: z.string().optional(),
  ethnicity: z.string().optional(),
  agreeToTerms: z.boolean().optional(),
});

export type StandardMetadata = z.infer<typeof MetadataSchema>;

// Metadata field constants to prevent typos
export const METADATA_FIELDS = {
  ROLE: 'role',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  ONBOARDING_VERSION: 'onboardingVersion',
  ONBOARDING_COMPLETED_AT: 'onboardingCompletedAt',
  SPONSORED_GROUP_NAME: 'sponsoredGroupName',
  EMPLOYER_NAME: 'employerName',
  SIGNUP_TIMESTAMP: 'signupTimestamp',
  SIGNUP_METHOD: 'signupMethod',
  PURPOSE: 'purpose',
  AGE_RANGE: 'ageRange',
  MARITAL_STATUS: 'maritalStatus',
  ETHNICITY: 'ethnicity',
  AGREE_TO_TERMS: 'agreeToTerms',
} as const;

/**
 * Metadata update queue to prevent race conditions
 * Based on Clerk docs recommendation for atomic updates
 */
class MetadataUpdateQueue {
  private static queues = new Map<string, Promise<any>>();

  static async enqueue<T>(clerkUserId: string, updateFn: () => Promise<T>): Promise<T> {
    const existingQueue = this.queues.get(clerkUserId);
    const newQueue = existingQueue ? existingQueue.then(updateFn) : updateFn();
    this.queues.set(clerkUserId, newQueue);
    
    try {
      const result = await newQueue;
      // Clean up completed queue
      if (this.queues.get(clerkUserId) === newQueue) {
        this.queues.delete(clerkUserId);
      }
      return result;
    } catch (error) {
      // Clean up failed queue
      if (this.queues.get(clerkUserId) === newQueue) {
        this.queues.delete(clerkUserId);
      }
      throw error;
    }
  }
}

/**
 * Centralized metadata management system
 * Implements Clerk best practices for metadata handling
 */
export class MetadataManager {
  /**
   * Validates metadata against our schema
   */
  static validateMetadata(metadata: unknown): { success: boolean; data?: StandardMetadata; error?: string } {
    const result = MetadataSchema.safeParse(metadata);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error.message };
  }

  /**
   * Safely retrieves metadata from a Clerk user object
   * Prioritizes publicMetadata over unsafeMetadata as per Clerk best practices
   */
  static getMetadata(user: User): StandardMetadata {
    // Merge both metadata types with precedence rules
    // publicMetadata takes precedence for final values
    // unsafeMetadata is used as fallback for signup data
    const combined = {
      ...user.unsafeMetadata,
      ...user.publicMetadata,
    };

    const validation = this.validateMetadata(combined);
    if (!validation.success) {
      console.warn('Invalid metadata detected for user:', user.id, validation.error);
      return {};
    }

    return validation.data || {};
  }

  /**
   * Atomically updates user metadata using Clerk's merge functionality
   * Prevents race conditions by using update queue
   */
  static async updateMetadata(
    clerkUserId: string, 
    updates: Partial<StandardMetadata>
  ): Promise<void> {
    return MetadataUpdateQueue.enqueue(clerkUserId, async () => {
      // Validate updates
      const validation = this.validateMetadata(updates);
      if (!validation.success) {
        throw new Error(`Invalid metadata updates: ${validation.error}`);
      }

      // Get current user to merge existing metadata
      const client = await clerkClient();
      const currentUser = await client.users.getUser(clerkUserId);
      const existingMetadata = this.getMetadata(currentUser);

      // Merge updates with existing metadata
      const mergedMetadata = { ...existingMetadata, ...updates };

      // Update both publicMetadata and unsafeMetadata for consistency
      // This ensures compatibility with existing code that checks either location
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: mergedMetadata,
        unsafeMetadata: {
          // Only keep essential signup data in unsafeMetadata
          ...(updates.role && { role: updates.role }),
          ...(updates.onboardingComplete !== undefined && { onboardingComplete: updates.onboardingComplete }),
          ...(updates.signupTimestamp && { signupTimestamp: updates.signupTimestamp }),
          ...(updates.signupMethod && { signupMethod: updates.signupMethod }),
        },
      });

      console.info('Successfully updated metadata for user:', clerkUserId, updates);
    });
  }

  /**
   * Synchronizes role to publicMetadata for session token compatibility
   * Based on Clerk middleware requirements
   */
  static async synchronizeRoleToClerk(clerkUserId: string, role: string): Promise<void> {
    return this.updateMetadata(clerkUserId, { 
      role: role as StandardMetadata['role'],
      onboardingComplete: true // Assume role sync means onboarding is done
    });
  }

  /**
   * Special handler for signup metadata
   * Uses unsafeMetadata initially as per Clerk patterns
   */
  static async setSignupMetadata(
    clerkUserId: string, 
    signupData: {
      role: string;
      onboardingData?: any;
      sponsoredGroupName?: string;
      signupMethod: 'email_password' | 'google_oauth';
    }
  ): Promise<void> {
    const metadata: StandardMetadata = {
      role: signupData.role as StandardMetadata['role'],
      onboardingComplete: false,
      sponsoredGroupName: signupData.sponsoredGroupName,
      signupMethod: signupData.signupMethod,
      signupTimestamp: new Date().toISOString(),
      agreeToTerms: true,
      ...(signupData.onboardingData && {
        purpose: signupData.onboardingData.purpose,
        ageRange: signupData.onboardingData.ageRange,
        maritalStatus: signupData.onboardingData.maritalStatus,
        ethnicity: signupData.onboardingData.ethnicity,
      }),
    };

    // For signup, start with unsafeMetadata as it's the only type settable during signup
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      unsafeMetadata: metadata,
    });
  }

  /**
   * Completes onboarding by moving data from unsafeMetadata to publicMetadata
   */
  static async completeOnboarding(
    clerkUserId: string, 
    onboardingAnswers?: any,
    version?: number
  ): Promise<void> {
    return this.updateMetadata(clerkUserId, {
      onboardingComplete: true,
      onboardingVersion: version,
      onboardingCompletedAt: new Date().toISOString(),
    });
  }

  /**
   * Checks if metadata is consistent between publicMetadata and unsafeMetadata
   */
  static async auditMetadataConsistency(clerkUserId: string): Promise<{
    isConsistent: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for role consistency
    const publicRole = user.publicMetadata?.role;
    const unsafeRole = user.unsafeMetadata?.role;
    
    if (publicRole !== unsafeRole && both_exist(publicRole, unsafeRole)) {
      issues.push(`Role mismatch: public=${publicRole}, unsafe=${unsafeRole}`);
      recommendations.push('Sync role to both metadata types');
    }

    // Check for onboarding consistency
    const publicOnboarding = user.publicMetadata?.onboardingComplete;
    const unsafeOnboarding = user.unsafeMetadata?.onboardingComplete;
    
    if (publicOnboarding !== unsafeOnboarding && both_exist(publicOnboarding, unsafeOnboarding)) {
      issues.push(`Onboarding status mismatch: public=${publicOnboarding}, unsafe=${unsafeOnboarding}`);
      recommendations.push('Sync onboarding status to both metadata types');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Repairs metadata inconsistencies
   */
  static async repairMetadataInconsistencies(clerkUserId: string): Promise<void> {
    const audit = await this.auditMetadataConsistency(clerkUserId);
    
    if (!audit.isConsistent) {
      console.info('Repairing metadata inconsistencies for user:', clerkUserId, audit.issues);
      
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const mergedMetadata = this.getMetadata(user);
      
      // Force sync both metadata types
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: mergedMetadata,
        unsafeMetadata: {
          role: mergedMetadata.role,
          onboardingComplete: mergedMetadata.onboardingComplete,
          signupTimestamp: mergedMetadata.signupTimestamp,
          signupMethod: mergedMetadata.signupMethod,
        },
      });

      console.info('Successfully repaired metadata for user:', clerkUserId);
    }
  }
}

function both_exist(a: any, b: any): boolean {
  return a !== undefined && b !== undefined;
}