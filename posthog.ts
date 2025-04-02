import { PostHog } from 'posthog-node';

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: 'https://us.posthog.com',
    flushAt: 20,
    flushInterval: 30000,
  });

  return {
    capture: (event: string, properties: Record<string, any>) => {
      // Ensure consistent tracking across client and server
      posthogClient.capture({
        distinctId: properties.user_id || 'anonymous',
        event,
        properties: {
          ...properties,
          tracking_source: 'server',
          timestamp: new Date().toISOString(),
        },
      });
    },
    identify: (distinctId: string, properties: Record<string, any>) => {
      // Server-side user identification
      posthogClient.identify({
        distinctId,
        properties: {
          ...properties,
          identification_source: 'server',
        },
      });
    },
  };
}
