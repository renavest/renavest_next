import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { OAuth2Client } from 'google-auth-library';

import { therapists } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

export interface TokenInfo {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
}

export interface TherapistTokenInfo {
  id: number;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarIntegrationStatus: string;
}

export class GoogleCalendarTokenManager {
  private oauth2Client: OAuth2Client;
  private db: NodePgDatabase<Record<string, unknown>>;

  constructor(db: NodePgDatabase<Record<string, unknown>>) {
    this.db = db;
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    // Set up token event listener to automatically save refreshed tokens
    this.oauth2Client.on('tokens', (tokens) => {
      console.log('Token event received:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      });
      // Note: The token update will be handled by the calling method
      // since we need the therapistId context
    });
  }

  /**
   * Ensures the therapist has valid tokens, refreshing if necessary
   * Returns configured OAuth2Client ready for API calls
   */
  async ensureValidTokens(therapist: TherapistTokenInfo): Promise<OAuth2Client> {
    if (!therapist.googleCalendarAccessToken || !therapist.googleCalendarRefreshToken) {
      throw new Error('No tokens available for therapist');
    }

    // Set credentials on the client
    this.oauth2Client.setCredentials({
      access_token: therapist.googleCalendarAccessToken,
      refresh_token: therapist.googleCalendarRefreshToken,
    });

    // Check if token needs refresh (if we have expiry info) or proactively refresh
    const needsRefresh = await this.shouldRefreshToken(therapist.googleCalendarAccessToken);

    if (needsRefresh) {
      console.log(`Proactively refreshing token for therapist ${therapist.id}`);
      await this.refreshTokens(therapist.id);
    }

    return this.oauth2Client;
  }

  /**
   * Checks if a token should be refreshed
   * Uses getTokenInfo to validate the token and check expiry
   */
  private async shouldRefreshToken(accessToken: string): Promise<boolean> {
    try {
      const tokenInfo = await this.oauth2Client.getTokenInfo(accessToken);

      // If we can get token info, check if it expires soon (within 5 minutes)
      if (tokenInfo.expiry_date) {
        const now = Date.now();
        const expiresAt = tokenInfo.expiry_date * 1000; // Convert to milliseconds
        const fiveMinutes = 5 * 60 * 1000;

        return expiresAt - now < fiveMinutes;
      }

      // If no expiry info, assume it's good for now
      return false;
    } catch (error) {
      console.log('Token validation failed, needs refresh:', error);
      // If getTokenInfo fails, we likely need to refresh
      return true;
    }
  }

  /**
   * Refreshes tokens for a therapist and updates the database
   */
  async refreshTokens(therapistId: number): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token received from refresh');
      }

      console.log('Successfully refreshed tokens for therapist:', therapistId);

      // Update the database with new tokens
      const updateData: any = {
        googleCalendarAccessToken: credentials.access_token,
        updatedAt: createDate(new Date(), 'UTC').toJSDate(),
      };

      // Only update refresh token if we received a new one
      if (credentials.refresh_token) {
        updateData.googleCalendarRefreshToken = credentials.refresh_token;
      }

      await this.db.update(therapists).set(updateData).where(eq(therapists.id, therapistId));

      // Update the client with new credentials
      this.oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || this.oauth2Client.credentials.refresh_token,
      });
    } catch (error) {
      console.error('Failed to refresh tokens for therapist:', therapistId, error);

      // Check if this is an auth error that requires disconnection
      if (this.isRefreshAuthError(error)) {
        console.warn(`Disconnecting therapist ${therapistId} due to refresh auth error`);
        await this.disconnectTherapist(therapistId);
        throw new Error('Authentication failed. Please reconnect your Google Calendar.');
      }

      throw error;
    }
  }

  /**
   * Validates tokens for a therapist without making external calls
   */
  validateTherapistTokens(therapist: TherapistTokenInfo): boolean {
    return !!(
      therapist.googleCalendarAccessToken &&
      therapist.googleCalendarRefreshToken &&
      therapist.googleCalendarIntegrationStatus === 'connected'
    );
  }

  /**
   * Checks if an error is a refresh authentication error that requires disconnection
   */
  private isRefreshAuthError(error: any): boolean {
    const errorMessage = error?.message || '';
    const errorCode = error?.code;

    return (
      errorCode === 401 ||
      errorCode === 403 ||
      errorMessage.includes('invalid_grant') ||
      errorMessage.includes('invalid_token') ||
      errorMessage.includes('token expired') ||
      errorMessage.includes('refresh token is invalid') ||
      errorMessage.includes('Token has been expired or revoked')
    );
  }

  /**
   * Disconnects a therapist's Google Calendar integration
   */
  private async disconnectTherapist(therapistId: number): Promise<void> {
    console.warn(`Disconnecting therapist ${therapistId} Google Calendar integration`);

    await this.db
      .update(therapists)
      .set({
        googleCalendarAccessToken: null,
        googleCalendarRefreshToken: null,
        googleCalendarEmail: null,
        googleCalendarIntegrationStatus: 'not_connected',
        googleCalendarIntegrationDate: null,
        updatedAt: createDate(new Date(), 'UTC').toJSDate(),
      })
      .where(eq(therapists.id, therapistId));
  }

  /**
   * Creates a new OAuth2Client configured for authorization
   */
  createAuthClient(): OAuth2Client {
    return new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  /**
   * Generates authorization URL with proper settings for refresh tokens
   */
  generateAuthUrl(therapistId: string): string {
    const authClient = this.createAuthClient();

    return authClient.generateAuthUrl({
      access_type: 'offline', // Required for refresh tokens
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar.settings.readonly',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
      prompt: 'consent', // Force consent to ensure refresh token
      state: JSON.stringify({ therapistId }),
      // Add additional parameters to maximize refresh token success
      include_granted_scopes: true,
    });
  }

  /**
   * Exchanges authorization code for tokens with comprehensive error handling
   */
  async exchangeCodeForTokens(code: string): Promise<TokenInfo> {
    const authClient = this.createAuthClient();

    try {
      const { tokens } = await authClient.getToken(code);

      if (!tokens.access_token) {
        throw new Error('No access token received from authorization code exchange');
      }

      if (!tokens.refresh_token) {
        console.warn('No refresh token received - this may cause future authentication issues');
        throw new Error(
          'No refresh token received. Please try reconnecting and ensure you grant full permissions.',
        );
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type,
      };
    } catch (error) {
      console.error('Failed to exchange authorization code for tokens:', error);
      throw new Error(
        `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Validates and gets info about an access token
   */
  async getTokenInfo(accessToken: string) {
    try {
      const tempClient = this.createAuthClient();
      return await tempClient.getTokenInfo(accessToken);
    } catch (error) {
      console.error('Failed to get token info:', error);
      throw new Error('Token validation failed');
    }
  }
}

/**
 * Creates a singleton instance of the token manager
 */
export function createTokenManager(
  db: NodePgDatabase<Record<string, unknown>>,
): GoogleCalendarTokenManager {
  return new GoogleCalendarTokenManager(db);
}
