import { PostHog } from 'posthog-node';

// Reminder: Follow ANALYTICS_POSTHOG MDC rules for all server-side event tracking (naming, properties, shutdown, etc.)

export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}
