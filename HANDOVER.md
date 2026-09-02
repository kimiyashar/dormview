# DORMVIEW - COMPLETE HANDOVER

The single document that explains everything: what DormView is, the vision (including
how it makes money), every subsystem and function in the code, every place knowledge
and data live, how it was built, and how it scales. If you are picking this project up
cold (a new developer, a new Claude session, or future Kimi), read this top to bottom,
then `CLAUDE.md` for day-to-day conventions.

Last updated: 2026-07-16.

---

## 1. THE VISION

### 1.1 The product idea

Every August, hundreds of thousands of students move into dorm rooms they have never
seen, guessing whether a fridge fits, buying rugs that turn out too big, and arguing
with roommates over who gets which side. DormView fixes this: a student picks their
university, their building, and their room type, and gets an accurate, to-scale,
interactive 3D copy of that exact room in the browser. They arrange real-size
furniture, try colors, upload their posters, and share the plan with their roommate
before either of them buys anything.

The wedge is accuracy plus zero friction: no login, no download, no drawing your own
room. The room is already correct when you arrive, because the dimensions and shapes
come from official university floor plans (and, where possible, tape-measure
verification by residents).

### 1.2 The growth model (crowdsourced coverage)

Coverage grows ring by ring:
1. One room (E-Tower Traditional Double, measured in person). DONE, shipped, loved by
   the floor group chat.
2. Every room type in that building. DONE.
3. Every first-year building at CMU. IN PROGRESS (6 of ~12 halls done).
4. All of CMU, then other campuses.

The long-term coverage engine is crowdsourcing: one student measures or confirms a
room, every future resident of that room type reuses it. Roomie (the closest
competitor) sends paid scanning crews and sells to universities on contract; DormView
is free, self-serve, and student-fed. That gap is the moat.

### 1.3 The revenue model: dorm commerce

DormView's users are the highest-intent audience in retail: students (and parents)
who are about to furnish a room, know its exact dimensions, and are actively planning
purchases. Monetization paths, in rough order of effort:

1. **Affiliate links on inventory items.** Every item in the inventory tray (mini
   fridge, microwave, storage cart, shelving, rugs, string lights, bedding) can carry
   a "Buy this" link to Amazon/Target/Dormify etc. with an affiliate tag. The user
   has already placed the item in their room at real size; the click is as qualified
   as e-commerce traffic gets. No backend needed, just links.
2. **Sponsored inventory placements.** A furniture/bedding/poster brand pays to have
   its actual product (with its real dimensions and a branded card) featured in the
   tray, per school or per season (move-in August is the whole market). "Fits your
   room" is a claim only DormView can make truthfully.
3. **The shopping list feature** (backlog): users paste product links, DormView
   scrapes the dimensions and drops a correctly sized 3D item into the room, and
   tracks ordered / bought / planned. This makes DormView the planning hub for the
   entire move-in purchase cycle, and every tracked product is an affiliate
   opportunity. Requires a small scraping proxy (static pages cannot fetch cross
   site), which is the first real reason to add a backend.
4. **Display ads for dorm-adjacent sellers** (poster shops, mattress topper brands,
   mini fridge rental services, local Pittsburgh movers). Lowest effort, lowest
   value; do this only in non-intrusive placements (landing page, share pages),
   never inside the 3D planning surface.
5. **Later, with accounts:** per-campus "what most students in your hall actually
   bought" recommendations, which brands would pay for eagerly.

Sequencing advice: do not add any of this before campus coverage and sharing make
traffic meaningful. Ads on 30 users are worth nothing and cost trust. The metric that
unlocks revenue is weekly layouts created during July and August.

---

## 2. WHERE EVERYTHING LIVES

### 2.1 The deployed product

- **Production:** https://dormview.vercel.app - Vercel project `dormview` on team
  `26kimiys-projects`, deployed manually with the Vercel CLI logged in on Kimi's Mac
  (binary at `~/.npm-global/bin/vercel`). The site is a single static `index.html`.
- **Version 1 archive:** https://dormview.vercel.app/v1 - the original double-only
  launch build, served as `v1.html` with its localStorage key renamed to
  `dormview_v1_archive` so v1 and v2 can never overwrite each other's autosaves.
  The archived source is committed at `v1/index.html`.
