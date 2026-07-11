# ARCHITECTURE.md - how the app is built

Everything lives in `cmu-etower-double-3d.html`. Structure of that file, top to bottom:

1. `<head>` styles. CSS variables in `:root` (warm "Sims cozy" palette: `--yellow`,
   `--plumbob` green, wood/ink tones). Landing-page styles are near the end of the style
   block under the `landing / room picker` comment.
2. `<body>`:
   - `#scene` canvas (the WebGL surface).
   - `#landing` overlay (the University/Building/Room picker, shown first).
   - `#boot` overlay (spinner + a CDN-failure message).
   - `#topbar` (title/breadcrumb, Change room, Undo/Redo, Dimensions, Reset view,
     Save image, Save layout, Load layout).
   - `#panel` (left): View, Layout, Finishes and colors, Room size.
   - `#tray` (right): Inventory with a search box and 2-column cards.
   - `#seltool` (bottom): selection toolbar (rotate, W/H/D, upload image, color, delete).
   - `#tip` (hover tooltip), `#hint` (bottom-left helper text).
3. Two `<script>` tags load three.js r128 (cdnjs) and heic2any (jsDelivr).
4. The main `<script>` is one big IIFE. Order inside it:
   materials -> geometry helpers -> `buildRoom` -> furniture builders -> inventory builders
   -> `RAW` registry + `build` -> layouts + `applyLayout` -> decorations shims -> camera ->
   tooltip -> select/deselect + resize handles -> pointer events -> inventory tray/CATALOG
   -> save/load + autosave -> render loop -> BOOT sequence -> landing setup.

## Rendering and camera

- `THREE.WebGLRenderer` with `ACESFilmicToneMapping`, `sRGBEncoding`, soft shadows, fog.
- Lights: hemisphere + directional (sun, shadow-casting) + point lights, plus a ceiling
  fixture that can be toggled.
- Camera is a custom spherical orbit controller: state `cam = {theta, phi, radius}` around
  `target`. `applyCam()` writes the camera position. `fitRadius(margin)` auto-fits the room
  to the viewport using its bounding sphere and the fov. `setView(name)` has presets:
  `corner` (tuned phi/target sweep), `top`, `door` (first-person eye-level from the
  doorway), `window`.
- `resize()` locks the canvas to the window and re-centers.

## The room

`buildRoom()` builds walls (inner faces, recolorable), floor (recolorable), the inner-face
door, two flush closet doors at x = +/-38 (no volume), the window (dark frame + bright
`MeshBasicMaterial` pane so it reads on any wall color), radiator, and ceiling light refs.
`ROOM = {w:151.5, d:166, h:96}`.

## Items, builders, registry

- `items[]` holds every placed object. `addItem(id,obj,x,z,rotY)` and
  `placeItem(kind,x,z)` add to it. `clearItems()` empties it.
- `tagItem(g,name,w,h,d,hint)` stamps `userData` (hoverInfo, footprint, movable, resizable,
  scaleResize, pw/ph/pd, ow/oh/od) and, if the item has no explicit `recolorTargets`,
  clones its materials and adds a generic whole-item "Color" target.
- `RAW` maps a `kind` string to a builder function. `build(kind)` calls it and stamps
  `userData.kind`. Used by the inventory tray, undo/redo, and load.
- `CATALOG` is the array of inventory cards (kind, label, dim, icon) rendered into `#tray`.

## Layouts

`applyLayout(name)` clears items and calls one of `layoutStandard` / `layoutRaised` /
`layoutBunk` / `layoutOpen`, then reapplies bedding/colors and pushes history.
`layoutStandard` and `layoutRaised` both call `layoutDeskFoot(bedTop)` which places:
dressers in the back corners, beds along the side walls with pillows toward the window
(foot toward the door), desks with their long back edge against the bed foot (rotated so
the open side + hutch face the door), and chairs pushed in facing the desk. `BED_TOP` (20
standard, 36 raised) drives the bed height via `makeBed(side, matTop)`.

## Recolor

Selecting an object shows a color chip (and a part dropdown if it has multiple targets).
`recolorTargets` is a list of `{label, mats, input?, kind?}`. The color input handler sets
`m.color` on every material in the active target; `kind:'wall'|'floor'` nulls the texture
map first. Global finishes (walls/floor/rug/curtains) live in the left panel and share the
same target objects. Per-item colors are captured in save/load via `itemColors` /
`applyItemColors`.

## Resize (two input methods, one core)

`resizePoster(o,w,h,d)` is the core. Three branches:
- `box` items rebuild geometry (`o.userData.rebuild`).
- `scaleResize` items set `o.scale` from `pw/ow` etc.
- posters rebuild a `PlaneGeometry`.
It updates hover dims, footprint, reseats the item with `supportHeight` (stacking), and
refreshes the selection box + handles.

Two ways to drive it:
1. The W/H/D number inputs in `#seltool` (`pW`, `pH`, `pD`).
2. The hover-arrow gizmo. `buildHandles()` creates four invisible-but-pickable proxy cubes
   (modes `x`, `z`, `y`, `corner`) plus a hidden double-headed `makeArrow` per proxy.
   `positionHandles()` places them on the object's true local faces/corner and orients each
   arrow with `handleDir`. On hover (`pointermove`), `setArrowHover(mode)` shows exactly the
   hovered arrow and sets the cursor. On drag, `startResize`/`doResize` project the pointer
   onto a plane, measure movement along the handle axis, and call `resizePoster` (face =
   one dimension, corner = proportional scale of all three).

## Stacking

`supportHeight(o)` finds the top surface of a larger item whose footprint contains o's
center and returns that Y, so dropping a small item over a big one stacks it. Rugs/flat
items are ignored; only smaller items stack on larger supports.

## Save / load / autosave

- `serialize()` returns `{v, room, layout, bedTop, colors, items:[...]}` where each item
  records `kind, id, x,y,z, ry, pw,ph,pd, wall, img, colors`.
- `loadState(s)` rebuilds from scratch: sets ROOM + BED_TOP + finishes, `clearItems()`,
  then `build(kind)` for each saved item and reapplies size, position, colors, and poster
  image. Re-running is idempotent.
- `autosave()` writes `serialize()` to `localStorage[LS_KEY]` and is called from
  `pushHistory`, color changes, and poster upload. Boot restores it if present.
- Save layout downloads the JSON; Load layout uploads a JSON (this is how one student loads
  another student's layout).

## Landing / room registry

`SCHOOLS` is the nested catalog (school -> buildings -> rooms, each room carries `room`
dims + a `layout`). `initLanding()` wires the cascading dropdowns and the Enter button.
`applyRoomSelection(u,b,r,cfg)` updates the breadcrumb and, if the room actually changed,
rebuilds the room; if it is the same room it preserves the current arrangement.
`CURRENT_ROOM_KEY` starts at `cmu/etower/trad_double` so the app boots straight into that
room and the first Enter does not wipe a restored layout.
