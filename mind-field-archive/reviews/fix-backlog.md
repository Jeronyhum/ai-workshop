# Fix backlog from the reviews (NOT applied yet; t1177u)

Sources: muse c388237a (SHIP WITH FIXES) and dots c832c3af (source-only review; no browser render).

## Muse (priority order)
1. Mobile: the topbar collides with the zone title, and the M and ? buttons are 0 px wide at 390 px. Fix in index.html .topbar and css/archive.css.
2. Docent HUD: the .hud-next neighbour list clips by about 30 px (scrollH 263 vs clientH 233).
3. First load is 6.25 MB in 79 requests. Subset Archivo-Variable.ttf (652 KB) and JetBrainsMono (189 KB) to woff2, and lazy-load off-zone floor images (muse2-context-aperture 663 KB).
4. DCinside: link both posts from the kostat and bok pieces, and either add the IMF-era comparison to kostat or stop implying it (CREDITS.md:18).
5. Cold start: the HUD is empty on load. Pre-focus a hero piece or show a start hint. Also refresh the README asset-deviation table after the regen and anchors.py.
- Minor: the first Tab should land on a piece, not the topbar. Thread labels crowd the focused frame under docent light. Vendor a UI-library components manifest into materials/.

## Dots
1. js/gallery.js:156-167: closing with Esc (native dialog close) doesn't pause video or remove the iframe. Move cleanup into the close event.
2. DCinside 1509631 and 1499916 aren't linked anywhere at runtime (js/data.js, render.js:255-289). Add sources with units, period and conditions.
3. tools/check.py:174 needs refs/x-frontier-cases/cases.json, so a clean checkout exits 1. Ship a public evidence manifest or mark the check NOT_RUN.
4. The manual motion-reduce toggle (app.js:443) is ignored by gallery.js:190, which only reads matchMedia.
5. In a modal, the app.js:450-457 branch returns before KeyM at :469, so motion can't be toggled while a piece is open.

## Assets received (verified sha256, not integrated)
- dots v3 (D1/D3): /workspace/dl/dots-v3.zip, sha 9d69bacf…5de68 ✓. Dots self-reports it is still off-spec.
- dots v2 revisions: /workspace/dl/revisions.zip, sha b9484163…5dcaf ✓
- muse regen: /workspace/dl/regen/muse2-context-aperture.jpg (33b13e1d…a7924 ✓) and muse2-field-manifold.jpg (699ebece…a9cd3 ✓)
