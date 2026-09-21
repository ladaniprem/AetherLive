# Limitations and Weaknesses

## Incomplete / Broken Functionality

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | `users.add` mutation throws before DB insert — non-functional | `packages/backend/convex/users.ts:25` | Critical |
| 2 | `ConversationsPanel` component missing | `modules/dashboard/layouts/conversations-layout.tsx` | High |
| 3 | `dashboard/components/` and `dashboard/views/` are empty | `apps/web/modules/dashboard/` | High |
| 4 | `subtract` exported from math package but `src/subtract.ts` missing | `packages/math/` | Medium |
| 5 | Widget app uses `organizationId` via query string with no auth — security concern | `apps/widget/` | High |

## Auth & Security

| # | Issue | Details |
|---|-------|---------|
| 1 | Auth layering (middleware + guard + page) could cause redirect loops | `proxy.ts`, `auth-guard.tsx`, `(auth)/` routes |
| 2 | Widget app has zero authentication — relies on plain `ConvexProvider` | No Clerk, no JWT validation for widget clients |
| 3 | No rate limiting or brute-force protection | All Convex endpoints are unprotected |
| 4 | No input sanitization or validation beyond Convex schema | XSS, injection risks in chat/text inputs |
| 5 | No audit logging for sensitive operations | No record of who did what and when |
| 6 | No RBAC (role-based access control) beyond org-level checks | All org members have same permissions |

## Testing & Quality

| # | Issue | Details |
|---|-------|---------|
| 1 | No unit tests, integration tests, or E2E tests | Entire project has zero test files |
| 2 | No test framework configured | Jest, Vitest, Playwright, or Cypress not set up |
| 3 | No linting CI gate | ESLint config exists but no enforced pre-commit or CI check |
| 4 | No type-checking CI gate | TypeScript strictness not enforced in pipeline |
| 5 | No code coverage tracking | Unknown test coverage metrics |

## Infrastructure & DevOps

| # | Issue | Details |
|---|-------|---------|
| 1 | No CI/CD pipeline | No GitHub Actions, GitLab CI, or other automation |
| 2 | No Docker/containerization | No Dockerfile or docker-compose for reproducible builds |
| 3 | No deployment config | No Vercel, Netlify, Railway, or other deployment config |
| 4 | No staging/production environment separation | Single `.env` setup, no env-specific configs |
| 5 | No database migration strategy | Convex handles schema, but no rollback or versioning plan |
| 6 | No backup/disaster recovery plan | No data export or snapshot strategy |

## Documentation

| # | Issue | Details |
|---|-------|---------|
| 1 | No contributing guide | New contributors have no onboarding docs |
| 2 | No license file | Legal status of the project unclear |
| 3 | No changelog | No release history or version tracking |
| 4 | Migration doc route mismatch | `doc/glitchtip-to-sentry-migration.md` references `/monitoring` route, code uses `/api/sentry-tunnel` |
| 5 | No API documentation | Convex queries/mutations not documented for consumers |
| 6 | No architecture decision records | No rationale for technical choices |

## Backend (Convex)

| # | Issue | Details |
|---|-------|---------|
| 1 | Schema is extremely minimal — only `users` table with `name` field | No conversations, messages, tickets, or settings tables |
| 2 | No real business logic implemented | Backend is essentially a stub |
| 3 | No background job processing | Convex actions not utilized for async work |
| 4 | No webhook handlers | No external event ingestion |
| 5 | No data aggregation or reporting queries | No analytics or metrics endpoints |

## Frontend

| # | Issue | Details |
|---|-------|---------|
| 1 | No error boundaries on dashboard or widget | Uncaught errors crash the entire app |
| 2 | No loading skeletons for most views | Poor loading state UX |
| 3 | No empty states for lists/tables | User sees blank pages with no guidance |
| 4 | No pagination or infinite scroll on conversation lists | `InfiniteScrollTrigger` exists but no data to paginate |
| 5 | `use-moblie.ts` filename typo | `apps/web/hooks/use-moblie.ts` |
| 6 | `ratio-group.tsx` filename typo | `packages/ui/src/components/ratio-group.tsx` |
| 7 | No i18n / internationalization | English-only, no locale framework |
| 8 | No keyboard shortcut documentation | Sidebar has `Ctrl+B` but no discoverability |

## Monitoring & Observability

| # | Issue | Details |
|---|-------|---------|
| 1 | Sentry setup is minimal — no custom error grouping, no release tracking | Basic crash reporting only |
| 2 | No performance monitoring beyond Sentry Session Replay | No web vitals tracking or APM |
| 3 | No structured logging | No log aggregation or search |
| 4 | No uptime monitoring for widget | Sentry monitors exist only for dashboard |
| 5 | No user-facing error messages | All errors are generic or silent |

## Missing Features (for a Customer Support Platform)

| # | Feature | Impact |
|---|---------|--------|
| 1 | Conversation/ticket creation and management | Core feature missing |
| 2 | Real-time messaging between agent and customer | Core feature missing |
| 3 | Customer identity management | Only user table exists |
| 4 | Knowledge base / FAQ system | No self-service support |
| 5 | Email integration (send/receive) | No external channel support |
| 6 | File/image attachment support | Dropzone component exists but no backend handling |
| 7 | Chat routing / assignment | No agent assignment logic |
| 8 | Canned responses / macros | Agent productivity feature missing |
| 9 | SLA tracking | No service level monitoring |
| 10 | Reporting dashboard | No metrics or analytics |
| 11 | Multi-channel support (email, SMS, social) | Widget-only single channel |
| 12 | Customer satisfaction surveys | No CSAT/NPS collection |
| 13 | Export/import data | No data portability |
