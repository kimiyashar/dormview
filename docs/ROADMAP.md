# ROADMAP.md - vision and phases

## Vision

Any college student, at any school, living in any dorm, opens DormView, selects their
university, their building, and their room style (for example "Traditional Double"), and
the exact to-scale layout of that room loads. They arrange furniture, try colors, resize
and stack items, upload their own posters/art, and save or share the plan so they know
what to buy before move-in. Layouts are shareable, so one student can build a room and
everyone else in that same room type reuses it.

## Competitive context (already researched)

- Closest existing product is **Roomie** (roomie.com), which builds to-scale 3D dorm models
  with drag-and-drop furniture and a shopping marketplace. But it is sold to universities on
  an annual contract and every room is built by sending a crew to physically scan each floor
  plan. A student cannot self-serve a room nobody has scanned.
- Generic room designers (Planner 5D, Homestyler, Coohom, Roomstyler, Room Sketch 3D) make
  you draw the room from scratch every time and have no concept of a verified, reusable
  "this exact dorm" template.
- The open gap DormView targets: free, self-serve, crowdsourced, per-layout templates. One
  student builds the room, everyone in that room type reuses it, no scanning crew, no school
  contract.

## Phased rollout (Will's stated plan, in order)

1. **E-Tower Traditional Double** (DONE). Ship it, share it with the floor. Shared in the
   Morewood E Tower group chat 2026-07-11; well received.
2. **All E-Tower room types** (DONE 2026-07-11): Traditional Single and Semi-Suite Triple
   added alongside the Double. Their dimensions are scaled off the official CMU floor plan
   (CMU publishes no numbers), labeled "(size est.)" in the picker; residents can correct
   them under Room size. Remaining polish: get a real resident measurement for the single
   and the triple to drop the "est." label.
3. **All CMU dorms**: add more buildings beyond E-Tower.
4. **Every college**: add more schools.

## Feature backlog

- Shopping list from links (requested 2026-07-11): paste product links so the app tracks
  what you ordered / bought / plan to buy. Second step: when a link is added, scrape the
  product dimensions straight from the page and offer to place a correctly sized item in
  the room. Needs a CORS-friendly fetch path (likely a tiny serverless proxy) since the
  app is a static page.
- Preloaded per-room finishes (requested 2026-07-11): each college / dorm / building entry
  ships with its real wall colors, desk colors, and room dimensions already loaded, so the
  room looks right the moment it opens. Folds into the data-driven geometry refactor below
  (add a finishes block next to the geometry block in SCHOOLS).
- Photo-to-3D: take a picture of a real item (poster, oddly shaped art, oddly shaped shelf)
  and drop a 3D version into the room. Not started. Likely needs an image pipeline and, for
  true 3D shapes, either photogrammetry or a "billboard/extrude from silhouette" shortcut.
- Make room GEOMETRY data-driven so new rooms are pure config (walls, door, window, closets,
  built-ins described by a room config object), not new builder code. This is the key
  refactor that unblocks phases 2 to 4 cleanly.
- Shared layout library (load someone else's layout by link/code, not just file upload).
- Optional: remember the last chosen room and offer to skip the landing on return.

## Technical next step for scaling to many rooms

Today `buildRoom()` hardcodes E-Tower geometry and `ROOM` is a single object. To scale:
- Give each room in `SCHOOLS` a `geometry` block (wall dimensions, door position/size,
  window position/size, closet positions, any built-ins).
- Refactor `buildRoom()` to read that block instead of constants.
- Keep `layout` presets, but allow per-room default furniture lists.
- Add a test fixture per room in `.test/scenetest.js` (bounds, no overlaps, framing).

Once geometry is data-driven, adding a room is: one `SCHOOLS` entry + one test path.

## Known limitations / risks to watch

- Everything is client-side. Sharing a layout today means sending the JSON file. A real
  shared library needs a backend or a link-encoding scheme.
- localStorage has a ~5MB cap. Poster images are stored as data URLs, so a layout with many
  uploaded photos can exceed quota; `autosave` swallows the quota error (progress for that
  write is skipped). Consider downscaling uploaded images before storing.
- three.js is pinned to r128 (UMD). Do not use newer APIs.
- Puppeteer screenshot test (`.test/shots.js`) needs a real Chrome; it does not run in the
  Cowork sandbox. Run it locally for visual checks.
