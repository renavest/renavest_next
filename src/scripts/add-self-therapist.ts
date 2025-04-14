import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

import { updateTherapist } from './update-therapist';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

async function checkIfSelfExists(): Promise<boolean> {
  try {
    const existingTherapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.name, 'Seth Morton'))
      .limit(1);

    return existingTherapist.length > 0;
  } catch (error) {
    console.error('❌ Error checking if self exists:', error);
    return false;
  }
}

async function addSelfAsTherapist() {
  try {
    // First, check if the therapist already exists
    const selfExists = await checkIfSelfExists();

    if (selfExists) {
      console.log('ℹ️ Therapist already exists. Updating existing entry.');
    }

    await updateTherapist('Seth Morton', {
      name: 'Seth Morton',
      title: 'Founder & Financial Therapist',
      expertise: 'Platform Development, Financial Technology',
      longBio: 'Creator of Renavest, focusing on building innovative financial therapy solutions.',
      previewBlurb: 'Behind the scenes of Renavest',
      bookingURL: '', // Empty booking URL to prevent bookings
      yoe: 0, // Set years of experience to 0 to differentiate
      clientele: 'Not available for client sessions',
      hourlyRate: 0, // Set hourly rate to 0
      profileUrl: '', // No profile image
      certifications: 'Renavest Platform Development',
      song: 'Code & Chill', // Just for fun
    });

    console.log('✅ Successfully added/updated self as therapist with explore page restrictions');

    // Verify the entry
    const verifyTherapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.name, 'Seth Morton'))
      .limit(1);

    if (verifyTherapist.length > 0) {
      console.log('🔍 Verification successful. Entry details:');
      console.log(JSON.stringify(verifyTherapist[0], null, 2));
    } else {
      console.warn('⚠️ Unable to verify therapist entry');
    }
  } catch (error) {
    console.error('❌ Error adding self as therapist:', error);
    throw error;
  }
}

// Run the script
addSelfAsTherapist().catch(console.error);

export { addSelfAsTherapist, checkIfSelfExists };
