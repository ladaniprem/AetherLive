import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
};

export default withSentryConfig(nextConfig, {
  // GlitchTip source map upload configuration
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sentryUrl: "https://app.glitchtip.com",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
