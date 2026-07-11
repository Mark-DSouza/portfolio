# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mark D'Souza's engineering portfolio + blog at `markdsouza.dev`. Astro 7 (static output), Tailwind 4, Bun. The v1 spec is GitHub issue #1; the domain glossary is `CONTEXT.md` (Project, Case study, Demo, Post, Featured, Priority, Cover, Tag are canonical terms). Original stack rationale: `docs/handoffs/markdsouza-portfolio-handoff.md` — where it and issue #1 differ, the issue wins.

## Commands

```bash
bun install          # deps
bun run dev          # dev server
bun run build        # production build → dist/
bun run typecheck    # astro check
bun run test         # unit + build tests
bun run test:unit    # comparator unit tests only
bun run test:build   # build-and-inspect tests only (builds fixtures → dist-test/)
bun run test:e2e     # Playwright journeys against the wrangler-served fixture site
```

## Structure

```
src/content.config.ts     zod schemas for blog + projects collections
src/content/{blog,projects}/   real content (markdown, co-located images)
src/lib/ordering.ts       Featured → Priority desc → date desc comparator (unit-tested)
src/lib/content.ts        post sorting, tag derivation, project ordering
src/pages/                landing, blog (+tags), projects, rss.xml, 404
src/layouts/Layout.astro  head/meta/theme script, header, footer
tests/unit/               comparator tests
tests/build/              build-and-inspect over built output
tests/fixtures/content/   mock content the build tests run against
```

## Testing model (do not change without discussion)

Two seams, pre-agreed: (1) **build-and-inspect** — tests build fixture content through `buildFixtureSite(variant)` in `tests/build/harness.ts`, then assert hardcoded expectations from the fixture literals; (2) **unit tests** for the ordering comparator. **Tests always use mock fixture data, never real content.** The harness is the single owner of the build dir protocol (`CONTENT_DIR`, per-variant `OUT_DIR`/`CACHE_DIR` split, pre-build output wipe) — never spawn `astro build` in a test directly; its why-comments explain the footguns.

**In transition (issue #6, tickets #9–#12):** a third seam — **e2e** (`tests/e2e/`, Playwright over HTTP against the fixture site served with the production `wrangler.jsonc` semantics) — is absorbing build-and-inspect. Ticket #12 deletes `tests/build/` and rewrites this section for the final two-seam world (unit + e2e); until then, new site-behavior coverage goes in e2e, not build tests. CI (`.github/workflows/e2e.yml`) gates every PR and push to main.

## Behavior invariants (enforced by tests)

- Publishing is merging to `main` (ADR-0001): builds are environment-independent, and a WIP post lives on an unmerged branch (its preview deploy shows it because the file is there). A stray `draft:` frontmatter key — or any unrecognized key, schemas are strict — fails the build.
- Projects order: featured first, then priority (higher first, default 0), then date desc. Featured projects render as landing-page cards.
- Every tag on a published post gets `/blog/tags/<tag>`; tags are zod-enforced lowercase-kebab.
- `/rss.xml` carries every post. Sitemap + robots.txt ship.
- **Zero emitted JS files.** The only JavaScript is the inline theme script (dark default on first visit, toggle persisted to localStorage). No React in v1 — adding an island is a spec change, not a convenience.

## Design

Restrained synthwave: deep-night base, neon magenta/cyan accents (CSS vars in `src/styles/global.css`, flipped by `data-theme` on `<html>`), Space Grotesk display, mono for metadata, one horizon-gradient moment on the landing hero. Do not tip into Synthwave-'84 kitsch; do not ship anything that reads as a template.

## Content rules

- **Real content only — never invent case studies, posts, or claims.** Landing copy and the `the-life-ledger` case study were approved by Mark on 2026-07-10.
- Launch gate (wiring the custom domain): Mark's first blog post. (Resume PDF and case-study approval are done.)
- Mark drafts in Obsidian: convert `[[wikilinks]]` and callouts to standard markdown on the way in.
- Scope boundary: engineering brand only — Flashback Photography (Mark's photography business) never appears here.

## Deploy (Cloudflare Workers)

Workers Builds, Git-connected: build `bun run build`, deploy `npx wrangler deploy` (production branch `main`), `npx wrangler versions upload` for non-production branches; `BUN_VERSION` pinned as a dashboard variable. `wrangler.jsonc` is **assets-only — no Worker script** (ADR-0002; Cloudflare's autoconfig bot proposed the `@astrojs/cloudflare` SSR adapter and was deliberately rejected), and its `name` must stay `portfolio`, the live worker. Serving semantics are explicit there: auto trailing slashes, styled 404 via `not_found_handling`. Custom domain: `markdsouza.dev` apex (zone in the same account); the workers.dev route is deliberately disabled (SEO). Publishing is merging to `main` (ADR-0001).

## Deferred (see handoff §6 / issue #1 out-of-scope)

Email routing, analytics, comments, contact form, defensive `.com`, demo subdomains.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `Mark-DSouza/portfolio` (via the `gh` CLI); external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
