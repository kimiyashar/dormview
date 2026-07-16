# CLAUDE.md - DormView (working context for Claude Code)

Read this first. It is the single source of truth for picking the project back up.
Companion docs live in `docs/`: `ARCHITECTURE.md` (code map), `ROADMAP.md` (vision and
phases), `TESTING.md` (how the test harness works), `DEPLOYMENT.md` (Vercel/GitHub status).

---

## 1. What this is

**DormView** is a 3D interactive dorm-room planner that runs entirely in the browser.
A student picks their university, building, and room type on a landing screen, then gets
an accurate to-scale 3D model of that exact room. They arrange furniture, recolor
everything, resize items, add inventory (fridge, cart, posters, shelves, etc.), upload
poster art, and save/share the layout so they can plan what to buy before move-in.

The whole app is ONE self-contained HTML file. No build step, no framework, no bundler.

- **Deliverable:** `cmu-etower-double-3d.html` (open it directly in a browser, needs
  internet on first load to pull three.js + heic2any from CDNs).
- **First room shipped:** Carnegie Mellon University -> Morewood Gardens (E-Tower) ->
  Traditional Double.
- **End goal:** every room type at E-Tower, then every dorm at CMU, then every college.
  A student inputs school + building + room and the exact layout loads.

## 2. Who this is for

- Owner: **Will** (will@yasharfamily.com), a CMU student and coding beginner.
- Working style Will asked for (follow these):
  - No em dashes, ever. (Avoid en dashes too; use hyphens or reword.)
  - Be concise and direct. Cut words that do not change the meaning.
  - Ask clarifying questions when a request is ambiguous, before building.
  - "Boil the ocean": do the whole thing, with tests and docs. Ship the finished
    product, not a plan. Search before building, test before shipping.
- Will is new to code, so explain decisions plainly and keep the single-file, no-build
  setup (it is easy for him to open and to hand to friends).

## 3. Current status (all verified, all tests passing)

Done and tested:
- Accurate E-Tower Traditional Double room (see dimensions in section 6).
- All three E-Tower room types (2026-07-11): Traditional Double (measured), plus
  Traditional Single and Semi-Suite Triple with dimensions scaled off the official CMU
  floor plan PDF (no numbers are published, so their names carry "(size est.)" and rooms
  are correctable under Room size). Each room carries a `beds` count in SCHOOLS; the
  single gets layoutSingle, the triple gets layoutTriple (bunk pair + free bed whose
  height follows the Standard/Raised presets). Saves remember roomKey + beds + per-bed
  height (userData.bedTop / item `bt`), so reload restores the right room.
- Four layout presets: Standard (beds ~20"), Beds raised (~36" lofted), Bunked, Open.
- Desks default: long 42" back edge against the foot of the bed, open side + chair facing
  the door/closets, chair pushed in.
- Hover any object to see exact dimensions (feet-inches plus total inches).
- Move (drag), rotate, delete furniture. Undo/redo (Cmd/Ctrl+Z style) with working buttons.
- Inventory tray (right side) with search; drag or click to place items at real size.
- Recolor EVERYTHING by selecting it and picking a color (walls, floor, beds, rug,
  curtains, wood, and every item including the microwave). Shared materials are cloned per
  item so recoloring one never bleeds onto another.
- Resize two ways: (a) W/H/D number boxes on the selection toolbar, (b) hover-arrow gizmo
  (hover a side -> double-headed arrow for that dimension, hover the corner -> 45 degree
  diagonal arrow for proportional scale, drag to stretch, arrows hide on un-hover).
- Stacking: center a smaller item over a larger one and it sits on top (microwave on
  fridge, baskets on cart shelves, etc.).
- Poster upload works, including iPhone HEIC (converted via heic2any). Custom W/H.
- Save layout / Load layout (renamed from "Load"), full JSON serialization of every item,
  transform, size, per-item colors, and poster image. Autosave to localStorage so a plain
  browser reload restores the last state.
- Landing page: cascading University -> Building -> Room type dropdowns, "Enter my room",
  and a "Change room" button in the top bar to reopen it. Returning visitors with saved
  progress skip the landing and go straight to their restored room.
- Persistence hardened (2026-07-11): fixed a boot-order bug where the default layout
  autosaved over the user's progress before restore ran (SAVE_READY gate); panel finish
  colors, floor type, and W/H/D input resizes now autosave; a final save flushes on
  pagehide/visibilitychange so closing the laptop never loses work.

Deployed:
- **Live at https://dormview.vercel.app** (2026-07-11), project `dormview` on Vercel team
  `26kimiys-projects`, shipped via the local Vercel CLI (logged in as kimiyashar). Redeploy
  steps are in `docs/DEPLOYMENT.md`.
