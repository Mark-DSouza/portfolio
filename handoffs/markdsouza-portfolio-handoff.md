# Handoff — `markdsouza.dev` Portfolio Site Build

**For:** Claude Code (fresh session, greenfield implementation)
**Generated:** 2026-07-10, via the `handoff` skill
**Prior session type:** Planning / decision-making ("grill") — no code was written. All architecture, stack, and hosting decisions are locked below. Your job is to build and deploy from this spec.

---

## 1. Objective

Build and deploy a personal **engineering portfolio + projects + blog** for Mark (Mark Philip D'Souza), an experienced full-stack SDE, at **`markdsouza.dev`**.

- **Purpose:** front door for an SDE 2 job search. It must load fast, read as "backend/full-stack engineer" within seconds, and quietly signal engineering taste.
- **Nature:** fundamentally a **content site** — mostly static pages + markdown blog posts, with only occasional interactivity. This shaped every decision below (lean, static-first, near-zero JS).
- **Scope boundary:** this is Mark's *engineering* brand only. His photography business (Flashback Photography) is intentionally kept on a separate brand/domain — do **not** fold it in.

---

## 2. Current status

- ✅ **Domain registered:** `markdsouza.dev` at Cloudflare Registrar (at-cost pricing, free WHOIS privacy, auto-renew on). DNS is managed in Cloudflare.
- ❌ **No code, no GitHub repo, no site yet.** Start from scratch.
- ❌ **Content not written.** Blog posts and project case studies are to be supplied by Mark (see §4, step 6).

---

## 3. Locked decisions (the spec)

### Identity & domain
- Real name, engineering-only front door. Domain: `markdsouza.dev` (D'Souza → `dsouza`; apostrophe dropped, standard).
- `.dev` chosen deliberately (developer signal, HSTS-preloaded so HTTPS is enforced). `.com` was first choice but the exact-name `.dev` was taken as the clean option.

### Site architecture
```
markdsouza.dev              → landing / portfolio (headline, who you are, links out)
markdsouza.dev/projects     → project index → /projects/<slug> case studies
markdsouza.dev/blog         → blog index   → /blog/<slug> posts
<app>.markdsouza.dev        → live project deployments (separate Pages projects)
```
- **Blog is a subdirectory (`/blog`), not a subdomain** — deliberate, to pool SEO authority into the one domain.
- **Projects pattern:** the *case study* (problem, stack, screenshots, GitHub link) lives on the main site at `/projects/<slug>`; the *running demo* lives on its own `app.markdsouza.dev`-style subdomain, linked from the case study. This isolates each demo's stack/build from the portfolio.

### Tech stack
- **Framework:** **Astro** (content-first, ships ~zero JS by default, first-class content collections).
- **Styling:** **Tailwind** (Mark knows it; Astro has first-class support).
- **Content:** **local markdown files in the repo**, via Astro **content collections** with a **typed (zod) frontmatter schema** (title, date, tags, description — validated at build time). **Enable MDX** so components *can* be embedded in a post when warranted, but posts are plain markdown ~95% of the time.
- **Package manager:** **Bun** (treated as a low-risk greenfield playground; build output is identical either way).
- **Interactivity:** **React islands, used sparingly** — only where genuine interactivity earns it (e.g. a contact form, a project filter). Everything else stays static Astro to keep JS near-zero.

### Design approach
- **Start from a minimal official Astro starter** (e.g. the blog template) to get the plumbing for free — content collections, **RSS, sitemap, SEO meta**, routing.
- **Then make the design distinctly Mark's.** Do **not** ship a recognizable template — for a portfolio, an obvious off-the-shelf theme is a mild negative (reads as "used a template," not "has design judgment"). Invest in a distinctive-enough visual identity: intentional type, spacing, color, a memorable landing. It doesn't need to win design awards; it needs to not look like everyone else's.

### Hosting & deploy
- **Cloudflare Pages** (free tier: unlimited bandwidth on static assets, commercial use allowed, git auto-deploy, preview deployments, free SSL, 100 custom domains, 500 builds/month).
- **Why Pages over Vercel:** no surprise-bill risk (Vercel auto-bills overages; Cloudflare doesn't meter static bandwidth), and — critically — the domain + DNS already live in Cloudflare, so adding the custom domain is **native** (no cross-provider A-record / proxy-toggle dance).
- **Output:** static (`output: 'static'`, build to `dist/`). No Cloudflare adapter needed for a static site.

### Email
- **Deferred.** When wanted, `mark@markdsouza.dev` via **Cloudflare Email Routing** (free, inbound forwarding to Gmail) is the plan. Not part of this build.

---

## 4. Build plan (ordered next steps)

1. **Scaffold** an Astro project with Bun (`bun create astro@latest`), selecting a minimal blog starter. Init a git repo.
2. **Add integrations:** Tailwind, MDX, `@astrojs/sitemap`, and `@astrojs/rss`. *(Confirm exact commands/config against current Astro docs — the API has evolved; e.g. content-collection config file location and the Tailwind v4 integration differ across Astro versions.)*
3. **Define content collections** for `blog` (and optionally `projects`) with a typed zod schema for frontmatter. Wire the RSS feed and sitemap.
4. **Build the routes:**
   - Landing (`/`) — headline, short intro, links to projects/blog/resume/GitHub/contact.
   - `/projects` index + a `/projects/[slug]` case-study template.
   - `/blog` index + a `/blog/[slug]` post template.
   - Resume (route or linked PDF) + contact.
5. **Design pass** — build the distinctive visual identity (see §3 Design; invoke the `frontend-design` skill). Keep interactivity to React islands only where needed.
6. **Get real content from Mark** — actual project case studies + demo URLs, and initial blog posts. *(He has an in-progress project — a TanStack Start frontend migrating to a Java/Spring Boot backend — as one candidate to feature; confirm the full list with him.)*
7. **Repo → GitHub**, then create a **Cloudflare Pages** project connected to the repo (build settings in §5).
8. **Custom domain:** add `markdsouza.dev` in the Pages project (DNS auto-wires since the zone is in the same Cloudflare account); add `www` and redirect it to the apex. SSL auto-provisions.
9. **Per-demo subdomains:** stand up each live demo as its own Pages project on an `app.markdsouza.dev`-style subdomain, linked from its case study.

---

## 5. Cloudflare Pages config specifics

- **Framework preset:** Astro. **Build command:** `bun run build` (→ `astro build`). **Output directory:** `dist`.
- **Bun on Pages:** the build image defaults to node/npm. Set the build command to use Bun and **pin the Bun version via a `BUN_VERSION` environment variable** in the Pages project settings so installs are reproducible. Commit the Bun lockfile.
- **Custom domain:** native DNS wiring (no proxy/grey-cloud toggling needed — that concern only applied to the earlier, discarded Vercel plan).

---

## 6. Deferred / optional (explicitly NOT in this build)

- **Email routing** — set up later if/when Mark wants `mark@markdsouza.dev`.
- **Defensive `.com` registration** — considered and skipped (the exact-name `.com` is likely already taken; low value).
- **Analytics** — optional later: Vercel Web Analytics (free-tier, one line) or Plausible. Launch without.
- **Blog comments** — optional later: Giscus (GitHub Discussions-backed, no DB). Launch without.

---

## 7. Gotchas & notes

- **Don't ship a recognizable template** — the single most important design constraint for a portfolio (see §3).
- **Keep JS minimal** — static Astro by default; React islands only where interactivity is genuinely needed.
- **Obsidian authoring caveat:** Mark drafts in Obsidian. Plain markdown transfers 1:1, but Obsidian-specific syntax (`[[wikilinks]]`, its callout blocks) is **not** standard markdown — use normal links / MDX components, or convert on the way into the repo.
- **Verify Astro specifics against current docs** — this handoff was written against knowledge with a Jan 2026 cutoff; content-collections config, the Tailwind integration, and adapter/output details may have shifted. You have live doc access; use it.

---

## 8. Author context (for calibration only)

- Experienced full-stack SDE — strong in **Java/Spring Boot** and **React/TypeScript**; fluent in JSX, so the Astro learning curve is minimal.
- Writes/notes in **Obsidian**; comfortable self-managing cloud infra.
- **Time-constrained** (active job search + other commitments) — bias toward shipping a clean, working site over gold-plating.
- Prefers **direct, committed recommendations** with explicit reasoning over hedged option-lists. When a call is genuinely a toss-up, say so and make one.

*(No credentials, API keys, or sensitive personal data were exchanged in the prior session; nothing to redact.)*

---

## 9. Suggested skills

- **`frontend-design`** — invoke this when building the UI / visual identity (§4 step 5). It's directly on-point: distinctive, intentional design, typography, and avoiding templated defaults — which is the core design requirement here.
- Document-generation skills (`docx`, `pptx`, `xlsx`, `pdf`) are **not** relevant to this build.
