"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

class GlitchTipTestError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "GlitchTipTestError";
  }
}

export default function Page() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function throwTestError() {
    setStatus("idle");
    try {
      // 1. Capture a manual message
      Sentry.captureMessage("GlitchTip test message from AetherLive", "info");

      // 2. Throw and capture a real error
      const err = new GlitchTipTestError(
        "This is a test error sent to GlitchTip from the example page.",
      );
      Sentry.captureException(err);

      // 3. Also hit the server-side API route to test server error reporting
      const res = await fetch("/api/sentry-example-api");
      if (!res.ok) {
        console.warn("Server example API returned non-OK status");
      }

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <main>
        <div className="flex-spacer" />

        <svg
          height="40"
          width="40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="GlitchTip logo"
          viewBox="0 0 40 40"
        >
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>

        <h1>GlitchTip Test Page</h1>

        <p className="description">
          Click the button to send a test error and message to{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://app.glitchtip.com"
          >
            GlitchTip
          </a>
          . Check your{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://app.glitchtip.com"
          >
            Issues dashboard
          </a>{" "}
          after clicking — it may take a few seconds to appear.
        </p>

        <button type="button" id="send-test-error" onClick={throwTestError}>
          <span>Send Test Error to GlitchTip</span>
        </button>

        {status === "sent" && (
          <p className="success">
              Error sent! Check your GlitchTip issues dashboard.
          </p>
        )}
        {status === "error" && (
          <p className="failure">
             Something went wrong sending the error. Check the browser console.
          </p>
        )}
        {status === "idle" && <div className="placeholder" />}

        <div className="flex-spacer" />
      </main>

      <style>{`
        main {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        }

        h1 {
          padding: 4px 8px;
          border-radius: 4px;
          background-color: rgba(24, 20, 35, 0.05);
          font-family: monospace;
          font-size: 22px;
          line-height: 1.2;
        }

        p {
          margin: 0;
          font-size: 18px;
        }

        a {
          color: #6341F0;
          text-decoration: underline;
          cursor: pointer;
        }

        button {
          border-radius: 8px;
          color: white;
          cursor: pointer;
          background-color: #553DB8;
          border: none;
          padding: 0;
          margin-top: 4px;
        }

        button > span {
          display: inline-block;
          padding: 12px 20px;
          border-radius: inherit;
          font-size: 18px;
          font-weight: bold;
          line-height: 1;
          background-color: #7553FF;
          border: 1px solid #553DB8;
          transform: translateY(-4px);
          transition: transform 0.1s ease;
        }

        button:hover > span {
          transform: translateY(-8px);
        }

        button:active > span {
          transform: translateY(0);
        }

        .description {
          text-align: center;
          color: #6E6C75;
          max-width: 500px;
          line-height: 1.6;
        }

        .flex-spacer {
          flex: 1;
        }

        .success {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 18px;
          background-color: #00F261;
          border: 1px solid #00BF4D;
          color: #181423;
        }

        .failure {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 18px;
          background-color: #E50045;
          border: 1px solid #A80033;
          color: white;
        }

        .placeholder {
          height: 46px;
        }
      `}</style>
    </div>
  );
}
