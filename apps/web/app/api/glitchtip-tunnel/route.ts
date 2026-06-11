import { NextRequest, NextResponse } from "next/server";

const DSN = "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553";

/**
 * GlitchTip tunnel route — proxies Sentry SDK envelope requests through
 * this server to avoid ad-blockers blocking direct calls to app.glitchtip.com.
 *
 * Referenced in instrumentation-client.ts via `tunnel: "/api/glitchtip-tunnel"`.
 */
export async function POST(req: NextRequest) {
  const dsn = new URL(DSN);

  // Extract key and project from DSN
  const sentryKey = dsn.username;
  const projectId = dsn.pathname.replace("/", "");
  const upstreamUrl = `${dsn.protocol}//${dsn.host}/api/${projectId}/envelope/`;

  const body = await req.text();

  // Build the X-Sentry-Auth header so GlitchTip can authenticate the request
  const sentryAuth = [
    "Sentry sentry_version=7",
    `sentry_key=${sentryKey}`,
    "sentry_client=sentry-tunnel/1.0",
  ].join(", ");

  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "X-Sentry-Auth": sentryAuth,
    },
    body,
  });

  const responseText = await response.text();

  if (!response.ok) {
    const envelopeFirstLine = body.split("\n")[0];
    console.error(
      `[glitchtip-tunnel] GlitchTip returned ${response.status}: ${responseText}`,
    );
    console.error(`[glitchtip-tunnel] Envelope header: ${envelopeFirstLine}`);
    console.error(`[glitchtip-tunnel] Upstream URL: ${upstreamUrl}`);
  }

  return NextResponse.json(
    { status: response.ok ? "ok" : responseText },
    { status: response.status },
  );
}
