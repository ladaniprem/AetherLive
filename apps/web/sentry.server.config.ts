// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// See: https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  sendDefaultPii: false,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 0 : 0.1,

  includeLocalVariables: true,

  enableLogs: process.env.NODE_ENV !== "development",
});
