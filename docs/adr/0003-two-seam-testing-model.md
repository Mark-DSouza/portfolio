# Two-seam testing model: unit + e2e, build-and-inspect retired

The repo launched with a build-and-inspect seam (`tests/build/`): spawn the real production build over fixture content, read files out of `dist`, assert. Its irreplaceable value was environment-variant builds and artifact-absence properties — proving Drafts appeared on preview builds and *nowhere* in production output. ADR-0001 deleted the Draft concept and with it every environment-dependent build behavior, which gutted that value: what remained either described visitor-observable behavior (better asserted in a real browser over the production serving semantics of ADR-0002) or small artifact/build-time properties that fit inside the Playwright suite as filesystem assertions (the zero-emitted-JS glob) and build-failure assertions (the schema guards). We deleted `tests/build/` rather than keep a three-test rump seam, so every invariant has exactly one owning test.

## Consequences

- `bun run test` = unit comparator tests + the Playwright suite; there is no `test:build`.
- The fixture-build harness lives at `tests/e2e/harness.ts`, uses Node APIs only (it runs under bun in `serve.ts` and under Playwright's Node runtime in specs), and remains the single owner of the build dir protocol.
- Presence-flavored assertions live as journeys/crawl; feeds and the resume are asserted over HTTP where their consumers meet them; nothing inspects `dist` directly except the zero-emitted-JS check, which no browser could see.
