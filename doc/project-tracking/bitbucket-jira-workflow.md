# Bitbucket + Jira Tracking for AetherLive (read-only, no changes)

> Rule: TRACKING ONLY. Do NOT modify git remotes, branches, or pipelines.
> Reason: pipeline changes on your cloud site (`premladani33453.atlassian.net`) are risky.
> I only read Jira/Bitbucket status and update `progress-tracker.md` + CSV.

## 1. Link Jira ↔ Bitbucket (10 min, once)

1. Jira → Apps → Find `Bitbucket for Jira` / `Atlassian Companion` → Install.
   Or Bitbucket → Settings → Atlassian Integration → Connect Jira site (`*.atlassian.net`).
2. Confirm same Atlassian account on both. Jira project `AL` must show
   `Development` panel (branches/commits/PRs).
3. In Jira → Project settings → Features → enable `Sprints`, `Backlog`, `Development`.
4. Create 12 Sprints (S1..S12) with dates. Bulk-create tickets:
   Jira → Issues → Import from CSV → upload `doc/project-tracking/jira-import.csv`
   Map: Issue Type, Summary, Description, Epic Name → Epic Name, Sprint → Sprint, Priority, Story Points → Story Points, Labels, Component.
5. Epics AL-1,5,9,14,18,21,25,29,33,36,39,43 first, then tasks link to Epic.

## 2. Connect this repo (read-only — do NOT run)

> Do NOT run `git remote add`, `git push`, or change origin. Only observe:
> - `git remote -v` to note GitHub vs Bitbucket URLs
> - Jira ticket Development panel to note existing branch/PR/commit links

## 3. Daily tracking (every ticket = record, no git writes)

Branch naming (required for auto-link):
```
feature/AL-22-rag-agent
fix/AL-17-widget-conversation
fix/AL-27-customization-save
chore/AL-45-bitbucket-pipelines
```

Smart commits (Bitbucket reads Jira key + command):
```
AL-17 fix contactSessions org fallback

AL-22 add RAG streaming #comment tested <2s locally

AL-27 downgrade zodResolver mismatch #in-review

AL-42 remove Tracking Test throw #done
```
Commands: `#comment`, `#time 2h`, `#in-progress`, `#in-review`, `#done`.

PR title: `AL-17: fix widget conversation establish`
PR description must contain `AL-17` → Jira shows branch + PR + commits under ticket.
Merge via PR (squash), never push straight to `main`/`master`.

Jira transitions:
To Do → In Progress (on branch create) → In Review (on PR) → Done (on merge + build green).

## 4. Pipelines (do NOT touch — risky on cloud site)

> No `bitbucket-pipelines.yml` creation, no Pipeline enable/disable, no variable edits.
> Only track: note build ✅/❌ shown in Jira Development panel per ticket.

## 5. Progress record (per your ask: each record for it)

For every ticket update TWO places:
1. Jira ticket: status + comment `PR: <bitbucket-pr-url>` + `Build: ✅/❌` + time logged.
2. `doc/project-tracking/progress-tracker.md`: flip ⬜→🚧→✅, fill Branch/PR + Commit hash.

Weekly: Sprint Review → close sprint in Jira → Burndown → carry over AL-17, AL-27, AL-42, AL-45, AL-46 (current open items).

## 6. Checklist to track S11–S12 (observe only, no fixes/deploys by me)
- [ ] AL-17 note widget bug status from Jira: `contactSessions.create` → `conversations.create` → `messages.create` → agent.
- [ ] AL-27 note customization save status, note zod ^4 vs @hookform/resolvers ^5.
- [ ] AL-42 note `throw new Error("Tracking Test")` in `convex/users.ts` — track only, do NOT delete.
- [ ] AL-45 note Bitbucket + Jira link status — do NOT push pipelines or enable Pipelines.
- [ ] AL-46 note prod deploy status — track only, no deploy change.
