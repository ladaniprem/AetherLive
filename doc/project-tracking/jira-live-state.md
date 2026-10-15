# Jira Live State — premladani33453.atlassian.net (project SCRUM, tracking only)

> Read-only record. No git / pipeline changes made.
> Verified 2026-09-22 via REST API. Token used for verification — revoke after.

Project: SCRUM — My Software Team (team-managed, simplified)
Board: 1 — SCRUM board
Site: https://premladani33453.atlassian.net

## Sprints — 12 total ✅
| Jira ID | Name | State | Goal (AetherLive mapping) |
|---|---|---|---|
| 2 | SCRUM Sprint 0 | active | (existing, map to S1 Setup) |
| 1 | SCRUM Sprint 1 | future | (existing, map to S2 Auth) |
| 35 | SCRUM Sprint 2 | future | Setup and Monorepo |
| 36 | SCRUM Sprint 3 | future | Auth and Multi-tenancy |
| 37 | SCRUM Sprint 4 | future | Backend Core |
| 38 | SCRUM Sprint 5 | future | Widget plus Embed |
| 39 | SCRUM Sprint 6 | future | Dashboard Inbox |
| 40 | SCRUM Sprint 7 | future | AI Agent RAG Files |
| 41 | SCRUM Sprint 8 | future | Customization Settings |
| 42 | SCRUM Sprint 9 | future | Integrations Voice |
| 43 | SCRUM Sprint 10 | future | Billing Gating |
| 44 | SCRUM Sprint 11 | future | Landing Growth |

Created this session: IDs 35-44 (10 sprints) via POST /rest/agile/1.0/sprint with originBoardId=1.
Failed first with boardId (400) — fixed with originBoardId.

## Issues — 24 total, SCRUM-5..SCRUM-28, all Done ✅ (verified 2026-09-22)
> SCRUM-1..4 (empty Task 1/2/3/Subtask) DELETED per your instruction. Project now starts from SCRUM-5, perfect order S1..S12, 2 tickets per sprint.
| Key | Summary | Status | Type | Sprint |
|---|---|---|---|---|
| SCRUM-5 | S1 Setup monorepo pnpm turbo | Done | Task | 2 (Sprint 0) |
| SCRUM-6 | S1 dev runs web 3003 widget 3001 | Done | Story | 2 |
| SCRUM-7 | S2 Clerk proxy guards sign-in org-selection | Done | Task | 1 (Sprint 1) |
| SCRUM-8 | S2 getOrganizationId helper everywhere | Done | Story | 1 |
| SCRUM-9 | S3 schema 10 tables indexes | Done | Task | 35 (Sprint 2) |
| SCRUM-10 | S3 sessions conversations messages realtime | Done | Story | 35 |
| SCRUM-11 | S4 widget chat flow session convo message AI | Done | Task | 36 (Sprint 3) |
| SCRUM-12 | S4 embed snippet script tag | Done | Story | 36 |
| SCRUM-13 | S5 inbox views unresolved resolved escalated | Done | Task | 37 (Sprint 4) |
| SCRUM-14 | S5 human reply realtime push sentiment | Done | Story | 37 |
| SCRUM-15 | S6 Convex Agent RAG over KB | Done | Task | 38 (Sprint 5) |
| SCRUM-16 | S6 files upload index smart routing | Done | Story | 38 |
| SCRUM-17 | S7 widget customization save colors greeting | Done | Task | 39 (Sprint 6) |
| SCRUM-18 | S7 settings per-org plus save bug track | Done | Story | 39 |
| SCRUM-19 | S8 plugins CRUD secrets org-scoped | Done | Task | 40 (Sprint 7) |
| SCRUM-20 | S8 Vapi voice AWS Secrets Manager | Done | Story | 40 |
| SCRUM-21 | S9 Clerk Billing PricingTable webhook | Done | Task | 41 (Sprint 8) |
| SCRUM-22 | S9 requireFeature gating premium | Done | Story | 41 |
| SCRUM-23 | S10 hero features live-demo | Done | Task | 42 (Sprint 9) |
| SCRUM-24 | S10 pricing testimonials FAQ footer | Done | Story | 42 |
| SCRUM-25 | S11 backend vitest suites | Done | Task | 43 (Sprint 10) |
| SCRUM-26 | S11 rateLimit CSRF Sentry remove throw track | Done | Story | 43 |
| SCRUM-27 | S12 track prod no deploy changes | Done | Task | 44 (Sprint 11) |
| SCRUM-28 | S12 track links read-only | Done | Story | 44 |

All 24 new tickets: assigned to Ladani Prem, added to sprint via POST /sprint/{id}/issue, transitioned via id 41 Done.
All 4 old tickets: transitioned to Done per your instruction (all features done).
Each sprint has 2 tickets (1 Task + 1 Story), 12 sprints covered.

Next (tracking only, when you approve):
- Create Epics AL mapping in SCRUM (Epic type id 10001) or keep SCRUM-1..4 and add AetherLive tickets S1-S12.
- Move issues to sprints via POST /rest/agile/1.0/sprint/{id}/issue.
- Update `progress-tracker.md` per ticket from Jira status (read-only).

## Safety
- No git remote/branch/commit changed. `git status` still only shows `doc/project-tracking/` untracked.
- No `bitbucket-pipelines.yml` created. No Pipeline enabled/touched.
- Revoke API token: Atlassian Account > Security > API tokens > Revoke `opencode`.
