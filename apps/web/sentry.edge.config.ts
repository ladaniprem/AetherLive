// This file configures the initialization of Sentry for edge features
// (middleware, edge routes, and so on).
// GlitchTip uses the Sentry SDK — see: https://glitchtip.com/documentation

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553",

  // Set a low sample rate in production to save disk space (1%)
  tracesSampleRate: 0.01,

});
