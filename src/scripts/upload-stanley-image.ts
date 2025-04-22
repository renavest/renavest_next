import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '../db';
import { therapists } from '../db/schema';
import { uploadImageToS3 } from './migrate-therapists';

// Load production environment variables
const envFile = '.env.production';
dotenv.config({ path: envFile });

async function main() {
  const name = 'Stanley Rameau';
  const email = 'stanley@renavestapp.com';
  const title = 'Financial Coach'; // Update as needed
  const bookingURL = '';
  const expertise = '';
  const certifications = '';
  const song = '';
  const yoe = 0;
  const clientele = '';
  const longBio = '';
  const previewBlurb = '';
  const hourlyRate = null;
  const localImagePath = '/experts/stanley.jpg';

  // Upload image to S3
  const imageKey = await uploadImageToS3(localImagePath, name);
  if (!imageKey) {
    console.error('Failed to upload image for Stanley Rameau.');
    process.exit(1);
  }

  // Check if Stanley already exists
  const existing = await db.select().from(therapists).where(therapists.email.eq(email));

  if (existing.length > 0) {
    // Update existing record
    await db
      .update(therapists)
      .set({
        name,
        title,
        bookingURL,
        expertise,
        certifications,
        song,
        yoe,
        clientele,
        longBio,
        previewBlurb,
        profileUrl: imageKey,
        hourlyRate,
      })
      .where(therapists.email.eq(email));
    console.log('Updated Stanley Rameau in the database.');
  } else {
    // Insert new record
    await db.insert(therapists).values({
      name,
      email,
      title,
      bookingURL,
      expertise,
      certifications,
      song,
      yoe,
      clientele,
      longBio,
      previewBlurb,
      profileUrl: imageKey,
      hourlyRate,
    });
    console.log('Inserted Stanley Rameau into the database.');
  }
}

main().catch((err) => {
  console.error('Error uploading Stanley Rameau image:', err);
  process.exit(1);
});
