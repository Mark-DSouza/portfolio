# Assets-only Worker: no SSR adapter

The site deploys as Cloudflare Workers **static assets only** — `wrangler.jsonc` has no `main`, so no Worker script runs in front of the HTML. Cloudflare's autoconfig bot proposed the `@astrojs/cloudflare` SSR adapter (branch `cloudflare/workers-autoconfig`); we rejected it because the site is deliberately fully static (zero emitted JS, static output) and an SSR runtime layer would add a dependency, cold-start surface, and different routing semantics for nothing the site needs. If a future feature genuinely needs request-time compute, revisit this ADR rather than merging an autoconfig.

Serving semantics live explicitly in `wrangler.jsonc`: `html_handling: "auto-trailing-slash"` (matches pre-config production behavior) and `not_found_handling: "404-page"` (a deliberate fix — the pre-config default served empty 404 bodies, so the built `404.html` never reached visitors).
