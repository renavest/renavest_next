import { eq } from 'drizzle-orm';

import TherapistList from '../config/therapistsList';
import { db } from '../db/index';
import { therapists } from '../db/schema';

async function migrateTherapistEmails() {
  console.log('Starting therapist email migration...');

  // First, clear all existing emails
  await db.update(therapists).set({ email: null });
  console.log('Cleared all existing emails');

  // Then update with new emails
  for (const therapist of TherapistList) {
    try {
      if (therapist.email) {
        await db
          .update(therapists)
          .set({ email: therapist.email })
          .where(eq(therapists.name, therapist.name.trim()));
        console.log(`Updated email for ${therapist.name}`);
      } else {
        console.log(`Skipping ${therapist.name} - no email provided`);
      }
    } catch (error) {
      console.error(`Error updating ${therapist.name}:`, error);
    }
  }

  console.log('Therapist email migration completed.');
}

// Uncomment to run the migration
migrateTherapistEmails().catch(console.error);

export default migrateTherapistEmails;
