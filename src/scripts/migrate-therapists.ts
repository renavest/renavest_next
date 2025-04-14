import fs from 'fs/promises';
import path from 'path';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

import TherapistList from '../config/therapistsList';
import { db } from '../db';
import { therapists } from '../db/schema';
import { generateTherapistImageKey } from '../services/s3/assetUrls';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_IMAGES_BUCKET_NAME || '';

export async function uploadImageToS3(imageUrl: string, therapistName: string): Promise<string> {
  try {
    // Skip if no image URL
    if (!imageUrl) {
      return '';
    }

    let buffer: Buffer;

    // For local images, read from public directory
    if (imageUrl.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', imageUrl);
      try {
        buffer = await fs.readFile(filePath);
      } catch (error) {
        console.error(`Failed to read local file for ${therapistName}:`, error);
        return '';
      }
    } else {
      // For remote images, fetch them
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error(`Failed to fetch image for ${therapistName}: ${response.statusText}`);
        return '';
      }
      buffer = Buffer.from(await response.arrayBuffer());
    }

    const key = generateTherapistImageKey(therapistName);

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'private', // Make sure the image is private
      }),
    );

    // Return just the key instead of the full URL
    return key;
  } catch (error) {
    console.error(`Error uploading image for ${therapistName}:`, error);
    return '';
  }
}

async function migrateTherapists() {
  console.log('Starting therapist migration...');

  for (const therapist of TherapistList) {
    try {
      // Upload image to S3 if exists
      const imageKey = await uploadImageToS3(therapist.profileUrl, therapist.name);
      console.log(`Uploaded image for ${therapist.name}: ${imageKey}`);

      // Insert into database
      await db.insert(therapists).values({
        name: therapist.name,
        title: therapist.title,
        bookingURL: therapist.bookingURL,
        expertise: therapist.expertise,
        certifications: therapist.certifications,
        song: therapist.song,
        yoe: parseInt(therapist.yoe) || null,
        clientele: therapist.clientele,
        longBio: therapist.longBio,
        previewBlurb: therapist.previewBlurb,
        profileUrl: imageKey || therapist.profileUrl, // Store just the key
      });

      console.log(`Migrated therapist: ${therapist.name}`);
    } catch (error) {
      console.error(`Error migrating therapist ${therapist.name}:`, error);
    }
  }

  console.log('Migration completed!');
}

// Run migration
// migrateTherapists().catch(console.error);
