/**
 * Google Calendar Service
 *
 * Centralized service for all Google Calendar API interactions.
 * This abstracts the API calls from components and provides a clean interface.
 */

import type {
  GoogleCalendarStatusResponse,
  GoogleCalendarAuthResponse,
  TherapistTokenInfo,
  WorkingHours,
} from '../types';

/**
 * Service class for Google Calendar API interactions
 */
export class GoogleCalendarService {
  private baseUrl: string;

  constructor(baseUrl = '/api/google-calendar') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate OAuth authorization URL for therapist
   *
   * @param therapistId - The therapist ID to generate auth URL for
   * @returns Promise resolving to auth response with URL
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const { authUrl } = await service.generateAuthUrl('123');
   * window.location.href = authUrl;
   * ```
   */
  async generateAuthUrl(therapistId: string): Promise<GoogleCalendarAuthResponse> {
    const response = await fetch(`${this.baseUrl}?therapistId=${therapistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate auth URL: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Exchange authorization code for tokens
   *
   * @param therapistId - The therapist ID
   * @param code - Authorization code from Google OAuth
   * @returns Promise resolving to authentication response
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const result = await service.exchangeCodeForTokens('123', 'auth_code_123');
   * console.log(`Connected: ${result.calendarEmail}`);
   * ```
   */
  async exchangeCodeForTokens(
    therapistId: string,
    code: string,
  ): Promise<GoogleCalendarAuthResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        therapistId: parseInt(therapistId),
        code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get Google Calendar integration status for therapist
   *
   * @param therapistId - The therapist ID to check status for
   * @returns Promise resolving to status response
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const status = await service.getIntegrationStatus('123');
   * console.log(`Connected: ${status.isConnected}`);
   * ```
   */
  async getIntegrationStatus(therapistId: string): Promise<GoogleCalendarStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status?therapistId=${therapistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get integration status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Disconnect Google Calendar integration for current user
   *
   * @returns Promise resolving to disconnection response
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const result = await service.disconnectIntegration();
   * console.log(`Disconnected: ${result.success}`);
   * ```
   */
  async disconnectIntegration(): Promise<GoogleCalendarAuthResponse> {
    const response = await fetch(`${this.baseUrl}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Disconnection failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get working hours for a therapist
   *
   * @param therapistId - The therapist ID to get working hours for
   * @returns Promise resolving to working hours array
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const hours = await service.getWorkingHours('123');
   * console.log(`${hours.length} working hour blocks configured`);
   * ```
   */
  async getWorkingHours(therapistId: string): Promise<{ workingHours: WorkingHours[] }> {
    const response = await fetch(`/api/therapist/working-hours?therapistId=${therapistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get working hours: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Save working hours for a therapist
   *
   * @param therapistId - The therapist ID to save working hours for
   * @param workingHours - Array of working hours to save
   * @returns Promise resolving to updated working hours
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const hours = [
   *   { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true }
   * ];
   * const result = await service.saveWorkingHours('123', hours);
   * ```
   */
  async saveWorkingHours(
    therapistId: string,
    workingHours: Omit<WorkingHours, 'id'>[],
  ): Promise<{ workingHours: WorkingHours[] }> {
    const response = await fetch('/api/therapist/working-hours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        therapistId,
        workingHours,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to save working hours: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get therapist details by ID
   *
   * @param therapistId - The therapist ID to get details for
   * @returns Promise resolving to therapist details
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const therapist = await service.getTherapistDetails('123');
   * console.log(`Therapist: ${therapist.name}`);
   * ```
   */
  async getTherapistDetails(
    therapistId: string,
  ): Promise<TherapistTokenInfo & { name: string; email: string }> {
    const response = await fetch(`/api/therapist/details/${therapistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get therapist details: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current user's therapist ID
   *
   * @returns Promise resolving to therapist ID or null
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * const therapistId = await service.getCurrentTherapistId();
   * if (therapistId) {
   *   console.log(`Current therapist ID: ${therapistId}`);
   * }
   * ```
   */
  async getCurrentTherapistId(): Promise<number | null> {
    try {
      const response = await fetch('/api/therapist/id', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.therapistId || null;
    } catch (error) {
      console.error('Failed to fetch current therapist ID:', error);
      return null;
    }
  }

  /**
   * Send booking notification to therapist
   *
   * @param therapistName - Name of the therapist
   * @param therapistEmail - Email of the therapist
   * @param bookingType - Type of booking (e.g., 'External Calendar', 'Pending Therapist')
   * @returns Promise resolving to notification response
   *
   * @example
   * ```tsx
   * const service = new GoogleCalendarService();
   * await service.sendBookingNotification(
   *   'Dr. Smith',
   *   'dr.smith@example.com',
   *   'External Calendar'
   * );
   * ```
   */
  async sendBookingNotification(
    therapistName: string,
    therapistEmail: string,
    bookingType: string,
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch('/api/booking/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        therapistName,
        therapistEmail,
        bookingType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to send booking notification: ${response.statusText}`,
      );
    }

    return response.json();
  }
}

/**
 * Default service instance
 * Use this for most operations unless you need a custom configuration
 *
 * @example
 * ```tsx
 * import { googleCalendarService } from '@/src/features/google-calendar';
 *
 * const status = await googleCalendarService.getIntegrationStatus('123');
 * ```
 */
export const googleCalendarService = new GoogleCalendarService();

/**
 * Factory function to create a custom service instance
 *
 * @param baseUrl - Custom base URL for API calls
 * @returns New GoogleCalendarService instance
 *
 * @example
 * ```tsx
 * import { createGoogleCalendarService } from '@/src/features/google-calendar';
 *
 * const customService = createGoogleCalendarService('/api/v2/calendar');
 * ```
 */
export function createGoogleCalendarService(baseUrl?: string): GoogleCalendarService {
  return new GoogleCalendarService(baseUrl);
}
