import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

async function clearBookingTable() {
  try {
    console.log('Clearing booking sessions table...');
    const result = await db.delete(bookingSessions);
    console.log(`Successfully deleted ${result.rowCount} booking sessions.`);
  } catch (error) {
    console.error('Error clearing booking sessions table:', error);
    process.exit(1);
  }
}

clearBookingTable().then(() => process.exit(0));
