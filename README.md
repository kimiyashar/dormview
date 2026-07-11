# DormView

A 3D interactive dorm-room planner in a single HTML file. Pick your school, building, and
room type, then get an accurate to-scale 3D model you can furnish, recolor, resize, and save
before move-in. First room shipped: Carnegie Mellon University, Morewood Gardens (E-Tower),
Traditional Double.

## Run it

Open `cmu-etower-double-3d.html` in any modern browser. It needs internet on first load
(pulls three.js and the HEIC image converter from CDNs). Hard refresh (Cmd+Shift+R) after
edits.

## What you can do

- Land on the University / Building / Room picker, then Enter your room. "Change room" (top
  bar) reopens the picker.
- Layout presets: Standard (beds on the floor), Beds raised (lofted with storage under),
  Bunked, Open middle.
- Hover any object to see its exact size in feet-inches.
- Drag to move, rotate, and delete furniture. Undo/redo like Cmd+Z.
- Add items from the Inventory (right side): fridge, microwave, cart, shelves, drawers,
  baskets, clip-on bedside shelf, posters, lamps, and more. Drag or click to place.
- Recolor anything by selecting it and picking a color, including walls, floor, beds, rug,
  curtains, and every item (yes, the microwave).
- Resize two ways: type W/H/D on the toolbar, or hover a side for a stretch arrow (hover a
  corner for proportional scaling) and drag.
- Stack items (microwave on the fridge, baskets on a cart).
- Add a poster and upload your own image, including iPhone HEIC.
- Save layout to a file and Load layout back (this is how you share a layout with a
  roommate). Your work also autosaves in the browser and restores on reload.

## Docs

- `CLAUDE.md` - start here to resume development (context, state, conventions, next steps).
- `docs/ARCHITECTURE.md` - how the code is organized.
- `docs/ROADMAP.md` - the multi-school vision and phases.
- `docs/TESTING.md` - how to run the test harness.
- `docs/DEPLOYMENT.md` - deploy status and how to finish it.

## Test

```
cd .test
node scenetest.js      # logic + geometry checks, expect "ALL CHECKS PASSED"
```

`node .test/shots.js` renders screenshots via Puppeteer (run on a normal machine with
Chrome, not inside the Cowork sandbox).

## Tech

Plain HTML/CSS/JS, three.js r128 (UMD, from cdnjs), heic2any (jsDelivr). No build step, no
framework. Everything is in `cmu-etower-double-3d.html`.
