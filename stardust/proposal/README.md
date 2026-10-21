# Uplift proposal design files (not adopted)

Each folder holds the target-state files one stardust uplift wrote at the
project root: shared `PRODUCT.md` / `DESIGN.md` / `DESIGN.json` (variant A
baseline), the per-variant `DESIGN-{A,B,C}.{md,json}`, and the uplift's
`direction.md`, `uplift-improvements.md` and `uplift-questions.md`.

- `index/`: homepage uplift (2026-10-07)
- `roster/`: 10U roster uplift (2026-10-16)

They live here rather than at the root because, at the root, the impeccable
design hook treats an unadopted proposal as the site's design system and
flags the live production blocks against it.

To pick a variant up again: copy the chosen `<page>/DESIGN-<id>.md/.json` back
to the project root as `DESIGN.md` / `DESIGN.json` (and `PRODUCT.md` with
them), then run `/impeccable document` to write the sidecar. The prototypes
they describe are in `../prototypes/` (`<page>-<id>-proposed.html`, plus
`<page>-C-cinematic.html`).
