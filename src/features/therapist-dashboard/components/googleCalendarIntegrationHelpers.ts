import { toast } from 'sonner';

export async function fetchGoogleCalendarStatus() {
  try {
    const response = await fetch('/api/google-calendar/status');
    return await response.json();
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    toast.error('Failed to check Google Calendar status');
    return { success: false };
  }
}

export async function initiateGoogleCalendarConnection() {
  try {
    const authResponse = await fetch('/api/google-calendar', { method: 'GET' });
    const { authUrl } = await authResponse.json();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating Google Calendar connection:', error);
    toast.error('Failed to connect Google Calendar');
  }
}

export async function disconnectGoogleCalendar(therapistId: number) {
  try {
    const response = await fetch('/api/google-calendar/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ therapistId }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Google Calendar disconnected successfully');
      return true;
    } else {
      toast.error(data.message || 'Failed to disconnect Google Calendar');
      return false;
    }
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    toast.error('Failed to disconnect Google Calendar');
    return false;
  }
}

export async function fetchTherapistId(userId?: string): Promise<number | null> {
  if (!userId) return null;
  try {
    const response = await fetch('/api/therapist/id');
    const data = await response.json();
    return data.therapistId || null;
  } catch (error) {
    console.error('Failed to fetch therapist ID:', error);
    return null;
  }
}
