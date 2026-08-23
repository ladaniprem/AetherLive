import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com https://*.clerk.accounts.dev https://cdn.tailwindcss.com https://unpkg.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; media-src 'self' https://hoirqrkdgbmvpwutwuwj.supabase.co; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.clerk.accounts.dev https://*.ingest.sentry.io https://sentry.io https://www.google-analytics.com; frame-src 'self' https://*.clerk.accounts.dev; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry source map upload configuration
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // sentryUrl defaults to https://sentry.io — no override needed

  // Upload wider set of client source files for better stack trace resolution
  widenClientFileUpload: true,

  // Built-in tunnel route — bypasses ad-blockers without a manual API route
  tunnelRoute: "/api/sentry-tunnel",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
