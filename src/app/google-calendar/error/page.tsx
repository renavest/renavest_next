import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function GoogleCalendarErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const getErrorMessage = (reason: string | undefined) => {
    switch (reason) {
      case 'token_exchange_failed':
        return {
          title: 'Insufficient Calendar Permissions',
          description:
            'We need permission to access your Google Calendar to manage your availability. Please reconnect and make sure to check all required permissions.',
        };
      default:
        return {
          title: 'Google Calendar Connection Error',
          description: 'An error occurred while connecting to Google Calendar. Please try again.',
        };
    }
  };

  const { title, description } = getErrorMessage(searchParams.reason);

  return (
    <div className='container mx-auto max-w-2xl py-8'>
      <div className='bg-white shadow rounded-lg p-6'>
        <div className='flex flex-col items-center space-y-6 text-center'>
          <div className='rounded-full bg-red-100 p-3'>
            <Calendar className='h-6 w-6 text-red-600' />
          </div>

          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
            <p className='text-gray-500'>{description}</p>
          </div>

          <div className='flex flex-col gap-4 w-full'>
            <Link href='/therapist/integations' className='w-full'>
              <button
                className='flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                type='button'
              >
                <Calendar className='mr-2 h-4 w-4' />
                Reconnect Google Calendar
              </button>
            </Link>

            <Link href='/settings' className='w-full'>
              <button
                className='flex items-center justify-center w-full px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
                type='button'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Settings
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
