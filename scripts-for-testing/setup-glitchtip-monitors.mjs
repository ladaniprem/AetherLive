/**
 * Run this script once to create uptime monitors in GlitchTip.
 * Usage: APP_URL=https://your-domain.com pnpm run setup:monitors
 *
 * Requires SENTRY_AUTH_TOKEN and SENTRY_ORG to be set in .env.sentry-build-plugin
 * OR passed as environment variables directly.
 *
 * ⚠️  GlitchTip must be able to reach APP_URL from the internet.
 *     localhost will NOT work — use ngrok or a deployed preview URL.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../apps/web/.env.sentry-build-plugin");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim().replace(/\r/g, "");
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {
    // Fall through to process.env
  }
}

loadEnv();

const GLITCHTIP_URL = "https://app.glitchtip.com";
const AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const ORG = process.env.SENTRY_ORG;
const APP_BASE_URL = process.env.APP_URL;

if (!AUTH_TOKEN || !ORG) {
  console.error(
    "❌ Missing SENTRY_AUTH_TOKEN or SENTRY_ORG.\n" +
    "   Set them in apps/web/.env.sentry-build-plugin or as env vars.",
  );
  process.exit(1);
}

if (!APP_BASE_URL || APP_BASE_URL.includes("localhost") || APP_BASE_URL.includes("127.0.0.1")) {
  console.error(
    "\n❌ APP_URL is not set to a valid public URL.\n\n" +
    "   GlitchTip uptime monitors need to reach your app from the internet.\n" +
    "   localhost will NOT work.\n\n" +
    "   Options:\n" +
    "   • Use ngrok:   npx ngrok http 3000   then copy the https:// URL\n" +
    "   • Deploy a free preview to Vercel / Netlify / Railway\n\n" +
    "   Then run:\n" +
    "   APP_URL=https://your-public-url.com pnpm run setup:monitors\n",
  );
  process.exit(1);
}

const MONITORS = [
  {
    name: "AetherLive — Health Check",
    type: "get",
    interval: 60,
    url: `${APP_BASE_URL}/api/health`,
    expectedStatus: 200,
    expectedBody: "",
    timeout: 10,
  },
  {
    name: "AetherLive — Homepage",
    type: "get",
    interval: 300,
    url: APP_BASE_URL,
    expectedStatus: 200,
    expectedBody: "",
    timeout: 10,
  },
];

async function createMonitor(monitor) {
  const url = `${GLITCHTIP_URL}/api/0/organizations/${ORG}/monitors/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(monitor),
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    console.log(`✅ Created: "${monitor.name}" → ${monitor.url}`);
    console.log(`   ID: ${data.id ?? "unknown"}`);
  } else {
    console.error(`❌ Failed "${monitor.name}": HTTP ${res.status}`);
    console.error(`   Response:`, JSON.stringify(data, null, 2));
  }
}

async function listMonitors() {
  const url = `${GLITCHTIP_URL}/api/0/organizations/${ORG}/monitors/`;
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${AUTH_TOKEN}` },
  });
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

async function main() {
  console.log(`\n🔍 Checking existing monitors for org: ${ORG}\n`);

  const existing = await listMonitors();
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing monitor(s):`);
    for (const m of existing) {
      console.log(`  • ${m.name} → ${m.url}`);
    }
    console.log();
  } else {
    console.log("No existing monitors found. Creating...\n");
  }

  const existingUrls = new Set(existing.map((m) => m.url));

  for (const monitor of MONITORS) {
    if (existingUrls.has(monitor.url)) {
      console.log(`⏭️  Skipping "${monitor.name}" — already exists`);
    } else {
      await createMonitor(monitor);
    }
  }

  console.log("\n✨ Done! Visit https://app.glitchtip.com to see your monitors.");
}

main().catch(console.error);
