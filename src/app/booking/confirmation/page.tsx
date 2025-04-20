import { redirect } from 'next/navigation';

import { BookingConfirmationView } from '@/src/features/booking/components/BookingConfirmation/BookingConfirmationView';

interface PageProps {
  searchParams: { bookingId?: string };
}

export default async function Page({ searchParams }: PageProps) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    redirect('/employee');
  }

  return <BookingConfirmationView bookingId={bookingId} />;
}
