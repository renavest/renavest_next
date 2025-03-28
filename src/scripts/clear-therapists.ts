import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

import { db } from '../db';
import { therapists } from '../db/schema';
import { users } from '../db/schema';
import { userOnboarding } from '../db/schema';
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: envFile });

async function clearTherapists() {
  try {
    // Fetch all therapist names before deleting
    const existingTherapists = await db.select({ name: therapists.name }).from(therapists);

    // Delete all records from the therapists table
    await db.delete(therapists);
    console.log('Successfully cleared therapists table');

    // Set up S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Prepare objects to delete in S3
    if (existingTherapists.length > 0) {
      const objectsToDelete = existingTherapists.map((therapist) => ({
        Key: `therapists/${therapist.name}`,
      }));

      // Delete objects from S3
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_IMAGES_BUCKET_NAME || 'renavest-assets',
        Delete: {
          Objects: objectsToDelete,
        },
      });

      const deleteResponse = await s3Client.send(deleteCommand);
      console.log('Successfully deleted therapist images from S3:', deleteResponse);
    }
  } catch (error) {
    console.error('Error clearing therapists and S3 images:', error);
  }
}

async function clearUsers() {
  try {
    // Optionally, fetch user data before deletion if needed for logging
    const existingUsers = await db
      .select({
        clerkId: users.clerkId,
        email: users.email,
      })
      .from(users);

    // Clear user interactions table first (if it exists)
    // Uncomment and modify as needed:
    await db.delete(userOnboarding);

    // Clear users table
    await db.delete(users);

    console.log('Successfully cleared users table');
    console.log('Deleted users:', existingUsers.length);

    // Optional: Log deleted user details
    existingUsers.forEach((user) => {
      console.log(`Deleted user - Clerk ID: ${user.clerkId}, Email: ${user.email}`);
    });
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}

// Run the clear function
clearTherapists().catch(console.error);
clearUsers().catch(console.error);
