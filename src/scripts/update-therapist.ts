import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { db } from '../db';
import { therapists } from '../db/schema';

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

    // Handle image upload if a new profile URL is provided
    // if (updateData.profileUrl) {
    //   const imageKey = await uploadImageToS3(updateData.profileUrl, updateData.name || nameOrId);
    //   if (imageKey) {
    //     updateObject.profileUrl = imageKey;
    //   }
    // }

    // Perform the update based on name or ID
    const updateResult = isNumericId
      ? await db
          .update(therapists)
          .set(updateObject)
          .where(eq(therapists.id, Number(nameOrId)))
      : await db.update(therapists).set(updateObject).where(eq(therapists.name, nameOrId));

    console.log(`Successfully updated therapist: ${nameOrId}`);
    console.log('Updated fields:', Object.keys(updateData).join(', '));
  } catch (error) {
    console.error(`Error updating therapist ${nameOrId}:`, error);
    throw error;
  }
}

// Example usage function to demonstrate how to use the script
async function exampleUsage() {
  try {
    // Update booking URL for a therapist by name
    await updateTherapist('Paige Williams', {
      bookingURL: 'https://calendly.com/paigevic98/strategy-session-paige',
    });

    // Update multiple fields for a therapist by ID
    // await updateTherapist('1', {
    //   title: 'Updated Financial Coach',
    //   expertise: 'Advanced Debt Management, Strategic Investing',
    //   profileUrl: '/path/to/new/profile/image.jpg',
    // });
  } catch (error) {
    console.error('Example usage failed:', error);
  }
}

// Uncomment the line below to run the example usage
exampleUsage().catch(console.error);

// Export the function so it can be imported and used in other scripts
// export { updateTherapist };
