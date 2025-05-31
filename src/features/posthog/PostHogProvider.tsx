// Reminder: Use 'ph-no-capture' CSS class on sensitive elements and 'before_send' in PostHog config for PII masking (see ANALYTICS_POSTHOG MDC)
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { Suspense, useEffect } from 'react';

declare global {
  interface Window {
    __clerk_user__?: {
      id?: string;
      role?: string;
      email?: string;
      companyId?: string;
      companyName?: string;
    };
  }
}

declare module 'posthog-js' {
  interface PostHog {
    __initialized?: boolean;
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable tracking in development or for internal users
    const isDev = process.env.NODE_ENV === 'development';
    let user = null;
    if (typeof window !== 'undefined') {
      user = window.__clerk_user__ || null;
    }
    const isInternal = user && user.email && user.email.endsWith('@renavest.com');
    if (isDev || isInternal) return;

    if (!posthog.__initialized) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        debug: isDev,
        before_send: (event) => {
          // Remove PII properties
          if (event && event.properties) {
            delete event.properties.email;
            delete event.properties.user_email;
          }
          return event;
        },
      });
      posthog.__initialized = true;
    }

    // Register super properties
    posthog.register({ app_version: process.env.NEXT_PUBLIC_APP_VERSION });

    // Identify user if available
    if (user && user.id) {
      posthog.identify(user.id, {
        $set: {
          role: user.role,
          email: user.email,
          email_domain: user.email?.split('@')[1],
          last_seen: new Date().toISOString(),
        },
        $set_once: {
          first_seen: new Date().toISOString(),
        },
      });

      // Group analytics for company
      if (user.companyId) {
        posthog.group('company', user.companyId, {
          name: user.companyName,
          last_active: new Date().toISOString(),
        });
      }
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += '?' + search;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