- **On GitHub: https://github.com/kimiyashar/dormview** (private, 2026-07-12). v2 is the repo
  root (the live build); v1 (Traditional Double only) sits in `v1/`. Git tags `v1`
  (9749e08) and `v2` (dd566e2) mark each version. Pushed with the `gh` CLI (authenticated
  as kimiyashar), so `git push` future changes normally.

- Five CMU buildings (2026-07-14): E-Tower plus Morewood Gardens (Main), Mudge House,
  Donner House, and Stever House. 16 room types total, every dimension taken from the
  official per-room floor plan PDFs on cmu.edu/housing (rectangles; only the E-Tower 323
  triple has polygon geometry so far). New generic layouts: layoutTripleRect (side beds +
  window bed), layoutQuad (Mudge semi-suite quad), and layoutSingle grows a freestanding
  wardrobe when closets:0 (narrow Donner/Mudge singles that cannot fit closet doors).

Blocked / not done:
- Next design work (not started): the UI to make the app configurable for anyone in
  E-Tower, then all of CMU, then any college. See `docs/ROADMAP.md`.

## 4. How to run and test

- Open the app: double-click `cmu-etower-double-3d.html` or open it in a browser. Hard
  refresh (Cmd+Shift+R) after edits to dodge cache.
- Run the logic tests (fast, no browser needed):
  ```
  cd .test
  node scenetest.js
  ```
  Expect the final line `RESULT: ALL CHECKS PASSED`. This harness runs the page's real JS
  against real three.js in a Node VM with stubbed WebGL + DOM, then introspects the scene.
  It covers: parse/runtime errors, all four layouts (bounds + no overlaps + closet zones),
  every inventory builder, hover dimensions, camera framing, undo/redo, resize (box +
  scale), generic recolor with a shared-material leak guard, save/load round trip, bed
  heights, desk-at-foot orientation, the SCHOOLS registry, resize handles, and hover arrows.
- `node .test/shots.js` takes real screenshots via Puppeteer. It does NOT run in the
  Cowork sandbox (bundled Chrome is not arm64-compatible here) but works on a normal
  machine. Use it locally to eyeball the landing page and the 3D view.

Always run `node .test/scenetest.js` after any change to the HTML and keep it green.

## 5. Conventions and gotchas

- Single file. When Claude creates HTML/JS, keep it all in `cmu-etower-double-3d.html`.
- three.js r128 UMD from cdnjs (`THREE` global). Do NOT use APIs newer than r128
  (for example no `CapsuleGeometry`). heic2any is loaded from jsDelivr for HEIC posters.
- Style is ES5-ish (`var`, function declarations). Keep it consistent; it is intentional
  and beginner-legible.
- Colors in code are hex like `0xcaa15f`. Watch for stray non-hex characters; a corrupted
  hex literal has broken the file before.
- Renderer sizing: `renderer.setSize(w,h)` must keep the default `updateStyle=true` and the
  canvas CSS must be `width:100vw;height:100vh`. Passing `false` caused an overflow bug.
- No em dashes anywhere, including code comments and docs.
- Units are inches throughout. `dimLine(w,h,d)` formats the feet-inches hover strings.
- Autosave is gated by `SAVE_READY` (set true only after the boot restore runs). Never
  remove that gate: boot calls `applyLayout` which autosaves, and without the gate the
  default layout overwrites the user's saved progress before restore can read it. That
  exact bug shipped once (fixed 2026-07-11).

## 6. The room (ground truth numbers)

```
var ROOM = { w:151.5, d:166, h:96 };   // 12'7.5" wide x 13'10" deep x 8' tall
```
Depth was set to 13'10" (166") of usable floor after Will measured; the PDF floor plan
listed more but included the window bay. Beds are Twin XL 39x80. Standard mattress top is
20", raised/lofted is 36". Closets are flush doors with no volume. There is a real window
(dark frame + bright pane) on the far/window wall and a door on the near wall.

## 7. Where things live in the file (grep anchors, not line numbers)

Line numbers drift, so search for these:
- Room + materials: `var ROOM =`, `var MAT =`, recolor targets `var C_WOOD`, `C_WALLT`,
  `C_FLOORT`, `C_RUGT`, `C_CURT`, `C_MATT`.
- Bed height flag: `var BED_TOP`. Bed builder: `function makeBed(`.
- Layouts: `function layoutDeskFoot(` (shared arrangement), `layoutStandard`,
  `layoutRaised`, `layoutBunk`, `layoutOpen`, dispatcher `function applyLayout(`.
- Item tagging + generic recolor + universal resize flags: `function tagItem(`.
- Inventory builders: `makeFridge`, `makeMicrowave`, `makeCart`, `makeFridgeCaddy`,
  `makeBasket`/`rebuildBasket`, `makeBedTray`, `makeShelf`/`rebuildShelf`,
  `makeDrawers`/`rebuildDrawers`, plus `makeLampItem` etc.
