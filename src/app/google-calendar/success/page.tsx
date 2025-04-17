import Link from 'next/link';

export default function GoogleCalendarSuccessPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
        <h1 className='text-2xl font-bold text-purple-700 mb-4'>Google Calendar Connected!</h1>
        <p className='text-gray-700 mb-6'>
          Your Google Calendar has been successfully integrated with Renavest. You can now sync your
          sessions and manage your schedule seamlessly.
        </p>
        <Link href='/dashboard'>
          <span className='inline-block px-6 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 transition'>
            Return to Dashboard
          </span>
        </Link>
      </div>
    </div>
  );
}