- **Parked, unused:** https://dormview-beta.vercel.app plus an InsForge cloud project
  (`dormview-beta`). These were a one-day experiment with a cloud share-link backend.
  Kimi decided no backend for now. The complete working implementation (database
  schema, security rules, Share button, `?r=CODE` loader) is preserved in the dev
  clone's git history at commit `51431f8` if it is ever wanted again.

### 2.2 Source code and git

- **Production folder:** `/Users/kimiyashar/dorm 3d schematic ` - NOTE the trailing
  space in the folder name; always quote the path. This is the only folder that
  deploys to production.
- **GitHub:** https://github.com/kimiyashar/dormview (private). Tags: `v1` (double
  only launch build) and `v2` (the versioned release). `gh` CLI is authenticated on
  this Mac; push normally.
- **Dev sandbox:** `/Users/kimiyashar/dormview-dev` - a full clone with NO git
  remotes on purpose (experiments cannot accidentally push or deploy). Rules in its
  `DEV-NOTES.md`. Graduating a change means porting it to the production folder.
- **Deliverable:** everything is ONE file, `cmu-etower-double-3d.html` (~2,500
  lines). No build step, no framework, no bundler. It is renamed `index.html` at
  deploy time only.

### 2.3 Documentation inside the repo

- `CLAUDE.md` - the working context file Claude reads first: status, conventions,
  gotchas, the CMU floor plan flow, how to add rooms. THE source of truth.
- `HANDOVER.md` - this file.
- `README.md` - user-facing repo readme with a Versions section.
- `REFERENCE.md` - quick reference (created during the GitHub push session).
- `docs/ARCHITECTURE.md` - code map of the single HTML file.
- `docs/ROADMAP.md` - vision, phases, backlog, risks.
- `docs/TESTING.md` - the Node test harness (note: the `.test/` harness itself lives
  in the original Cowork sandbox, not in this folder; see 6.3).
- `docs/DEPLOYMENT.md` - exact redeploy commands including the /v1 archive step.
- `DEV-NOTES.md` (dev clone only) - sandbox ground rules.

### 2.4 Claude's persistent memory (outside the repo)

Claude Code keeps cross-session memory at
`~/.claude/projects/-Users-kimiyashar/memory/`:
- `dormview-project.md` - project status pointer (paths, URLs, deploy method,
  what is parked, what is next).
- `cmu-floor-plan-flow.md` - Kimi's taught data-sourcing workflow (see section 5).
- `MEMORY.md` - the index that loads into every session.

These mean any new Claude session starts already knowing the project. If you are a
human developer, the same knowledge is in `CLAUDE.md` + this file.

### 2.5 Local preview servers

`~/.claude/launch.json` defines dev servers:
- `dormview-local` - serves the production folder at http://localhost:8123
- `dormview-dev` - serves the sandbox at http://localhost:8124 (different port =
  different localStorage origin, so previews never cross-contaminate saves).
Open `http://localhost:8123/cmu-etower-double-3d.html`. Hard refresh after edits.

---

## 3. THE DATA: WHERE ROOM TRUTH COMES FROM

### 3.1 Kimi's floor plan flow (follow exactly)

1. Start at https://www.cmu.edu/housing/our-communities/residences/index.html - the
   Residence Halls list. Every hall card links to a hall page.
2. On the hall page: the "at a Glance" box lists room types (page styling varies).
   Expand **Floor Plans**.
3. Open ONLY the per-room-type PDFs, e.g. "Semi-Suite Single (pdf)". SKIP the
   Ground/First/Second/Third Floor PDFs (those are whole-building floors).
   URL pattern:
   `https://www.cmu.edu/housing/our-communities/residences/floor-plans/<hall-dir>/<hall>_<room-type>_floor-plan.pdf`
4. Also open **Room Tours** -> Start Tour -> the "Floorplan View" button at the
   bottom (backwards-L icon). That is the Matterport dollhouse: the room's REAL
   furniture arrangement from above, plus a ruler tool to measure anything the PDF
   does not print.
5. Build the room to follow the plan: the printed dimensions AND the true wall
   outline (polygon for L-shapes, bays, corridors), door position, window positions,
   closets, bath. Then set the default furniture to match the drawing.

