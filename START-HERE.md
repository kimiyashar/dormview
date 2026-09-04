# Start Here

Welcome to DormView. This page is the shortest path to understanding the project and working safely.

## What DormView is

DormView gives students an accurate, to-scale 3D copy of their dorm room before move-in. Students can arrange furniture, test whether products fit, customize finishes, and share layouts with roommates.

Live product: https://dormview.vercel.app

## Five-minute orientation

Read these in order:

1. `README.md` for the product and basic commands.
2. `HANDOVER.md` for the complete vision, current room catalog, data sources, code map, revenue strategy, and scaling plan.
3. `CLAUDE.md` for development rules, current implementation details, and known pitfalls.
4. Open `cmu-etower-double-3d.html` in a browser to use the product.

You do not need to read every file before exploring. Use the map below when you need detail.

## Repository map

- `cmu-etower-double-3d.html`: the entire current application. HTML, CSS, JavaScript, room data, and Three.js rendering all live here.
- `HANDOVER.md`: complete project handover and product strategy.
- `CLAUDE.md`: day-to-day engineering context and non-negotiable conventions.
- `REFERENCE.md`: source measurements and material references.
- `docs/ARCHITECTURE.md`: code and subsystem map.
- `docs/ROADMAP.md`: planned product phases and backlog.
- `docs/TESTING.md`: test instructions and coverage.
- `docs/DEPLOYMENT.md`: production deployment procedure.
- `v1/`: frozen archive of the original release. Do not edit it.

## Run locally

Open `cmu-etower-double-3d.html` directly in Chrome, or serve the repository locally and open:

`http://localhost:8123/cmu-etower-double-3d.html`

Hard refresh with Cmd+Shift+R after edits because the local server may cache the file.

## How room accuracy is checked

Accuracy is the product promise. For each room:

1. Find the building on CMU Housing's Residence Halls page.
2. Open the official PDF for that specific room type. Do not use a whole-building floor plan as the room model.
3. Record printed dimensions, wall outline, door, windows, closets, bathroom, and furniture.
4. Open the official Room Tour and switch to Matterport Floorplan View.
5. Use the scan to confirm arrangement and measure anything the PDF does not specify.
6. Compare the source against consistent DormView screenshots, especially top-down, doorway-facing, and window-facing views.
7. Record whether each fact is measured, from an official PDF, or proportional.
8. Demo corrected rooms locally before any deployment.

Evidence priority:

1. Resident tape measurement
2. Official room-type PDF measurement
3. Matterport ruler measurement
4. Matterport and official photos for arrangement and finishes
5. Proportional tracing when no measurement exists

## Collaboration workflow

- Create a branch for each piece of work.
- Keep research findings in documentation or an audit file so other contributors can use them.
- Avoid having two people edit `cmu-etower-double-3d.html` simultaneously. It is one large file and merge conflicts are difficult.
- Open a pull request for review before merging.
- Run the tests described in `docs/TESTING.md` after code changes.
- Verify user-visible behavior in a real browser.
- Do not deploy without Kimi's explicit approval.

Good parallel work split:

- Contributor A: collect official PDFs and dimensions.
- Contributor B: inspect Matterport scans and official photos.
- Contributor C: audit DormView and document discrepancies.
- One designated implementer: update the application from verified findings.

## Using Hermes Desktop

A Hermes Project named **DormView** is anchored to this repository on Kimi's Mac. New chats created inside that project share the same working folder and automatically receive the repository's `CLAUDE.md` context.

A collaborator on another computer should:

1. Get access to the private GitHub repository.
2. Clone the repository.
3. In Hermes Desktop, create a Project named **DormView** and select the cloned folder.
4. Start all DormView chats inside that project.
5. Ask the first session to read `START-HERE.md` and `HANDOVER.md` before substantial work.

Hermes Projects are local workspaces. The GitHub repository is what shares files and context between different computers.

## Non-negotiable safeguards

- Keep the application single-file and build-free.
- Keep Three.js pinned to r128.
- Never remove the `SAVE_READY` autosave gate.
- Preserve the `dormview_etower_double_v2` localStorage compatibility key.
- Preserve the `/v1` archive.
- Do not guess room geometry. Trace it from sources.
- Do not publish crowdsourced room data without human review.
- Do not deploy unapproved changes.
- Avoid em dashes in project copy and documentation.

## If you are unsure where to begin

Choose one room, collect its official PDF and Matterport tour, and create an evidence-based discrepancy list. Do not change production geometry until the evidence is clear.
