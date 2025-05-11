import { redirect } from 'next/navigation';

import { AlternativeBookingSuccess } from '@/src/features/booking/components/confirmation/AlternativeBookingSuccess';
// import { BookingSuccess } from '@/src/features/booking/components/confirmation/BookingSuccess';
interface PageProps {
  searchParams: { bookingId?: string };
}

export default async function Page({ searchParams }: PageProps) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    redirect('/employee');
  }

  return <AlternativeBookingSuccess />;
}
