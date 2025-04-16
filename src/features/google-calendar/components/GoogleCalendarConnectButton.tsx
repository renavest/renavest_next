import React from 'react';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';
import { google } from 'googleapis';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export function GoogleCalendarConnectButton() {
  const router = useRouter();

  const handleGoogleCalendarConnect = () => {
    // Define the scopes needed for Google Calendar integration
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    // Generate the authorization URL
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Enables refresh token
      scope: scopes,
      prompt: 'consent', // Always ask for consent to get refresh token
    });

    // Redirect to Google OAuth consent screen
    router.push(url);
  };

  return (
    <Button onClick={handleGoogleCalendarConnect} variant='outline' className='w-full'>
      Connect Google Calendar
    </Button>
  );
}
