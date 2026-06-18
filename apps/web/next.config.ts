import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
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

