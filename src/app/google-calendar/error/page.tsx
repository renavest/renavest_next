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
          title: 'Calendar Connection Needed',
          description:
            'We need your help to access your Google Calendar and support your wellness journey. Reconnecting ensures we can provide personalized scheduling support.',
        };
      default:
        return {
          title: 'Connection Interrupted',
          description:
            "Our connection to Google Calendar was momentarily disrupted. Let's get you back on track.",
        };
    }
  };

  const { title, description } = getErrorMessage(searchParams.reason);

  return (
    <div className='container mx-auto max-w-2xl py-8 px-4'>
      <div className='bg-white shadow-lg rounded-2xl p-8 border border-gray-100'>
        <div className='flex flex-col items-center space-y-6 text-center'>
          <div className='rounded-full bg-purple-100 p-4 animate-pulse-soft'>
            <Calendar className='h-8 w-8 text-[#9071FF]' />
          </div>

          <div className='space-y-4'>
            <h1 className='text-3xl font-bold tracking-tight text-gray-800'>{title}</h1>
            <p className='text-gray-600 max-w-md mx-auto leading-relaxed'>{description}</p>
          </div>

          <div className='flex flex-col gap-4 w-full max-w-xs'>
            <Link href='/therapist/integrations' className='w-full'>
              <button
                className='flex items-center justify-center w-full px-5 py-3 bg-[#9071FF] text-white rounded-lg font-semibold 
                hover:bg-purple-700 transition-all duration-300 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 
                transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                type='button'
              >
                <Calendar className='mr-3 h-5 w-5' />
                Reconnect Calendar
              </button>
            </Link>

            <Link href='/settings' className='w-full'>
              <button
                className='flex items-center justify-center w-full px-5 py-3 border border-gray-300 bg-white text-gray-700 
                rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 ease-in-out 
                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 
                transform hover:-translate-y-0.5 shadow-md hover:shadow-lg'
                type='button'
              >
                <ArrowLeft className='mr-3 h-5 w-5' />
                Back to Settings
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
