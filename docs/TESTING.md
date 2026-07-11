# TESTING.md - how verification works

## Fast logic harness (use this after every change)

```
cd .test
node scenetest.js
```

Green looks like: the last line reads `RESULT: ALL CHECKS PASSED`. Red looks like
`RESULT: PROBLEMS FOUND (n)` followed by one `- ...` line per problem.

### What it is

`scenetest.js` loads the REAL three.js r128 build, stubs only the GPU renderer
(`THREE.WebGLRenderer`) and a minimal DOM/canvas/window, then extracts the page's inline
`<script>` and runs it inside a Node VM. Right before the app's IIFE closes it injects a
hook `globalThis.__T = {...}` exposing internal functions and state (scene, items, layouts,
camera, build, resizePoster, serialize, loadState, select, SCHOOLS, setArrowHover, etc.).
Because it runs the real code against real geometry/math, it catches syntax errors, runtime
errors, and geometric regressions without a browser.

### What it checks

- App boots with no syntax/runtime error and builds a scene.
- Every item has hover dimensions and sits within room bounds.
- All four layouts: items in bounds, no 3D overlaps (chairs excluded since they tuck under
  desks), nothing intruding into the door/closet zones.
- Every inventory builder in `RAW` constructs without throwing and has hover dims.
- Camera framing: room corners project inside the frustum for `corner`/`top`, roughly
  centered, camera above the floor. Also a parameter sweep that prints the best corner view.
- Undo/redo counts (place -> +1, undo -> back, redo -> +1).
- Resize: microwave scaleResize scales the group and updates footprint; basket box-resize
  changes pw/ph/pd; generic microwave recolor exists and does NOT leak into shared materials
  (clone guard).
- Save/load round trip: item count preserved, a resized item keeps its scale, a shelf
  survives.
- Bed heights: Standard clearly shorter than Raised.
- Desk-at-foot: desk long axis is along the bed-foot direction (42 > depth 24), desk back is
  flush with the bed foot, chair on the door side and tucked into the desk x-range.
- Landing registry: `cmu -> etower -> trad_double` exists; re-entering the same room does
  not wipe the layout.
- Resize handles: 4 proxies on a resizable item, 0 on a wall poster.
- Hover arrows: none visible idle, exactly the width arrow on width hover, exactly the
  corner arrow on corner hover, none after un-hover.

### Adding a check

Append a `try { ... } catch(e){ report.problems.push('... threw: '+e.message); }` block near
the other checks, using `T.<fn>` from the hook. If you need a new internal, add it to the
injected `globalThis.__T = {...}` object literal near the top of `scenetest.js`.

## Visual screenshots (run locally, not in the sandbox)

```
node .test/shots.js
```

Uses Puppeteer to render the page and save `shot_landing.png`, `shot_landing_filled.png`,
`shot_after_enter.png`, `shot_selected.png`. It drives the landing dropdowns
(cmu/etower/trad_double), clicks Enter, and selects an item. It CANNOT run in the Cowork
sandbox because the bundled Chrome is not compatible with this arm64 environment. Run it on
a normal machine (macOS/Linux with Chrome) to eyeball the UI. `render.js` is an older
variant of the same idea.

## Manual smoke test in a browser

1. Open `cmu-etower-double-3d.html`, hard refresh.
2. Landing shows: pick CMU, E-Tower, Traditional Double, Enter.
3. Toggle Standard vs Beds raised (bed height should visibly change).
4. Select a bed/desk; hover a side to see the arrow; drag to resize; drag a corner to scale.
5. Recolor the microwave and a wall.
6. Add a poster, upload an image (try a HEIC from an iPhone).
7. Save layout, reload the page, confirm it restored. Load a saved JSON.
