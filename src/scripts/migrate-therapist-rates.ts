import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';
import TherapistList from '@/src/old_config/therapistsList';

/**
 * Migrate therapist hourly rates from the therapist list
 */
export async function migrateTherapistHourlyRates() {
  console.log('Starting therapist hourly rate migration...');
  console.log('Total therapists to process:', TherapistList.length);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const therapist of TherapistList) {
    try {
      // Skip therapists without an hourly rate
      if (!therapist.hourlyRate) {
        console.log(`Skipping ${therapist.name} - No hourly rate`);
        skipCount++;
        continue;
      }

      // Find the therapist in the database first
      const existingTherapist = await db.query.therapists.findFirst({
        where: (therapists, { eq }) => eq(therapists.name, therapist.name),
      });

      if (!existingTherapist) {
        console.log(`Therapist not found in database: ${therapist.name}`);
        errorCount++;
        continue;
      }

      // Update the therapist's hourly rate
      const result = await db
        .update(therapists)
        .set({
          hourlyRate: therapist.hourlyRate.toString(),
        })
        .where(eq(therapists.name, therapist.name));

      console.log(`Migrated hourly rate for ${therapist.name}: $${therapist.hourlyRate}`);
      successCount++;
    } catch (error) {
      console.error(`Error migrating hourly rate for ${therapist.name}:`, error);
      errorCount++;
    }
  }

  console.log('Hourly rate migration completed!');
  console.log(`Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
}

// Uncomment to run directly
migrateTherapistHourlyRates().catch(console.error);
