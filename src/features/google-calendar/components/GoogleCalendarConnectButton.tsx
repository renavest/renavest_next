import React from 'react';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';

export function GoogleCalendarConnectButton() {
  const router = useRouter();

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
    <Button onClick={handleGoogleCalendarConnect} variant='outline' className='w-full'>
      Connect Google Calendar
    </Button>
  );
}
