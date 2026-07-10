# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mark D'Souza's engineering portfolio + blog at `markdsouza.dev`. Astro 7 (static output), Tailwind 4, Bun. The v1 spec is GitHub issue #1; the domain glossary is `CONTEXT.md` (Project, Case study, Demo, Post, Featured, Priority, Cover, Tag are canonical terms). Original stack rationale: `docs/handoffs/markdsouza-portfolio-handoff.md` — where it and issue #1 differ, the issue wins.

## Commands

```bash
bun install          # deps
bun run dev          # dev server (drafts visible)
bun run build        # production build → dist/
bun run typecheck    # astro check
bun run test         # unit + build tests
bun run test:unit    # comparator unit tests only
bun run test:build   # build-and-inspect tests only (builds fixtures → dist-test/)
```

## Structure

```
src/content.config.ts     zod schemas for blog + projects collections
src/content/{blog,projects}/   real content (markdown, co-located images)
src/lib/ordering.ts       Featured → Priority desc → date desc comparator (unit-tested)
src/lib/content.ts        published/draft filtering, tag derivation, project ordering
src/pages/                landing, blog (+tags), projects, rss.xml, 404
src/layouts/Layout.astro  head/meta/theme script, header, footer
tests/unit/               comparator tests
tests/build/              build-and-inspect over built output
tests/fixtures/content/   mock content the build tests run against
```

## Testing model (do not change without discussion)

Two seams, pre-agreed: (1) **build-and-inspect** — tests spawn the real `astro build` against `tests/fixtures/content` via env vars `CONTENT_DIR` / `OUT_DIR` (`dist-test/`) / `CACHE_DIR` (`.astro-test/`), then assert hardcoded expectations from the fixture literals; (2) **unit tests** for the ordering comparator. **Tests always use mock fixture data, never real content.** The `CACHE_DIR` split is load-bearing: Astro's content-layer store persists across builds and will leak fixture pages into real output if shared. Test spawns must set `NODE_ENV=production` (`bun test` sets `NODE_ENV=test`, which flips builds into dev-like draft inclusion).

## Behavior invariants (enforced by tests)

- Drafts (`draft: true`) render in dev and on non-`main` Cloudflare Pages branches (`CF_PAGES_BRANCH`), never in production output.
- Projects order: featured first, then priority (higher first, default 0), then date desc. Featured projects render as landing-page cards.
- Every tag on a published post gets `/blog/tags/<tag>`; tags are zod-enforced lowercase-kebab.
- `/rss.xml` carries published posts only. Sitemap + robots.txt ship.
- **Zero emitted JS files.** The only JavaScript is the inline theme script (dark default on first visit, toggle persisted to localStorage). No React in v1 — adding an island is a spec change, not a convenience.

## Design

Restrained synthwave: deep-night base, neon magenta/cyan accents (CSS vars in `src/styles/global.css`, flipped by `data-theme` on `<html>`), Space Grotesk display, mono for metadata, one horizon-gradient moment on the landing hero. Do not tip into Synthwave-'84 kitsch; do not ship anything that reads as a template.

## Content rules

- **Real content only — never invent case studies, posts, or claims.** Landing copy and the `the-life-ledger` case study are drafts pending Mark's approval.
- Launch gate (wiring the custom domain): Mark's resume PDF at `public/resume.pdf`, approved case study, and Mark's first blog post.
- Mark drafts in Obsidian: convert `[[wikilinks]]` and callouts to standard markdown on the way in.
- Scope boundary: engineering brand only — Flashback Photography (Mark's photography business) never appears here.

## Deploy (Cloudflare Pages)

Build command `bun run build`, output `dist`, pin `BUN_VERSION` env var. Custom domain: apex + `www` redirect, wired natively (zone is in the same Cloudflare account). Preview deploys show drafts; production (`main`) excludes them.

## Deferred (see handoff §6 / issue #1 out-of-scope)

Email routing, analytics, comments, contact form, defensive `.com`, demo subdomains.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `Mark-DSouza/portfolio` (via the `gh` CLI); external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
