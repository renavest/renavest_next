import { db } from '../db';
import { therapists } from '../db/schema';

async function clearTherapists() {
  try {
    // Delete all records from the therapists table
    await db.delete(therapists);
    console.log('Successfully cleared therapists table');
  } catch (error) {
    console.error('Error clearing therapists table:', error);
  }
}

// Run the clear function
clearTherapists().catch(console.error);
