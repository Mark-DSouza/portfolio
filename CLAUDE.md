# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Greenfield — no code has been written yet.** This repo will hold Mark D'Souza's engineering portfolio + blog at `markdsouza.dev`. All architecture, stack, and hosting decisions are locked in `handoffs/markdsouza-portfolio-handoff.md` — read it before scaffolding or making structural decisions. The build plan (ordered steps) is in §4 of that document.

Once the Astro project is scaffolded, update this file with the actual commands and structure.

## Locked stack decisions (do not relitigate)

- **Framework:** Astro, static output (`output: 'static'`, builds to `dist/`). No Cloudflare adapter.
- **Styling:** Tailwind.
- **Package manager:** Bun (`bun install`, `bun run dev`, `bun run build`). Commit the Bun lockfile.
- **Content:** local markdown in-repo via Astro content collections with typed zod frontmatter schemas (title, date, tags, description). MDX enabled, but posts are plain markdown ~95% of the time.
- **Interactivity:** React islands only where genuinely needed (contact form, project filter). Everything else stays static Astro — keep shipped JS near zero.
- **Hosting:** Cloudflare Pages (domain + DNS already live in Cloudflare). Build command `bun run build`, output dir `dist`, pin `BUN_VERSION` env var in Pages settings.

## Site architecture

```
markdsouza.dev              → landing (headline, intro, links to projects/blog/resume/GitHub/contact)
markdsouza.dev/projects     → project index → /projects/<slug> case studies
markdsouza.dev/blog         → blog index   → /blog/<slug> posts
<app>.markdsouza.dev        → live demos, each its own Pages project
```

- Blog is a **subdirectory, not a subdomain** (pools SEO authority) — deliberate.
- Projects pattern: the case study (problem, stack, screenshots, GitHub link) lives on the main site; the running demo lives on its own subdomain, linked from the case study.
- Include RSS feed (`@astrojs/rss`) and sitemap (`@astrojs/sitemap`).

## Key constraints

- **Do not ship a recognizable template.** Start from a minimal Astro starter for plumbing, then make the design distinctly Mark's — this is the single most important design constraint. Invoke the `frontend-design` skill for the design pass.
- **Scope boundary:** engineering brand only. Mark's photography business (Flashback Photography) stays on a separate domain — never fold it in.
- **Obsidian caveat:** Mark drafts posts in Obsidian. `[[wikilinks]]` and Obsidian callouts are not standard markdown — convert to normal links / MDX on the way into the repo.
- **Verify Astro specifics against current docs** — content-collections config location and the Tailwind integration have shifted across Astro versions.
- Real content (case studies, blog posts, demo URLs) comes from Mark — don't invent it. One candidate project to feature: a TanStack Start frontend migrating to a Java/Spring Boot backend.

## Deferred (explicitly out of scope)

Email routing, analytics, blog comments, defensive `.com` registration — see handoff §6 before adding any of these.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `Mark-DSouza/portfolio` (via the `gh` CLI); external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
