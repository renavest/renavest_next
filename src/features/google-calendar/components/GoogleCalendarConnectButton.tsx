import React from 'react';

export function GoogleCalendarConnectButton() {
  const handleGoogleCalendarConnect = async () => {
    try {
      const response = await fetch('/api/google-calendar');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      // Optionally handle error (e.g., toast)
      console.error('Failed to initiate Google Calendar connection:', error);
    }
  };

  return (
    <button
      type='button'
      onClick={handleGoogleCalendarConnect}
      className='w-full px-4 py-2 rounded-md bg-purple-600 text-white font-medium shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition'
    >
      Connect Google Calendar
    </button>
  );
}
