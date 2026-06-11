// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// GlitchTip uses the Sentry SDK — see: https://glitchtip.com/documentation

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553",


  // Set a low sample rate in production to save disk space (1%)
  tracesSampleRate: 0.01,

  // Route events through our own API to avoid ad-blockers
  tunnel: "/api/glitchtip-tunnel",
});
