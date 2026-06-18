import { NextRequest, NextResponse } from "next/server";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

/**
 * Sentry tunnel route — proxies Sentry SDK envelope requests through
 * this server to avoid ad-blockers blocking direct calls to sentry.io.
 *
 * Referenced in instrumentation-client.ts via `tunnel: "/api/sentry-tunnel"`.
 */
export async function POST(req: NextRequest) {
  if (!DSN) {
    return NextResponse.json({ error: "NEXT_PUBLIC_SENTRY_DSN not set" }, { status: 500 });
  }

  const dsn = new URL(DSN);

  // Extract key and project from DSN
  const sentryKey = dsn.username;
  const projectId = dsn.pathname.replace("/", "");
  const upstreamUrl = `${dsn.protocol}//${dsn.host}/api/${projectId}/envelope/`;

  const body = await req.text();

  // Build the X-Sentry-Auth header so Sentry can authenticate the request
  const sentryAuth = [
    "Sentry sentry_version=7",
    `sentry_key=${sentryKey}`,
    "sentry_client=sentry-tunnel/1.0",
  ].join(", ");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "X-Sentry-Auth": sentryAuth,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (!response.ok) {
      const envelopeFirstLine = body.split("\n")[0];
      console.error(
        `[sentry-tunnel] Sentry returned ${response.status}: ${responseText}`,
      );
      console.error(`[sentry-tunnel] Envelope header: ${envelopeFirstLine}`);
      console.error(`[sentry-tunnel] Upstream URL: ${upstreamUrl}`);
    }

    return NextResponse.json(
      { status: response.ok ? "ok" : responseText },
      { status: response.status },
    );
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[sentry-tunnel] Fetch failed to ${upstreamUrl}:`, error);

    const isTimeout = error.name === "AbortError" || error.code === "ETIMEDOUT";
    return NextResponse.json(
      { error: isTimeout ? "Connect timeout" : "Bad Gateway" },
      { status: isTimeout ? 504 : 502 },
    );
  }
}