- Registry (kind -> builder): `var RAW =`. Inventory cards: `var CATALOG=`.
- Resize logic (all three item types): `function resizePoster(`.
- Hover-arrow gizmo: `function makeArrow(`, `buildHandles`, `positionHandles`,
  `handleDir`, `setArrowHover`, `startResize`, `doResize`.
- Selection/drag/rotate: `function select(`, `function deselect(`, pointer handlers under
  `POINTER EVENTS`.
- Save/load: `function serialize(`, `function loadState(`, `var LS_KEY`, `function autosave(`.
- Poster image + HEIC: `function applyPosterImage(`, the `pFile` change handler.
- Landing page: `var SCHOOLS =`, `function applyRoomSelection(`, `function initLanding(`,
  and the HTML `id="landing"`.

## 8. Data model (item userData)

Every placed object is a `THREE.Group`/`Mesh` pushed to `items[]` with `userData`:
- `id` (string), `kind` (registry key, drives rebuild on load/undo).
- `hoverInfo {name, dims, hint}` for the tooltip.
- `footprint {w,d,h}` for bounds/stacking.
- `movable`, `resizable`, `deletable`, `wall` (for wall posters/mirrors).
- Resize model: `pw/ph/pd` current size, `ow/oh/od` original size.
  - `box:true` items rebuild geometry via `rebuild(o,w,h,d)` (shelf, drawers, basket).
  - `scaleResize:true` items scale the whole group (most furniture, via `tagItem`).
  - Posters are planes (rebuild PlaneGeometry), `wall` set, `imgURL` holds the data URL.
- `recolorTargets`: array of `{label, mats:[materials], input?, kind?}`. `kind:'wall'` or
  `'floor'` nulls the texture map before recoloring. Items without an explicit target get
  a generic "Color" target in `tagItem` (materials are cloned so recolor is per-instance).

## 9. How to add a new room / building / school

Finding CMU floor plans (Kimi's flow, follow it exactly):
1. Start at https://www.cmu.edu/housing/our-communities/residences/index.html (the
   Residence Halls list; every white card links to a hall page).
2. On the hall page: the "at a Glance" box lists room types; expand "Floor Plans".
3. Open ONLY the per-room-type PDFs ("Semi-Suite Single (pdf)" etc.). Skip the
   Ground/First/Second/Third Floor PDFs; those are whole-building floors.
   URL pattern: .../residences/floor-plans/<bldg-dir>/<bldg>_<room-type>_floor-plan.pdf
4. Build the room to follow the plan: printed dimensions AND the true wall outline
   (polygon `shape` for L-shaped semi-suites with bath/hall), door, window, closets.

1. Add an entry to `var SCHOOLS` at the bottom of the script:
   ```js
   SCHOOLS.cmu.buildings.etower.rooms.trad_single = {
     name:'Traditional Single', room:{w:..., d:..., h:...}, layout:'standard'
   };
   ```
   Buildings and schools nest the same way (`SCHOOLS.<school>.buildings.<bldg>.rooms.<room>`).
2. On "Enter my room" the app sets `ROOM` from `room` and calls `applyLayout(layout)`. If a
   new room needs different furniture, add a layout function (mirror `layoutDeskFoot`) and
   reference it, or branch in `applyLayout`.
3. Re-entering the SAME room key preserves the user's saved arrangement (see
   `applyRoomSelection` + `CURRENT_ROOM_KEY`). A different key rebuilds.
4. Add a test path in `.test/scenetest.js` (there is already a landing-registry check).

Room GEOMETRY is now partially data-driven (2026-07-11): a room may carry a `shape` block
(`outline` polygon, `windows` centers, `door.x`, `bath` rect, `light` position) and
`buildRoom` builds the polygon: per-edge walls with outward normals (auto-hide aware),
multiple windows + radiators + curtains, offset door, dollhouse-height bath block. The
semi-suite triple uses this; rectangular rooms still use the classic path. See the
`semi_triple` entry in SCHOOLS for the reference example.

## 10. Immediate next steps (when you resume)

1. Deploy is DONE (https://dormview.vercel.app) and the repo is now on GitHub
   (https://github.com/kimiyashar/dormview, private). See `docs/DEPLOYMENT.md` for redeploy
   steps.
2. Then design the "configurable for anyone in E-Tower" UI (more room types). This is the
   agreed next version.
3. Then the "anyone at CMU" UI (more buildings), then "any college" (more schools).
4. Long-term feature Will wants: photo-to-3D, take a picture of an item (poster, odd-shaped
   art, shelf) and place a 3D version in the room. Not started.
