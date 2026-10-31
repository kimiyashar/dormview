// roomcheck.js - geometry validator for the DormView SCHOOLS registry.
//
// The original scenetest.js harness lived outside the repo and is gone, so this is a
// standalone replacement that needs no browser and no three.js. It extracts the
// SCHOOLS registry straight out of the single HTML file, then checks every room the
// way a human would check it against the floor plan: are the dimensions sane, does the
// polygon actually match the stated width and depth, is every piece of furniture
// inside the walls, and does anything overlap anything else.
//
// Run:  node .test/roomcheck.js
// Exits non-zero and prints FAILURES if anything is wrong.

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var HTML = path.join(__dirname, '..', 'cmu-etower-double-3d.html');

// Footprints in inches. Beds are Twin XL. These match the builders in the HTML.
var FOOTPRINT = {
  bed:     { w: 39, d: 80 },
  desk:    { w: 42, d: 24 },
  chair:   { w: 18, d: 18 },
  dresser: { w: 30, d: 18 },
  closet:  { w: 30, d: 24 }
};

var failures = [];
var warnings = [];
var checked = 0;

function fail(where, msg) { failures.push(where + ': ' + msg); }
function warn(where, msg) { warnings.push(where + ': ' + msg); }

// ---- extract the SCHOOLS registry from the HTML -----------------------------------

