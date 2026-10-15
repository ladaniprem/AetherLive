export const INTEGRATIONS = [
  {
    id: "html",
    title: "HTML",
    icon: "/languages/html5.svg",
  },
  {
    id: "react",
    title: "React",
    icon: "/languages/react.svg",
  },
  {
    id: "nextjs",
    title: "Next.js",
    icon: "/languages/nextjs.svg",
  },
  {
    id: "javascript",
    title: "JS",
    icon: "/languages/javascript.svg",
  },
] as const;

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];

// The built embed script (apps/embed) is served as a static asset by the
// widget app: <widget-origin>/embed/widget.js. Override the origin per
// environment with NEXT_PUBLIC_WIDGET_URL (defaults to production).
const WIDGET_ORIGIN =
  process.env.NEXT_PUBLIC_WIDGET_URL ?? "https://widget.aetherlive.live";
const SCRIPT_URL = `${WIDGET_ORIGIN}/embed/widget.js`;

export const HTML_SCRIPT = `<!-- AetherLive Chat Widget — paste before the closing </body> tag -->
<script
  src="${SCRIPT_URL}"
  data-organization-id="{{ORGANIZATION_ID}}"
></script>`;

export const NEXTJS_SCRIPT = `// app/layout.tsx — place inside <body> (uses next/script)
import Script from "next/script";

<Script
  src="${SCRIPT_URL}"
  data-organization-id="{{ORGANIZATION_ID}}"
  strategy="afterInteractive"
/>`;

export const REACT_SCRIPT = `<!-- public/index.html (Vite / CRA) — before the closing </body> tag -->
<script
  src="${SCRIPT_URL}"
  data-organization-id="{{ORGANIZATION_ID}}"
></script>`;

export const JAVASCRIPT_SCRIPT = `// AetherLive Chat Widget — run once on page load (e.g. in main.js)
(function () {
  var s = document.createElement("script");
  s.src = "${SCRIPT_URL}";
  s.setAttribute("data-organization-id", "{{ORGANIZATION_ID}}");
  document.body.appendChild(s);
})();`;

export const INTEGRATION_INSTRUCTIONS: Record<IntegrationId, string> = {
  html: "Paste the snippet just before the closing </body> tag of every page where the chatbox should appear.",
  nextjs:
    "Add it to app/layout.tsx inside the <body> element (Pages Router: pages/_document.tsx). The Script component ships with Next.js.",
  react:
    "Paste the snippet into public/index.html (Vite) or public/index.html (Create React App) before the closing </body> tag.",
  javascript:
    "Add the snippet to your main JavaScript file so it runs once on every page load.",
};
