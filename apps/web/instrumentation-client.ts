// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Include user IP, request headers, etc. in error events
  sendDefaultPii: true,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Session Replay: record 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable Sentry Logs product
  enableLogs: true,

  integrations: [
    Sentry.replayIntegration(),
    // Optional: user feedback widget
    // Sentry.feedbackIntegration({ colorScheme: "system" }),
  ],

  // Route browser events through our server to avoid CORS + ad-blocker blocks.
  // NOTE: tunnelRoute in next.config.ts injects this via webpack, but Turbopack
  // (dev mode) skips that — so we set it explicitly here as well.
  tunnel: "/api/sentry-tunnel",
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