function extractSchools() {
  var src = fs.readFileSync(HTML, 'utf8');
  var start = src.indexOf('var SCHOOLS = {');
  if (start < 0) throw new Error('could not find "var SCHOOLS = {" in ' + HTML);

  // Walk braces from the first { after the marker so we capture the whole literal
  // regardless of how deeply it nests or how it is formatted.
  var open = src.indexOf('{', start);
  var depth = 0, i = open, inStr = null, inLine = false, inBlock = false;
  for (; i < src.length; i++) {
    var c = src[i], p = src[i - 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '/' && p === '*') inBlock = false; continue; }
    if (inStr) { if (c === inStr && p !== '\\') inStr = null; continue; }
    if (c === '/' && src[i + 1] === '/') { inLine = true; continue; }
    if (c === '/' && src[i + 1] === '*') { inBlock = true; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  var literal = src.slice(open, i);
  var sandbox = { Math: Math, out: null };
  vm.createContext(sandbox);
  vm.runInContext('out = ' + literal + ';', sandbox, { timeout: 5000 });
  return sandbox.out;
}

// ---- geometry helpers --------------------------------------------------------------

// Axis-aligned footprint of an item after rotation. Rooms only ever use quarter turns.
function rotatedFootprint(kind, ry) {
  var f = FOOTPRINT[kind];
  if (!f) return null;
  var quarterTurned = Math.abs(Math.round((ry || 0) / (Math.PI / 2)) % 2) === 1;
  return quarterTurned ? { w: f.d, d: f.w } : { w: f.w, d: f.d };
}

function rectsOverlap(a, b) {
  // Shared edges are fine, real interpenetration is not. 0.5in of slack absorbs
  // rounding in hand-traced coordinates.
  var slack = 0.5;
  return (a.x1 < b.x2 - slack && b.x1 < a.x2 - slack &&
          a.z1 < b.z2 - slack && b.z1 < a.z2 - slack);
}

function pointInPoly(x, z, outline) {
  var inside = false;
  for (var i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    var xi = outline[i][0], zi = outline[i][1];
    var xj = outline[j][0], zj = outline[j][1];
    var hit = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
    if (hit) inside = !inside;
  }
  return inside;
}

// ---- per room checks ---------------------------------------------------------------

function checkRoom(where, cfg) {
  checked++;

  if (!cfg.name) fail(where, 'missing name');
  var r = cfg.room;
  if (!r) { fail(where, 'missing room dimensions'); return; }

  ['w', 'd', 'h'].forEach(function (k) {
    if (typeof r[k] !== 'number' || !isFinite(r[k])) fail(where, 'room.' + k + ' is not a finite number');
  });
  if (r.w <= 0 || r.d <= 0 || r.h <= 0) fail(where, 'room dimensions must be positive');

  // Sanity band: a dorm room narrower than 5ft or wider than 40ft means a unit slip,
  // which is the single most likely tracing error (feet entered instead of inches).
  if (r.w < 60 || r.w > 480) fail(where, 'room.w = ' + r.w + ' in is outside the plausible 60-480 in band');
  if (r.d < 60 || r.d > 480) fail(where, 'room.d = ' + r.d + ' in is outside the plausible 60-480 in band');
  if (r.h < 84 || r.h > 144) warn(where, 'room.h = ' + r.h + ' in is unusual for a dorm');

  var beds = cfg.beds;
  if (typeof beds !== 'number' || beds < 1 || beds > 4) fail(where, 'beds must be 1-4, got ' + beds);

  var halfW = r.w / 2, halfD = r.d / 2;

  // Polygon outline must agree with the stated bounding box, or the walls and the
  // dimension labels will disagree with each other in the app.
  if (cfg.shape && cfg.shape.outline) {
    var o = cfg.shape.outline;
    if (!Array.isArray(o) || o.length < 3) fail(where, 'shape.outline must have at least 3 points');
    else {
      var xs = o.map(function (p) { return p[0]; });
      var zs = o.map(function (p) { return p[1]; });
      var spanW = Math.max.apply(null, xs) - Math.min.apply(null, xs);
      var spanD = Math.max.apply(null, zs) - Math.min.apply(null, zs);
      // Up to 3in of disagreement is a rounding artifact of hand tracing, past that
      // the drawn walls and the printed dimension labels genuinely contradict.
      var wGap = Math.abs(spanW - r.w), dGap = Math.abs(spanD - r.d);
      if (wGap > 3) fail(where, 'shape.outline width span ' + spanW.toFixed(2) + ' does not match room.w ' + r.w);
      else if (wGap > 0.5) warn(where, 'shape.outline width span ' + spanW.toFixed(2) + ' is ' + wGap.toFixed(2) + ' in off room.w ' + r.w);
      if (dGap > 3) fail(where, 'shape.outline depth span ' + spanD.toFixed(2) + ' does not match room.d ' + r.d);
      else if (dGap > 0.5) warn(where, 'shape.outline depth span ' + spanD.toFixed(2) + ' is ' + dGap.toFixed(2) + ' in off room.d ' + r.d);
      var first = o[0], last = o[o.length - 1];
      if (first[0] === last[0] && first[1] === last[1]) fail(where, 'shape.outline repeats its first point, it should be implicitly closed');
    }
  }

  // Door and windows must sit on a wall that exists.
  if (typeof cfg.doorX === 'number' && Math.abs(cfg.doorX) > halfW) {
    fail(where, 'doorX ' + cfg.doorX + ' is outside the room half width ' + halfW.toFixed(2));
  }
  if (Array.isArray(cfg.windows)) {
    cfg.windows.forEach(function (wx, i) {
      var x = (typeof wx === 'number') ? wx : wx && wx.x;
      if (typeof x === 'number' && Math.abs(x) > halfW) {
        fail(where, 'window[' + i + '] x ' + x + ' is outside the room half width ' + halfW.toFixed(2));
      }
    });
  }

  // Furniture: inside the walls, and not stacked on top of each other.
  var furn = cfg.furniture;
  if (!furn) return;
  if (!Array.isArray(furn)) { fail(where, 'furniture must be an array'); return; }

  var bedCount = furn.filter(function (f) { return f.k === 'bed'; }).length;
  var verifiedEmptyShell = furn.length === 0 &&
    (cfg.modelStatus === 'official-shell' || cfg.modelStatus === 'official-unit-envelope');
  if (bedCount !== beds && !verifiedEmptyShell) {
    fail(where, 'declares beds:' + beds + ' but the furniture list has ' + bedCount + ' bed(s)');
  }

  var seenIds = {};
  var rects = [];

  furn.forEach(function (f, idx) {
    var tag = where + ' furniture[' + idx + '] ' + f.k + '/' + f.id;

    if (!FOOTPRINT[f.k]) { fail(tag, 'unknown furniture kind "' + f.k + '"'); return; }
    if (f.id == null) fail(tag, 'missing id');
    else if (seenIds[f.k + ':' + f.id]) fail(tag, 'duplicate id "' + f.id + '" for kind ' + f.k);
    else seenIds[f.k + ':' + f.id] = true;

    if (f.k === 'bed' && f.side !== 'L' && f.side !== 'R') {
      fail(tag, 'bed needs side "L" or "R", got ' + JSON.stringify(f.side));
    }
    if (typeof f.x !== 'number' || typeof f.z !== 'number') { fail(tag, 'x and z must be numbers'); return; }

    var fp = rotatedFootprint(f.k, f.ry);
    var rect = {
      x1: f.x - fp.w / 2, x2: f.x + fp.w / 2,
      z1: f.z - fp.d / 2, z2: f.z + fp.d / 2
    };

    // Inside the bounding rectangle. 1in of tolerance for traced coordinates.
    var tol = 1;
    if (rect.x1 < -halfW - tol || rect.x2 > halfW + tol ||
        rect.z1 < -halfD - tol || rect.z2 > halfD + tol) {
      fail(tag, 'sticks out of the room: spans x[' + rect.x1.toFixed(1) + ',' + rect.x2.toFixed(1) +
                '] z[' + rect.z1.toFixed(1) + ',' + rect.z2.toFixed(1) + '] but the room is x+-' +
                halfW.toFixed(1) + ' z+-' + halfD.toFixed(1));
    }

    // For polygon rooms the centre must also be inside the traced outline, otherwise
    // the item is floating in the corridor or inside the bath block.
    if (cfg.shape && cfg.shape.outline && !pointInPoly(f.x, f.z, cfg.shape.outline)) {
      fail(tag, 'centre (' + f.x + ',' + f.z + ') is outside the traced room outline');
    }

    // Not inside the bath block.
    var bath = (cfg.shape && cfg.shape.bath) || cfg.bath;
    if (bath && f.x > bath.x1 && f.x < bath.x2 && f.z > bath.z1 && f.z < bath.z2) {
      fail(tag, 'centre is inside the bath block');
    }

    rects.push({ tag: tag, rect: rect, item: f });
  });

  // Overlap check. Three things are allowed to share a footprint on purpose:
  // a pre-stacked upper bunk (different y), a chair pushed in under its desk (the
  // house style, see CLAUDE.md), and a desk set against the foot of a bed.
  for (var a = 0; a < rects.length; a++) {
    for (var b = a + 1; b < rects.length; b++) {
      var A = rects[a], B = rects[b];
      var stacked = (A.item.y || 0) !== (B.item.y || 0);
      if (stacked) continue;
      var kinds = [A.item.k, B.item.k].sort().join('+');
      if (kinds === 'chair+desk') continue;
      if (rectsOverlap(A.rect, B.rect)) {
        fail(where, 'overlap between ' + A.item.k + '/' + A.item.id + ' and ' + B.item.k + '/' + B.item.id);
      }
    }
  }
}

// ---- run ---------------------------------------------------------------------------

var SCHOOLS;
try {
  SCHOOLS = extractSchools();
} catch (e) {
  console.error('FATAL: ' + e.message);
  process.exit(2);
}

Object.keys(SCHOOLS).forEach(function (sk) {
  var school = SCHOOLS[sk];
  if (!school.name) fail(sk, 'school missing name');
  Object.keys(school.buildings || {}).forEach(function (bk) {
    var bldg = school.buildings[bk];
    if (!bldg.name) fail(sk + '/' + bk, 'building missing name');
    Object.keys(bldg.rooms || {}).forEach(function (rk) {
      checkRoom(sk + '/' + bk + '/' + rk, bldg.rooms[rk]);
    });
  });
});

console.log('Rooms checked: ' + checked);

// Problems that predate this work are listed, but do not fail the run. Anything not
// on that list is a regression and does fail.
var known = [];
try {
  known = JSON.parse(fs.readFileSync(path.join(__dirname, 'known-issues.json'), 'utf8')).issues || [];
} catch (e) { /* no baseline file, treat every failure as new */ }

var preExisting = failures.filter(function (f) { return known.indexOf(f) !== -1; });
var fresh = failures.filter(function (f) { return known.indexOf(f) === -1; });
var stale = known.filter(function (k) { return failures.indexOf(k) === -1; });

if (warnings.length) {
  console.log('\nWARNINGS (' + warnings.length + '):');
  warnings.forEach(function (w) { console.log('  ! ' + w); });
}

if (preExisting.length) {
  console.log('\nPRE-EXISTING, tracked in .test/known-issues.json (' + preExisting.length + '):');
  preExisting.forEach(function (f) { console.log('  - ' + f); });
}

if (stale.length) {
  console.log('\nFIXED, please remove from .test/known-issues.json (' + stale.length + '):');
  stale.forEach(function (f) { console.log('  + ' + f); });
}

if (fresh.length) {
  console.log('\nFAILURES (' + fresh.length + '):');
  fresh.forEach(function (f) { console.log('  x ' + f); });
  console.log('\nRESULT: FAILED');
  process.exit(1);
}

console.log('\nRESULT: ALL CHECKS PASSED');
