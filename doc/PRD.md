# AetherLive — Product Requirements Document
 
> **Timeline:** Jul 6 – Sep 11, 2026 (12 sprints, 10 weeks)  
> **Status:** Draft v1

---

## 1. Product Statement

AI-native customer support platform. A single `<script>` tag embeds a smart widget on any website. Support agents manage conversations from a unified dashboard.

---

## 2. Problem & Solution

| Problem | Solution |
|---------|----------|
| Customers wait too long for support | AI agent answers instantly, escalates to human when needed |
| Embedding a chat widget is complex | One `<script>` tag — no framework lock-in, works everywhere |
| Agents lack customer context | Rich metadata capture (device, location, browser) in every session |
| No unified tool for conversations, KB, and config | Single dashboard with all features |

---

## 3. Target Users

- **End customers** — website visitors who need help (anonymous, no sign-up)
- **Support agents** — internal team replying to conversations, managing KB
- **Admins** — configuring widget appearance, managing plugins (Vapi), billing

---

## 4. Feature Scope

### Dashboard (`apps/web`)
| Feature | Description |
|---------|-------------|
| Auth | Clerk sign-in/sign-up + org selection |
| Conversations | Paginated list, status filter, AI chat detail, status cycling |
| Knowledge Base | File upload (PDF/CSV/TXT), list, delete, categories |
| Widget Customization | Greet message, default suggestions, Vapi voice settings |
| Integrations | Embed code snippets (HTML, React, Next.js, JS) |
| Vapi Plugin | Connect/disconnect, view phone numbers + AI assistants |
| Settings | Profile, theme, notifications |
| Billing | Clerk PricingTable |

### Widget (`apps/widget`)
| Feature | Description |
|---------|-------------|
| Multi-screen flow | Loading → Auth → Selection → Chat / Voice / Inbox / Contact |
| AI Chat | Message thread, suggestions, markdown responses |
| Voice Calls | Vapi-powered, real-time transcript |
| Anonymous sessions | Metadata capture, localStorage persistence |

### Embed SDK (`apps/embed`)
| Feature | Description |
|---------|-------------|
| Zero-dependency IIFE | No framework required |
| FAB + iframe | Floating button opens widget panel |
| PostMessage API | `close`, `resize` handlers |
| Global API | `EchoWidget.init()`, `.show()`, `.hide()`, `.destroy()` |

### Backend (Convex)
| Feature | Description |
|---------|-------------|
| 7 tables | users, contactSessions, conversations, files, widgetSettings, plugins, secrets |
| Public API | Widget-facing: sessions, messages, settings, plugins |
| Private API | Dashboard-facing: conversations, files, Vapi, settings |
| AI Agent | `@convex-dev/agent` + OpenAI GPT-4o-mini |

---

## 5. Tech Stack

| Layer | Technology | Used For |
|-------|------------|----------|
| **Monorepo** | Turborepo + pnpm workspaces | Shared configs, parallel dev/build |
| **Dashboard** | Next.js 16 (App Router), TypeScript | Web app routing, server components |
| **Widget** | Next.js 16 (App Router), TypeScript | Standalone customer-facing app |
| **Embed SDK** | Vanilla TS → IIFE (Vite build) | Zero-dependency `<script>` tag |
| **UI** | shadcn/ui + Tailwind CSS + Radix UI | 55+ reusable components |
| **Backend** | Convex (serverless DB + realtime) | Schema, mutations, queries, live subscriptions |
| **Auth** | Clerk (JWT → Convex) | Sign-in, org management, session validation |
| **AI** | `@convex-dev/agent` + OpenAI GPT-4o-mini | Message threading, response enhancement |
| **Voice** | Vapi Web SDK | In-widget voice calls with transcript |
| **State** | Jotai atoms | Widget screen routing, persistence |
| **Forms** | react-hook-form + Zod | Dashboard customization, settings forms |
| **Styling** | Tailwind CSS + CVA + `cn()` utility | Utility-first styling, variant management |
| **Icons** | Lucide React | Iconography across all components |
| **Charts** | Recharts v3 | Dashboard data visualization |
| **Observability** | Sentry (tunnel + Session Replay) | Error tracking, performance, user sessions |
| **CI/QA** | ESLint, TypeScript, Turborepo caching | Lint, typecheck, pipeline |

---

## 6. Architecture

```
Website ──> Embed SDK ──> iframe ──> Widget App (port 3001)
                                              │
Browser ──> Dashboard App (port 3000) ─────────┤
                                              │
                                   Convex Backend
                                   ├── Public API (widget)
                                   ├── Private API (dashboard)
                                   └── AI Agent
                                              │
                                   Clerk ─────┘
                                   Sentry
                                   Vapi
                                   OpenAI
```

---

## 7. Timeline — 12 Sprints

```
Jul 6 ───────────────────────────────────────────────────── Sep 11
│
├─ S1  Foundation        (Jul 6-9)     Monorepo, Auth, Schema
├─ S2  Dashboard Shell   (Jul 10-15)   Layout, Guards, Landing
├─ S3  Embed SDK         (Jul 16-21)   IIFE, Iframe, Session API
├─ S4  Widget Screens    (Jul 22-27)   Loading→Auth→Selection→Inbox
├─ S5  Convex Backend     (Jul 28-31)   Public+Private Conversation CRUD
├─ S6  Widget Chat       (Aug 3-6)     AI Chat, Suggestions, Agent Wire
├─ S7  Dashboard Convex  (Aug 7-12)    List, Detail, Reply, Status
├─ S8  Knowledge Base    (Aug 13-18)   Upload, List, Delete
├─ S9  Config+Integrate  (Aug 19-24)   Customization, Snippets, OpenAI
├─ S10 Vapi Plugin       (Aug 25-28)   Connect, Assistants, Phones
├─ S11 Voice Widget      (Aug 31-Sep 3) Voice Call, Settings, Billing
└─ S12 Polish & Launch   (Sep 4-11)    Sentry, Tests, Deploy, CDN
```

**50 working days · 66 tasks · 3 parallel tracks**

---

## 8. Team

| Role | Count | Responsibility |
|------|-------|----------------|
| Frontend Engineer | 2 | Dashboard, Widget, Embed SDK, UI components |
| Backend Engineer | 1 | Convex schema, public/private API, AI agent |
| QA | 1 | E2E tests, regression, gap remediation |
| Infra/DevOps | 1 | CI/CD, Sentry, production deploy, CDN |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Widget load time | < 2s (FAB visible) |
| AI first response | < 3s |
| Dashboard page load | < 1.5s |
| Embed SDK size | < 10KB gzipped |
| Test coverage (critical paths) | 100% by S12 |

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| AI agent not ready by S6 | Scaffold with mock responses first, wire real LLM in S9 |
| Vapi API changes | Isolate Vapi integration behind plugin abstraction layer |
| Auth redirect loops | Comprehensive auth flow audit in S12 |
| Embed SDK compatibility | Test across Chrome, Firefox, Safari, Edge in S3 |
