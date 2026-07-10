# markdsouza.dev Portfolio

Mark D'Souza's engineering portfolio and blog — the front door for his SDE job search. Engineering brand only; his photography business is a separate brand and never appears here.

## Language

**Project**:
A piece of Mark's engineering work presented on the site. Every Project has a public repo; it may be in progress or shipped, and may or may not have a Demo.
_Avoid_: app, work, piece

**Case study**:
The written page for a Project at `/projects/<slug>` — problem, stack, screenshots, links. The Case study lives on the main site; it is the canonical presentation of a Project.
_Avoid_: project page, write-up

**Demo**:
A running deployment of a Project on its own `<app>.markdsouza.dev` subdomain, linked from its Case study. Optional — not every Project has one.
_Avoid_: live site, deployment

**Post**:
A blog entry at `/blog/<slug>`, authored as markdown (drafted in Obsidian, converted to standard markdown on the way in).
_Avoid_: article, entry

**Status** (of a Project):
Either `in-progress` or `shipped`. In-progress Projects can have published Case studies, badged honestly.

**Featured** (Project):
A Project surfaced as a card directly on the landing page. Featured Projects rank above all others in the projects index.

**Priority** (of a Project):
An explicit rank among Projects (higher ranks first, default 0), applied after Featured and before date when ordering.

**Cover** (of a Post or Case study):
The single image representing the piece on index cards, the landing page, and social-share previews. Optional; distinct from images embedded in the body.

**Tag**:
A lowercase-kebab topic label shared by Posts and Projects. Every tag on a Post has a listing page under `/blog/tags/`.
