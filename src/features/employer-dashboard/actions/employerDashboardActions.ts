'use server';

import { count, sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';

export async function fetchEmployerDashboardMetrics() {
  // Fetch total therapists
  const totalTherapistsCount = await db.select({ count: count() }).from(therapists);

  // Note: Removed isActive check as it doesn't exist in the schema
  const activeTherapistsCount = await db.select({ count: count() }).from(therapists);

  // Fetch booking metrics
  const totalBookings = await db.select({ count: count() }).from(bookingSessions);

  const scheduledBookings = await db
    .select({ count: count() })
    .from(bookingSessions)
    .where(eq(bookingSessions.status, 'scheduled'));

  const completedBookings = await db
    .select({ count: count() })
    .from(bookingSessions)
    .where(eq(bookingSessions.status, 'completed'));

  const canceledBookings = await db
    .select({ count: count() })
    .from(bookingSessions)
    .where(eq(bookingSessions.status, 'cancelled'));

  // Fetch total employees
  const totalEmployees = await db.select({ count: count() }).from(users);

  // Fetch therapist-specific booking data
  const therapistBookings = await db
    .select({
      therapistId: bookingSessions.therapistId,
      therapistName: therapists.name,
      totalBookings: sql`COUNT(${bookingSessions.id})`.as('total_bookings'),
      completedBookings:
        sql`COUNT(CASE WHEN ${bookingSessions.status} = 'completed' THEN 1 END)`.as(
          'completed_bookings',
        ),
      upcomingBookings: sql`COUNT(CASE WHEN ${bookingSessions.status} = 'scheduled' THEN 1 END)`.as(
        'upcoming_bookings',
      ),
    })
    .from(bookingSessions)
    .leftJoin(therapists, eq(bookingSessions.therapistId, therapists.id))
    .groupBy(bookingSessions.therapistId, therapists.name)
    .limit(10);

  return {
    therapistMetrics: {
      totalTherapists: totalTherapistsCount[0]?.count || 0,
      activeTherapists: activeTherapistsCount[0]?.count || 0,
      averageSessionsPerTherapist: totalBookings[0]?.count / (activeTherapistsCount[0]?.count || 1),
      therapistUtilizationRate:
        (activeTherapistsCount[0]?.count / totalTherapistsCount[0]?.count) * 100 || 0,
    },
    bookingMetrics: {
      totalBookings: totalBookings[0]?.count || 0,
      scheduledBookings: scheduledBookings[0]?.count || 0,
      completedBookings: completedBookings[0]?.count || 0,
      canceledBookings: canceledBookings[0]?.count || 0,
      averageBookingsPerEmployee: totalBookings[0]?.count / (totalEmployees[0]?.count || 1),
      bookingsByTherapist: therapistBookings.map((booking) => ({
        therapistId: booking.therapistId,
        therapistName: booking.therapistName || 'Unknown',
        totalBookings: Number(booking.totalBookings),
        completedBookings: Number(booking.completedBookings),
        upcomingBookings: Number(booking.upcomingBookings),
      })),
    },
  };
}
