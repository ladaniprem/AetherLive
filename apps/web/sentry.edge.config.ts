// This file configures the initialization of Sentry for edge features
// (middleware, edge routes, and so on).
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Include user IP, request headers, etc. in error events
  sendDefaultPii: true,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Enable Sentry Logs product
  enableLogs: true,
});
