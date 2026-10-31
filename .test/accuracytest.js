#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'cmu-etower-double-3d.html'), 'utf8');
const marker = 'var SCHOOLS = ';
const start = html.indexOf(marker);
assert(start >= 0, 'SCHOOLS registry exists');
const objectStart = html.indexOf('{', start + marker.length);
let depth = 0;
let quote = null;
let escaped = false;
let objectEnd = -1;
for (let i = objectStart; i < html.length; i++) {
  const ch = html[i];
  if (quote) {
    if (escaped) escaped = false;
    else if (ch === '\\') escaped = true;
    else if (ch === quote) quote = null;
    continue;
  }
  if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
  if (ch === '{') depth++;
  else if (ch === '}' && --depth === 0) { objectEnd = i + 1; break; }
}
assert(objectEnd > objectStart, 'SCHOOLS registry object closes');
const sandbox = { Math };
vm.runInNewContext('SCHOOLS=' + html.slice(objectStart, objectEnd), sandbox);
const rooms = sandbox.SCHOOLS.cmu.buildings;

function count(room, kind) {
  return (room.furniture || []).filter(item => item.k === kind).length;
}
function windows(room) {
  return (room.shape && room.shape.windows) || room.windows || [0];
}
function hasSideWindow(room) {
  return windows(room).some(win => typeof win === 'object' && Math.abs(Math.abs(win.ry || 0) - Math.PI / 2) < 0.01);
}
function check(name, fn) {
  try { fn(); console.log('PASS:', name); }
  catch (error) { console.error('FAIL:', name, '-', error.message); process.exitCode = 1; }
}

