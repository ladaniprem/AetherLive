// k6 load test for AetherLive
// Run: k6 run scripts-for-testing/load-test.js
// Install k6: https://k6.io/docs/getting-started/installation/

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const CONVEX_URL = __ENV.CONVEX_URL || "http://localhost:3003";
const ORG_ID = __ENV.ORG_ID || "org-test-1";

const rateLimitBlocked = new Rate("rate_limit_blocked");
const requestDuration = new Trend("request_duration");

export const options = {
  stages: [
    { duration: "10s", target: 5 },
    { duration: "20s", target: 20 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    rate_limit_blocked: ["rate<0.5"],
  },
};

export default function () {
  group("Public Contact Session Creation", () => {
    const payload = JSON.stringify({
      name: "Load Test User",
      email: `loadtest${__VU}@example.com`,
      organizationId: ORG_ID,
      metadata: {
        userAgent: "k6-load-test",
        language: "en-US",
        platform: "k6",
        vendor: "k6",
        screenResolution: "1920x1080",
        viewportSize: "1920x1080",
        timezone: "UTC",
        timezoneOffset: 0,
        cookieEnabled: true,
        referrer: "https://loadtest.example.com",
        currentUrl: "https://loadtest.example.com",
      },
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = http.post(`${CONVEX_URL}/api/mutation/public/contactSessions:create`, payload, params);
    requestDuration.add(res.timings.duration);

    if (res.status === 429) {
      rateLimitBlocked.add(1);
      console.log(`Rate limited after ${__ITER} iterations (VU ${__VU})`);
    } else {
      rateLimitBlocked.add(0);
    }

    check(res, {
      "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
      "response time < 3s": (r) => r.timings.duration < 3000,
    });
  });

  sleep(1);
}
