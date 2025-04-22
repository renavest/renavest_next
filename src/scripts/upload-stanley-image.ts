import * as dotenv from 'dotenv';

import { uploadImageToS3 } from './migrate-therapists';

// Load production environment variables
const envFile = '.env.production';
dotenv.config({ path: envFile });

async function main() {
  const name = 'Stanley Rameau';
  const localImagePath = '/experts/stanley.jpg';

  // Upload image to S3
  const imageKey = await uploadImageToS3(localImagePath, name);
  if (!imageKey) {
    console.error('Failed to upload image for Stanley Rameau.');
    process.exit(1);
  }

  console.log('Stanley Rameau image uploaded to S3.');
  console.log('Use this as the profileUrl:', imageKey);
}

main().catch((err) => {
  console.error('Error uploading Stanley Rameau image:', err);
  process.exit(1);
});