### 3.2 Data quality tiers

- **Measured:** E-Tower Traditional Double (Will measured usable depth 13'10"; the
  PDF number included the window bay). Gold standard.
- **Official PDF:** all other rooms use dimensions printed on CMU's own per-room
  plans. CMU disclaims these as estimates; the app's Room size panel lets any
  resident correct their own copy.
- **Proportional:** furniture default positions are scaled off the drawings, close
  but not survey-exact.

### 3.3 Current catalog (18 rooms, 6 buildings, all first-year CMU)

E-Tower: Traditional Double (measured), Traditional Single, Semi-Suite Triple 323
(true L-shape polygon with private bath block and entry corridor).
Morewood Gardens Main: Semi-Suite Single (7'4" wide strip room), Semi-Suite Double
(in-room bath block), Semi-Suite Triple (entry corridor polygon).
Mudge: Traditional Single/Double/Triple, Semi-Suite Single/Double, Semi-Suite Quad
(the round A-tower room with a faceted curved window bay).
Donner: Traditional Single/Double/Triple (triple defaults to a bunked pair).
Stever: Traditional Double. Boss: Semi-Suite Single/Double.
Remaining CMU halls to add: McGill, Henderson, Hamerschlag, Welch, Fifth & Clyde,
Residence on Fifth (studio doubles/triples), Scobell if listed.

---

## 4. THE CODE: EVERY SUBSYSTEM AND FUNCTION

One HTML file: `<head>` styles (CSS variables, warm Sims-like palette), `<body>` UI
shells, two CDN script tags (three.js r128 UMD from cdnjs, heic2any from jsDelivr),
then one big ES5-style IIFE. ~159 functions, grouped below by subsystem in file
order. (Grep anchors beat line numbers; lines drift.)

### 4.1 UI shell (HTML ids)

`#scene` WebGL canvas; `#landing` University/Building/Room picker overlay; `#boot`
spinner + CDN failure message; `#topbar` (title/breadcrumb `tbTitle`/`tbCrumb`,
Change room `btnRooms`, Undo/Redo, Dimensions toggle, Reset view, Save image
`btnSnap`, Save layout `btnExport`, Load layout `btnImport`); `#panel` left (View,
Layout presets incl. `btnResetLayout`, Finishes and colors, Room size `rW rD rH
applyRoom`); `#tray` right (inventory search + cards); `#seltool` bottom selection
toolbar (rotate buttons, W/H/D inputs `pW pH pD`, poster upload `pFile`, color chip
`selColor` + part dropdown `colorPart`, Delete `delSel`, Done); `#tip` hover
tooltip; `#hint` helper strip.

### 4.2 Utilities and materials

`clamp rnd srgb col byId val chk opt fill add` small helpers; `box(w,h,d,mat)` the
universal shadowed box mesh; `tex cvs gradientTexture woodTexture posterTexture
placeholderPosterTex` canvas-generated textures; `shadowize`; `dimLine ftin
ftinExact` inch-to-feet-inches formatting (units are INCHES everywhere); `MAT` the
shared material library; recolor target objects `C_WOOD C_WALLT C_FLOORT C_RUGT
C_CURT C_MATT` (label + material list pairs shared between the left panel and
per-item recoloring).

### 4.3 Room state (the per-room registry contract)

Globals set on room entry: `ROOM {w,d,h}` bounding dims; `BED_TOP` mattress height;
`ROOM_BEDS` (1/2/3/4); `ROOM_CLOSETS` (0 none, 1 left only, 2 flanking);
`ROOM_SHAPE` polygon spec or null; `ROOM_FURN` furniture plan or null; `ROOM_DOORX`
door offset on the back wall; `ROOM_WINDOWS` window center list (numbers, or
`{x,z,ry}` objects for angled bay windows); `ROOM_BATH` in-room bath rect for
rectangular rooms; `CURRENT_ROOM_KEY` like `cmu/mudge/ss_quad`.

`var SCHOOLS = { school: { name, buildings: { bldg: { name, rooms: { room: CFG }}}}}`
where CFG = `{ name, room:{w,d,h}, layout, beds, closets?, doorX?, windows?, bath?,
shape?{ outline:[[x,z]...], windows, door:{x}, bath:{x1,z1,x2,z2}, light:[x,z] },
furniture?:[ {k:'bed'|'desk'|'chair'|'dresser'|'closet', id, x, z, ry?, y?, side?} ] }`.
Adding a room = adding one CFG entry. This is the whole "rooms are data" design.

### 4.4 Room construction

`pointInPoly` ray-cast test; `buildRoom` builds everything static: rectangular path
(box floor/ceiling, four named walls) or polygon path (floor/ceiling from
THREE.Shape with normalized UVs, one wall per outline edge with outward normal
stored for auto-hide); the door (steel-blue, mirror, positioned by `S.door.x` or
`ROOM_DOORX`); `closetDoor(sign)` flush built-in closet doors per `ROOM_CLOSETS`;
the window/radiator/light group per window center (supports `{x,z,ry}` angled bay
windows); the bath block (tiled floor, walls with a door gap, toilet hint) from
`shape.bath` or `ROOM_BATH`; ceiling light + smoke detector (offset by `shape.light`
so it never hangs inside a bath). `buildDimLabels makeLabel roundRect` the floating
"12'7.5" wide" sprite labels; `refreshWalls` smart wall auto-hide (rect: camera
halfspace test per named wall; polygon: hide walls whose outward normal faces the
camera); `applyWallStyle applyBedColors` finish appliers.

