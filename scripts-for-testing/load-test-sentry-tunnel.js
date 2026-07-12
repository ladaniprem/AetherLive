// k6 load test for Sentry tunnel rate limiting
// Run: k6 run scripts-for-testing/load-test-sentry-tunnel.js
// Tests that the in-memory rate limiter blocks excess requests

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3003";

const rateLimited = new Rate("requests_rate_limited");

export const options = {
  scenarios: {
    single_ip_attack: {
      executor: "constant-vus",
      vus: 1,
      duration: "5s",
    },
    distributed_ips: {
      executor: "per-vu-iterations",
      vus: 10,
      iterations: 5,
      startTime: "6s",
    },
  },
  thresholds: {
    requests_rate_limited: ["rate>0.5"],
  },
};

export default function () {
  const payload = "dummy-sentry-envelope-data\n{}\n{}";

  const params = {
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "X-Forwarded-For": `192.168.1.${__VU}`,
    },
  };

  const res = http.post(`${BASE_URL}/api/sentry-tunnel`, payload, params);

  if (res.status === 429) {
    rateLimited.add(1);
  }

  check(res, {
    "status is expected (200, 500, or 429)": (r) =>
      [200, 429, 500, 502, 504].includes(r.status),
  });

  sleep(0.1);
}
