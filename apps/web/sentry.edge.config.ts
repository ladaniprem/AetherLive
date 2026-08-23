// This file configures the initialization of Sentry for edge features
// (middleware, edge routes, and so on).
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: true,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 0 : 0.1,

  enableLogs: process.env.NODE_ENV !== "development",
});
