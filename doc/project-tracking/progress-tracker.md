# AetherLive — Progress Tracker (per-ticket Done record)

> One row per ticket. Your 12 sprints are Done — keep this as the build record.
> Update `Jira` + `Branch/PR` + `Commit` every time you finish work.
> Rule: no ticket is Done without branch + commit/PR linked.

Legend: ✅ Done | 🚧 In Progress | ⬜ To Do

## S1 — Setup & Monorepo ✅
| Ticket | Summary | Jira | Branch/PR | Commit/Record | Status |
|---|---|---|---|---|---|
| AL-1 | [Epic] Monorepo & tooling | Done | `main` | repo init turbo+pnpm | ✅ |
| AL-2 | pnpm + turbo + configs | Done | `main` | `package.json` `turbo.json` `pnpm-workspace.yaml` | ✅ |
| AL-3 | ESLint/Prettier/vitest | Done | `main` | `vitest.shared.ts` eslint-config | ✅ |
| AL-4 | pnpm dev web+widget | Done | `main` | `pnpm dev` 3003/3001 verified | ✅ |

## S2 — Auth & Multi-tenancy ✅
| Ticket | Summary | Jira | Branch/PR | Commit/Record | Status |
|---|---|---|---|---|---|
| AL-5 | [Epic] Auth & multi-tenancy | Done | `main` | Clerk + Convex JWT working | ✅ |
| AL-6 | Clerk proxy guards | Done | `main` | `apps/web/proxy.ts` | ✅ |
| AL-7 | AuthGuard + org-selection | Done | `main` | `modules/auth` | ✅ |
| AL-8 | getOrganizationId helper | Done | `main` | `convex/lib/auth.ts` fixed 2026-08-08 | ✅ |

## S3 — Backend Core ✅
| Ticket | Summary | Jira | Branch/PR | Commit/Record | Status |
|---|---|---|---|---|---|
| AL-9 | [Epic] Backend core | Done | `main` | schema + public API live | ✅ |
| AL-10 | Schema 10 tables | Done | `main` | `convex/schema.ts` | ✅ |
| AL-11 | contactSessions.create | Done | `main` | `convex/public/contactSessions.ts` | ✅ |
| AL-12 | conversations + status | Done | `main` | `convex/public/conversations.ts` | ✅ |
| AL-13 | messages + realtime | Done | `main` | `convex/public/messages.ts` | ✅ |

## S4 — Widget + Embed 🚧 (1 open bug)
| Ticket | Summary | Jira | Branch/PR | Commit/Record | Status |
|---|---|---|---|---|---|
| AL-14 | [Epic] Widget + Embed | Done | `main` | widget+embed scaffold | ✅ |
| AL-15 | Widget chat flow | Done | `feture(major-update-across-focusing-on-backend-stability,widget)` | 3777b4a refactor backend/widget flow | ✅ |
| AL-16 | Embed snippet | Done | `main` | `apps/embed` script tag | ✅ |
| AL-17 | Fix widget no-conversation | In Progress | `fix/AL-17-widget-conversation` | tracing contactSessions→conversations→messages→agent | 🚧 |

## S5 — Dashboard Inbox ✅
| AL-18 | [Epic] Inbox | Done | `main` | inbox scaffold | ✅ |
| AL-19 | Inbox views | Done | `main` | `modules/dashboard` | ✅ |
| AL-20 | Human reply + sentiment | Done | `main` | realtime push verified | ✅ |

## S6 — AI Agent + RAG + Files ✅
| AL-21 | [Epic] AI+RAG | Done | `main` | agent live | ✅ |
| AL-22 | Convex Agent RAG | Done | `main` | `convex/public/agent.ts` | ✅ |
| AL-23 | File upload→index | Done | `main` | `modules/files` `private/files.ts` | ✅ |
| AL-24 | Smart routing | Done | `main` | auto-categorize | ✅ |

## S7 — Customization + Settings 🚧
| AL-25 | [Epic] Customization | Done | `main` | | ✅ |
| AL-26 | Widget customization save | Done | `main` | `modules/customization` | ✅ |
| AL-27 | Fix save button error | In Progress | `fix/AL-27-customization-save` | suspect zod v3/v4 mismatch | 🚧 |
| AL-28 | Settings per-org | Done | `main` | `modules/settings` | ✅ |

## S8 — Integrations + Voice ✅
| AL-29 | [Epic] Integrations+voice | Done | `main` | | ✅ |
| AL-30 | Plugins CRUD | Done | `main` | `private/plugins.ts` orgId required | ✅ |
| AL-31 | Secrets org-scoped | Done | `main` | `private/secrets.ts` | ✅ |
| AL-32 | Vapi voice AWS Secrets | Done | `main` | `private/vapi.ts` 5-min cache | ✅ |

## S9 — Billing + Gating ✅
| AL-33 | [Epic] Billing | Done | `main` | | ✅ |
| AL-34 | Clerk Billing webhook | Done | `main` | `modules/billing` `private/subscriptions.ts` | ✅ |
| AL-35 | requireFeature gating | Done | `main` | `lib/subscription.ts` | ✅ |

## S10 — Landing ✅
| AL-36 | [Epic] Landing | Done | `main` | | ✅ |
| AL-37 | Hero+features+demo | Done | `main` | `components/landing` | ✅ |
| AL-38 | Pricing+FAQ | Done | `main` | pricing $20 Pro | ✅ |

## S11 — Testing + Security 🚧
| AL-39 | [Epic] Testing+security | In Progress | `18-testing-and-skills` | merged PR #12 | 🚧 |
| AL-40 | Backend vitest | Done | `18-testing-and-skills` | `*.test.ts` 41a71a3 skills+testing | ✅ |
| AL-41 | Rate-limit + CSRF | Done | `main` | `lib/rateLimit.ts` `csrf.ts` | ✅ |
| AL-42 | Sentry + remove throw | To Do | — | `users.ts` Tracking Test still present — remove before go-live | ⬜ |

## S12 — CI/CD + Production 🚧 (tracking only, no pipeline/git changes)
| AL-43 | [Epic] CI/CD+prod | In Progress | `main` | track only, no changes | 🚧 |
| AL-44 | GitHub pipeline | Done | `main` | `.github/workflows/pipeline.yml` (read-only) | ✅ |
| AL-45 | Track Bitbucket + Jira links | To Do | — | read-only, do NOT create/modify pipelines — risk on cloud site | ⬜ |
| AL-46 | Prod deploy | To Do | — | track only — see prod doc, no deploy change | ⬜ |

## How to record progress (tracking only — no git/pipeline changes)
1. Jira: move AL-xx To Do → In Progress → In Review → Done. Log time + comment with existing PR link (read-only).
2. Record: in this file flip ⬜→🚧→✅, fill Jira status + existing Branch/PR + Commit hash (observe only, do NOT create branches/commits/merges).
3. Pipelines: do NOT touch. Only note build ✅/❌ from Jira Development panel.
