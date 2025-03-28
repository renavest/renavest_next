# Therapist Update Script

## Overview
The `update-therapist.ts` script provides an easy way to update therapist information in the database.

## Usage

### Importing the Function
```typescript
import { updateTherapist } from './update-therapist';
```

### Updating a Therapist by Name
```typescript
// Update booking URL
await updateTherapist('Paige Williams', {
  bookingURL: 'https://new-booking-link.com/paige'
});
```

### Updating a Therapist by ID
```typescript
// Update multiple fields
await updateTherapist('1', {
  title: 'Updated Financial Coach',
  expertise: 'Advanced Debt Management, Strategic Investing',
  profileUrl: '/path/to/new/profile/image.jpg'
});
```

## Supported Update Fields
- `name`: Therapist's name
- `title`: Professional title
- `bookingURL`: Booking link
- `expertise`: Areas of expertise
- `certifications`: Professional certifications
- `song`: Favorite song
- `yoe`: Years of experience
- `clientele`: Target client description
- `longBio`: Detailed biography
- `previewBlurb`: Short preview description
- `profileUrl`: Profile image URL (will be uploaded to S3)

## Notes
- When updating `profileUrl`, the script automatically uploads the image to S3
- You can update one or multiple fields in a single call
- Can update by either therapist name or database ID
- Requires proper environment variables for database and S3 access

## Running the Script
```bash
# For local development
npx ts-node src/scripts/update-therapist.ts

# For production
NODE_ENV=production npx ts-node src/scripts/update-therapist.ts
```

## Error Handling
The script logs errors to the console and throws an error if the update fails, allowing you to handle it in your calling code. 