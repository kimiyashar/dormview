# REFERENCE.md - source measurements and materials

This captures the real-world source data the E-Tower Traditional Double room was built from,
so future accuracy work is grounded. The original photos and floor-plan PDF are NOT in the
repo (they were chat uploads and were not retained). If you want to refine geometry, re-add
them to a `reference/` folder.

## The room: Morewood Gardens (E-Tower) Traditional Double, CMU

Matterport 3D tour (source of truth for the space):
https://www.tours.vividmediany.com/3d-model/cmu-morewood-etower-traditional-double/fullscreen/

Dimension history (why the numbers are what they are):
- Floor-plan PDF listed roughly 12'7.5" wide by 15'11.5" deep.
- A top-down Matterport measurement read closer to 12'10" by 11'5".
- Will measured usable floor and chose depth 13'10". The PDF depth includes the window bay,
  which is why it looked deeper.
- Final values used in code: `ROOM = { w:151.5, d:166, h:96 }` inches, i.e. 12'7.5" wide,
  13'10" deep, 8' tall.

Room features: door on the near wall, a real window on the far/window wall (sill about 28"
up), two closets modeled as flush doors with no volume (built-ins), a radiator, no A/C
(that is why a fan is called out in the inventory).

## Beds

- Twin XL, 39" x 80".
- Standard mattress top height 20". Raised/lofted mattress top 36" (open storage under).
- CMU is phasing out full lofts, but beds raise on risers.

## Real furniture dimensions Will provided (WxDxH unless noted)

- Storage cart: 14.375 x 17 x 41.5 in.
- Microwave: 18.7 x 13.6 x 10.6 in.
- Mini-fridge: 18.7 x 17.4 x 33.1 in.

These match the inventory builders. If you add real products, keep dimensions accurate so
the "will it fit" value of the tool holds.

## Aesthetic direction Will asked for

- Warm, cozy, "The Sims" feel: wood tones, soft light, plants, posters allowed but not on by
  default.
- UI polish reference he liked: motionsites.ai.
- Defaults on load: white painted walls, blue carpet, no string lights, no posters, no
  clutter, desks against the foot of the bed with chairs pushed in.

## Things to re-add if you want them tracked

- The 3 real room photos and the floor-plan PDF (put in `reference/`).
- Any product links for items in the inventory (for a future "buy this" feature).