### 4.5 Furniture builders (the inventory)

Every builder returns a THREE.Group tagged by `tagItem` (see 4.6). Room furniture:
`makeBed` (Twin XL 39x80, per-bed height baked at build, `userData.bedTop`
remembered for save/load, L/R comforter colors), `makeDesk` (42x24x30, drawer
slim), `makeHutch` (separable desk shelf), `makeDeskDrawers` (under-desk pedestal
that TUCKS under the desk: `userData.tucks` + desk `clearanceH` exempt it from
stacking), `makeChair`, `makeDresser`, `makeCloset` (freestanding wardrobe),
`makeCurtains`. Inventory extras: `makeCart makeFridge makeFridgeCaddy makeMicrowave
makeBookshelf makeNightstand makeTV makePlant makeFan makeBeanbag makeRug makeShelf
makeDrawers makeBasket makeBedTray makeStool` (folding stool, fully resizable box
item) plus decorative `makeLamp/LampItem makeMonitor/MonitorItem makeWallMirror
MirrorItem makeGuitar/GuitarItem makeLaundry/LaundryItem makePizza/PizzaItem
makeLavaLamp/LavaItem makeShoes/ShoesItem makeStringLights/StringLightsItem
makePosters makeUPoster makeClutter`. Box-resizable items rebuild geometry via
`rebuildShelf rebuildDrawers rebuildBasket rebuildStool`.

`RAW` maps kind string -> builder; `build(kind)` constructs and stamps
`userData.kind`; `CATALOG` is the array behind the tray cards; `renderTray buildShop`
render the tray with search; `kindFromId` maps layout ids (bedL/bedM/bedQ/desk/
hutch/pedestal/...) to kinds so layout-placed items survive save/load.

### 4.6 Item model, selection, editing

`tagItem(g,name,w,h,d,hint)` stamps every item: `hoverInfo` tooltip, `footprint`,
`movable resizable scaleResize`, size fields `pw/ph/pd` + originals `ow/oh/od`, and
clones materials into a generic whole-item recolor target so recoloring one item
never bleeds to others. `addItem placeItem placeFromScreen clearItems` manage the
`items[]` array. `addDeskSet(sfx,x,z,rot)` places the desk trio (desk + hutch on the
desktop + pedestal tucked under) as three independent movable items.

`select deselect refreshSelBox` selection box + toolbar; `hoverTarget showTip
hideTip` tooltips; pointer handlers (grep `POINTER EVENTS`): orbit, pan (right
drag), drag-move with `screenToFloor updateMouse posterWallPlane
attachPosterToWall`, keyboard arrows/R/Escape/Delete (guarded so typing in inputs
never deletes items), `endPointer` commits drags to history.

