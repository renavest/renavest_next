import { redirect } from 'next/navigation';

import { BookingConfirmationView } from '../components/BookingConfirmationView';

interface BookingConfirmationPageProps {
  searchParams: { bookingId?: string };
}

export default function BookingConfirmationPage({ searchParams }: BookingConfirmationPageProps) {
  const { bookingId } = searchParams;

  if (!bookingId) {
    redirect('/dashboard');
  }

  return <BookingConfirmationView bookingId={bookingId} />;
}
