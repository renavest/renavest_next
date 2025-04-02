'use client';

import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import React, { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://us.posthog.com',
    ui_host: 'https://us.posthog.com',
    capture_pageview: true,
    debug: process.env.NODE_ENV === 'development',
  });

  return (
    <PHProvider client={posthog}>
      <UserTracker />
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function UserTracker() {
  const { user } = useUser();
  const posthog = usePostHog();

  useEffect(() => {
    if (user && posthog) {
      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        role: user.unsafeMetadata?.role,
        created_at: user.createdAt,
      });
    }
  }, [user, posthog]);

  return null;
}

function PostHogPageView() {
  const pathname = window.location.pathname;
  const searchParams = window.location.search;
  const posthog = usePostHog();

  useEffect(() => {
    const url = `${pathname}${searchParams}`;
    if (pathname && posthog) {
      posthog.capture('$pageview', {
        $current_url: url,
        path: pathname,
        search_params: searchParams,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <React.Suspense fallback={null}>
      <PostHogPageView />
    </React.Suspense>
  );
}