check('Mudge Traditional Double has two windows', () => assert.equal(windows(rooms.mudge.rooms.trad_double).length, 2));
check('Mudge Traditional Triple has three windows including a side wall', () => {
  const room = rooms.mudge.rooms.trad_triple;
  assert.equal(windows(room).length, 3);
  assert(hasSideWindow(room));
});
check('Mudge Semi-Suite Single has two windows', () => assert.equal(windows(rooms.mudge.rooms.ss_single).length, 2));
check('Mudge Semi-Suite Double width is the official 150.75 inches', () => assert.equal(rooms.mudge.rooms.ss_double.room.w, 150.75));
check('Mudge Quad has four desks and four chairs', () => {
  const room = rooms.mudge.rooms.ss_quad;
  assert.equal(count(room, 'desk'), 4);
  assert.equal(count(room, 'chair'), 4);
});
check('Donner Double has two storage units', () => assert.equal(count(rooms.donner.rooms.trad_double, 'closet'), 2));
check('Donner Triple has windows on two adjacent walls and a column', () => {
  const room = rooms.donner.rooms.trad_triple;
  assert(hasSideWindow(room));
  assert((room.features || []).some(feature => feature.kind === 'column'));
});
check('Stever Double has two wardrobes', () => assert.equal(count(rooms.stever.rooms.trad_double, 'closet'), 2));
check('Morewood uses HVAC rather than radiators', () => {
  Object.values(rooms.morewood.rooms).forEach(room => assert.equal(room.mechanical, 'hvac'));
});
check('Every room has a source-driven finish profile', () => {
  Object.values(rooms).forEach(building => Object.values(building.rooms).forEach(room => {
    assert(room.finish, room.name + ' lacks finish profile');
    assert(room.finish.floor, room.name + ' lacks floor finish');
    assert(room.finish.covering, room.name + ' lacks window covering');
  }));
});
check('Accurate Campus Twin has a fallback finish for future rooms', () => {
  assert(html.includes('var CAMPUS_DEFAULT_FINISH = {'));
  assert(html.includes('function resolveFinish(cfg)'));
  assert(html.includes('var f=resolveFinish(cfg);'));
});
check('Wall and floor recoloring preserve material texture maps', () => {
  assert(html.includes('function paintWallTexture('));
  assert(html.includes('function carpetTexture('));
  assert(html.includes('MAT.wall.map=paintWallTex'));
  assert(html.includes('MAT.floor.map=carpetTex'));
  assert(html.includes('MAT.floor.map=woodFloorTex; MAT.floor.color.set(customColor||0xffffff)'));
  assert(html.includes("floorColor:val('c_floor')"));
  assert(!html.includes("if(t.kind==='wall'||t.kind==='floor') m.map=null"));
  assert(!html.includes("if(tg.kind==='wall'||tg.kind==='floor') m.map=null"));
});
check('Explicit furniture recolor targets are localized per item', () => {
  assert(html.includes('function localizeItemMaterials(g)'));
  assert(html.includes('g.userData.recolorTargets=g.userData.recolorTargets.map'));
  assert(html.includes('localizeItemMaterials(g);'));
  assert(!html.includes('if(!g.userData.recolorTargets){'));
});
check('Invalid saved room keys fall back before boot and autosave', () => {
  assert(html.includes("var DEFAULT_ROOM_KEY='cmu/etower/trad_double';"));
  assert(html.includes('function roomConfigForKey(key)'));
  assert(html.includes('var savedRoom=roomConfigForKey(s.roomKey||CURRENT_ROOM_KEY)'));
  assert(html.includes('if(!savedRoom){ CURRENT_ROOM_KEY=DEFAULT_ROOM_KEY;'));
  assert(html.includes('var currentRoom=roomConfigForKey(CURRENT_ROOM_KEY);'));
});
check('Accurate Campus Twin uses neutral daylight and restrained exposure', () => {
  assert(html.includes('renderer.toneMappingExposure = 0.90;'));
  assert(html.includes('new THREE.HemisphereLight(0xf4f7f5, 0x747a72, 0.50)'));
  assert(html.includes('new THREE.DirectionalLight(0xfff4df, 0.92)'));
  assert(!html.includes('renderer.toneMappingExposure = 1.16;'));
});
check('Accuracy profiles are wired into selection and restoration', () => {
  assert(html.includes('function applyRoomProfile('));
  assert(html.includes('ROOM_MECHANICAL=cfg.mechanical'));
  assert(html.includes('ROOM_FEATURES=cfg.features'));
});
check('Renderer supports blinds, HVAC, side windows, and fixed columns', () => {
  assert(html.includes('function makeBlinds('));
  assert(html.includes("ROOM_MECHANICAL==='hvac'"));
  assert(html.includes('wcx.absolute'));
  assert(html.includes("f.kind==='column'"));
});

check('Official-source expansion covers 32 room types across 13 residence halls', () => {
  assert.equal(Object.keys(rooms).length, 13);
  assert.equal(Object.values(rooms).reduce((n, building) => n + Object.keys(building.rooms).length, 0), 32);
});
check('New official shells preserve exact printed dimensions and provenance', () => {
  const expected = {
    'henderson/ss_single':[210.5,143.0625], 'henderson/ss_double':[180,158.5],
    'mcgill/ss_single':[154.75,103.125], 'mcgill/ss_double':[297.875,171],
    'resnik/ss_single':[98,148], 'resnik/ss_double':[142,226],
    'welch/ss_single':[98.625,147.5], 'welch/ss_double':[149,150],
    'westwing/ss_single':[98,148], 'westwing/ss_double':[142,226]
  };
  Object.entries(expected).forEach(([key, dims]) => {
    const [building, roomKey] = key.split('/');
    const room = rooms[building].rooms[roomKey];
    assert.deepEqual([room.room.w, room.room.d], dims, key + ' dimensions');
    assert(room.source.startsWith('https://www.cmu.edu/'), key + ' official source');
    assert(room.dimensionSpan, key + ' dimension-span caveat');
    assert(['official-shell','official-unit-envelope'].includes(room.modelStatus), key + ' model status');
  });
});

if (!process.exitCode) console.log('RESULT: ALL ACCURACY CHECKS PASSED');