Resize: `resizePoster(o,w,h,d)` is the single core (box items rebuild, scaleResize
items scale, posters rebuild planes; updates dims, footprint, reseats stacking).
Driven by the W/H/D inputs (live on `input`, history commit on `change`) and by the
hover-arrow gizmo: `makeArrow buildHandles clearHandles localExtents handleDir
positionHandles setArrowHover startResize doResize` - nine handles on the yellow
selection box (four edge-midpoint stretch arrows, four corner proportional-scale
arrows, one top height arrow).

Stacking: `supportHeight` seats a smaller item on a larger one's top (microwave on
fridge, hutch on desk), with the tuck-under exemption for the pedestal.

Recolor: `selColor` input writes the active target's materials (`kind:'wall'|'floor'`
clears texture maps first); `colorPart` switches targets; global finishes share the
same target objects; `itemColors applyItemColors` serialize per-item colors.
`applyPosterImage readImageToPoster` poster upload incl. iPhone HEIC via heic2any.

### 4.7 Layouts (default furniture)

`applyLayout(name)` clears items and dispatches: if `ROOM_FURN` exists ->
`layoutPlan(list,bedTop,bunk)` places furniture exactly as traced from the PDF (the
Bunked preset stacks the first two beds; `y:46` in data pre-stacks a pair, as in
Donner/Mudge triples); else by `ROOM_BEDS`: `layoutSingle` (+wardrobe when
closets:0), `layoutDeskFoot`-based `layoutStandard/layoutRaised` and `layoutBunk
layoutOpen` for doubles, `layoutTripleRect`, `layoutTriple` (E-Tower 323 L-shape),
`layoutQuad`. Presets map Standard/Raised to bed height 20/36, then
`applyBedColors applyBedding clampAll` and a history push. `histIf saveIf` guarded
helpers; `clampOne clampAll` keep items inside the bounding rect.

### 4.8 Persistence (the part users would riot over)

`serialize()` -> `{v, room, layout, bedTop, roomKey, beds, colors, items:[{kind,id,
x,y,z,ry,pw,ph,pd,wall,bt,img,colors}]}`. `loadState` rebuilds from scratch
(idempotent), restoring the room registry extras via `CURRENT_ROOM_KEY` lookup and
honoring per-bed heights (`bt`). `snapshot restoreState pushHistory undo redo
updateUndoBtns` in-memory history (undo covers moves, rotates, deletes, resizes,
layout resets). `autosave` writes to `localStorage[LS_KEY]`
(`dormview_etower_double_v2` kept for compatibility) and is called from every
mutating path plus `pagehide`/`visibilitychange` flushes; **SAVE_READY gate**:
autosave is disabled until the boot restore has run, because boot builds a default
room first and once shipped a bug where that default overwrote the user's save.
NEVER remove that gate. `btnExport/btnImport` download/upload the same JSON (the
current sharing mechanism). Restore skips the landing for returning visitors.

### 4.9 Camera, landing, boot

`applyCam fitRadius roomBoundRadius setView('corner top door window') resize render
tick` custom spherical orbit camera that auto-frames any room size. `initLanding
refreshEnter applyRoomSelection` cascading pickers driven entirely by `SCHOOLS`;
re-entering the same room preserves the arrangement; a different room rebuilds.
Boot order matters: registry -> buildRoom -> default layout -> restore -> SAVE_READY
-> landing wiring.

---

## 5. HOW IT WAS BUILT (practices to keep)

- Built by Kimi with Claude Code, iterating against real user feedback from the
  Morewood E Tower group chat (the floor uses the live site).
- Kimi's working style (in `CLAUDE.md`, follow it): no em dashes anywhere; concise;
  ask before building when ambiguous; ship whole finished things with tests and
  docs; keep the single-file no-build setup; explain decisions plainly.
- Approval gates: new-looking rooms and buildings are DEMOED LOCALLY FIRST
  (screenshots against the CMU plan) and deployed only on Kimi's explicit sign-off.
  Production has real users; nothing deploys casually.
- Accuracy is the brand. When a default room was wrong (Mudge shapes, Donner
  triple), the fix was re-tracing from source, not tweaking until it looked okay.
- Every change is committed with a real message and pushed to GitHub. Versions that
  users depended on are tagged and kept servable (/v1).
