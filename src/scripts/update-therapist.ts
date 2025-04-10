import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import TherapistList from '@/src/config/therapistsList';
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

// import { uploadImageToS3 } from './migrate-therapists';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

// Define a type for partial therapist update
type TherapistUpdateFields = Partial<{
  name: string;
  title: string;
  bookingURL: string;
  expertise: string;
  certifications: string;
  song: string;
  yoe: number;
  clientele: string;
  longBio: string;
  previewBlurb: string;
  profileUrl: string;
  hourlyRate: number;
}>;

/**
 * Update a therapist's information in the database
 * @param nameOrId - Name or ID of the therapist to update
 * @param updateData - Object containing fields to update
 * @returns Promise resolving to the updated therapist or null
 */
async function updateTherapist(nameOrId: string, updateData: TherapistUpdateFields): Promise<void> {
  try {
    // Determine if the input is a name or an ID
    const isNumericId = !isNaN(Number(nameOrId));

    // Prepare the update object
    const updateObject: TherapistUpdateFields = { ...updateData };

    // Convert hourlyRate to string if present
    if (updateObject.hourlyRate !== undefined) {
      updateObject.hourlyRate = Number(updateObject.hourlyRate);
    }

    // Handle image upload if a new profile URL is provided
    // if (updateData.profileUrl) {
    //   const imageKey = await uploadImageToS3(updateData.profileUrl, updateData.name || nameOrId);
    //   if (imageKey) {
    //     updateObject.profileUrl = imageKey;
    //   }
    // }

    // Perform the update based on name or ID
    if (isNumericId) {
      await db
        .update(therapists)
        .set({
          ...updateObject,
          hourlyRate: updateObject.hourlyRate?.toString(),
        })
        .where(eq(therapists.id, Number(nameOrId)));
    } else {
      await db
        .update(therapists)
        .set({
          ...updateObject,
          hourlyRate: updateObject.hourlyRate?.toString(),
        })
        .where(eq(therapists.name, nameOrId));
    }

    console.log(`Successfully updated therapist: ${nameOrId}`);
    console.log('Updated fields:', Object.keys(updateData).join(', '));
  } catch (error) {
    console.error(`Error updating therapist ${nameOrId}:`, error);
    throw error;
  }
}

/**
 * Delete a therapist from the database
 * @param nameOrId - Name or ID of the therapist to delete
 * @returns Promise resolving when the deletion is complete
 */
async function deleteTherapist(nameOrId: string): Promise<void> {
  try {
    // Determine if the input is a name or an ID
    const isNumericId = !isNaN(Number(nameOrId));

    let deletedCount = 0;
    // Perform the deletion based on name or ID
    if (isNumericId) {
      const result = await db.delete(therapists).where(eq(therapists.id, Number(nameOrId)));
      deletedCount = result.rowCount || 0;
    } else {
      const result = await db.delete(therapists).where(eq(therapists.name, nameOrId.trim()));
      deletedCount = result.rowCount || 0;
    }

    if (deletedCount > 0) {
      console.log(`✅ Successfully deleted therapist: ${nameOrId}`);
      console.log(`🔢 Number of records deleted: ${deletedCount}`);
    } else {
      console.warn(`⚠️ No therapist found with name/ID: ${nameOrId}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting therapist ${nameOrId}:`, error);
    throw error;
  }
}

// Example usage function to demonstrate how to use the script
async function exampleUsage() {
  try {
    // Delete Monica Bradshaw
    await deleteTherapist('Monica Bradshaw');
  } catch (error) {
    console.error('Example usage failed:', error);
  }
}

// Uncomment the line below to run the example usage
exampleUsage().catch(console.error);

/**
 * Bulk update therapist hourly rates from the therapist list
 */
export async function updateTherapistHourlyRates() {
  console.log('Starting therapist hourly rate update...');

  for (const therapist of TherapistList) {
    try {
      // Skip therapists without an hourly rate
      if (!therapist.hourlyRate) continue;

      // Update the therapist's hourly rate
      await db
        .update(therapists)
        .set({
          hourlyRate: therapist.hourlyRate.toString(),
        })
        .where(eq(therapists.name, therapist.name));

      console.log(`Updated hourly rate for ${therapist.name}: $${therapist.hourlyRate}`);
    } catch (error) {
      console.error(`Error updating hourly rate for ${therapist.name}:`, error);
    }
  }

  console.log('Hourly rate update completed!');
}

// Uncomment to run directly
// updateTherapistHourlyRates().catch(console.error);

// Export the functions so they can be imported and used in other scripts
export { updateTherapist, deleteTherapist };
