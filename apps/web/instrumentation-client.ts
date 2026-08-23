// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 0 : 1.0,

  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 0 : 0.1,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "development" ? 0 : 1.0,

  enableLogs: process.env.NODE_ENV !== "development",

  integrations: process.env.NODE_ENV === "development"
    ? []
    : [Sentry.replayIntegration()],

  tunnel: "/api/sentry-tunnel",
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