- Verification is end-to-end in a real browser (enter every room, check console,
  screenshot against the plan), not just "it compiles". The Node scene test harness
  (`.test/scenetest.js`, lives in the original Cowork sandbox) additionally runs the
  page's real JS headlessly: layouts in bounds, no overlaps, undo/redo, save/load
  round trip, recolor leak guard, handle counts.

Gotchas that have bitten before (full list in CLAUDE.md section 5): three.js is
pinned to r128, no newer APIs; `renderer.setSize` must keep updateStyle true; hex
color literals corrupt easily; the folder name's trailing space breaks unquoted
paths; python http.server caches, bust with `?v=`.

---

## 6. SCALING PLAN

### 6.1 Near term (no backend needed)

1. Finish CMU: remaining six halls via the floor plan flow. Each is now mostly data
   entry into `SCHOOLS` (a config + optional polygon + furniture list).
2. Preloaded per-room finishes (real wall colors, floor types per building) - a
   `finishes` block next to `shape` in the registry.
3. Affiliate links: add an optional `buyUrl` per CATALOG card, render a small "buy"
   link on the card and in the selection toolbar. First revenue with zero
   infrastructure.
4. A proper landing/share page (og:image previews of layouts) so shared links look
   good in group chats - still static.
5. Resident-verified badge: rooms confirmed by a measurement get marked, feeding
   the accuracy brand.

### 6.2 Medium term (first backend, small)

The moment sharing-by-file feels limiting or the shopping list lands, add the
minimal backend (the InsForge experiment at dev-clone commit `51431f8` is a working
reference: `layouts` table, public insert/select only, 8-char share codes,
`?r=CODE` loader). Then:
- Cloud share links (replaces JSON file swapping).
- Shopping list + link scraping proxy (dimension extraction from product URLs) ->
  correctly sized 3D items -> affiliate revenue.
- Crowdsourced room submissions: a form that emits a `SCHOOLS` CFG candidate +
  photos, human-reviewed before merging (accuracy is the brand; no auto-publish).
- Simple counts (rooms opened, layouts saved) for sponsor conversations.

### 6.3 Long term

- Accounts (layout follows the student across devices; roommate co-editing).
- Other campuses: the registry already nests school -> building -> room; the work
  is data acquisition. Recruit one ambassador per campus (RA/orientation leader),
  give them the flow in section 3.1.
- Sponsored product catalogs per campus and season; "most-bought in your hall".
- Photo-to-3D (photograph an item, get a placeable model) - the hardest backlog
  item, do last.
- Code health at scale: the single file is sacred UX-wise (open it, it works) but
  at ~100+ rooms consider generating the SCHOOLS registry from per-room JSON files
  at deploy time while still shipping one HTML file.

### 6.4 What NOT to do

- Do not add ads inside the 3D editing surface; monetize the tray, the share page,
  and purchase intent instead.
- Do not auto-publish crowdsourced rooms without review.
- Do not add a framework, a bundler, or a rewrite; the one-file architecture is why
  a beginner owner can hand it to a friend, and why it deploys in one minute.
- Do not deploy without Kimi's sign-off, and never break the /v1 archive or the
  autosave compatibility key.

---

## 7. QUICK OPERATIONS CHEAT SHEET

Run locally: serve the production folder on :8123 (`dormview-local` launch config)
and open `/cmu-etower-double-3d.html`, or just double-click the file.

Deploy (after sign-off):
```
mkdir -p /tmp/dormview
cp cmu-etower-double-3d.html /tmp/dormview/index.html
git show v1:cmu-etower-double-3d.html > /tmp/dormview/v1.html   # or cp v1/index.html
sed -i '' "s/var LS_KEY='dormview_etower_double_v2'/var LS_KEY='dormview_v1_archive'/" /tmp/dormview/v1.html
printf '{"cleanUrls":true}' > /tmp/dormview/vercel.json
cd /tmp/dormview && vercel deploy --prod --yes --scope 26kimiys-projects
```
Then verify in a browser (enter several rooms, check the console), commit, push.

Add a room: follow section 3.1 to get the PDF + Matterport dollhouse, add one CFG
entry to `SCHOOLS` (dims, beds, closets, doorX, windows, shape polygon if not
rectangular, furniture list traced from the plan), enter it locally, compare a
top-down screenshot against the PDF, demo to Kimi, deploy on approval.
