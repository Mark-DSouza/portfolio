# Git is the draft: Posts have no draft flag

The site once excluded `draft: true` Posts from production builds while rendering them in dev and on non-`main` Cloudflare branches (`CF_PAGES_BRANCH`). For a single contributor publishing through GitHub this made builds environment-dependent — what a preview showed was not what production shipped — and the branch inference was likely dead anyway: the launch deploy runs on Cloudflare Workers static hosting, which never sets `CF_PAGES_BRANCH` (evidence recorded in the amendment comment on issue #6; issue #8 pins the platform down). We deleted the concept instead of re-plumbing it: an unmerged branch **is** the draft, merging to `main` **is** publishing, and every build of every commit is identical regardless of environment.

## Consequences

- Work-in-progress Posts cannot sit in `main` unpublished; they live on branches. Previewing a draft is local (`bun run dev`, or `bun run build` + `wrangler dev` for the deploy-faithful version) — non-production branch builds are disabled in the Cloudflare dashboard, so there are no hosted branch previews. Re-enabling them (plus Preview URLs) restores hosted previews without any repo change.
- A stray `draft:` key fails the build with a message pointing here, so a Post the author believed hidden can never silently publish. Frontmatter schemas are `.strict()` generally: any unrecognized key fails the build rather than silently vanishing.
- The build-test harness no longer forces or strips deploy-environment variables; the preview-variant test suite is gone.

## Considered options

An explicit `SHOW_DRAFTS` build toggle (keep the flag, drop the branch inference) was rejected: it renames the environment drift rather than eliminating it.
