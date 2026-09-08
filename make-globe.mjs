// Generates the coastline data used by the interactive globes.
//
//   npm install world-atlas topojson-client
//   node make-globe.mjs
//
// The script rewrites the block between the LAND-DATA markers in
// globe/land-data.js. You do not need to run it to add a destination — routes
// live in globe/routes.js. Run it only if you want a different coastline
// resolution.

import { feature } from "topojson-client";
import { readFileSync, writeFileSync } from "fs";

// An 86-character alphabet, all safe inside a double-quoted JS literal.
const AB =
  "!#$%()*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}";
const HALF = 43; // digit 0..42 = last character, 43+d = keep going

if (AB.length !== 2 * HALF) {
  throw new Error(`alphabet has ${AB.length} characters, expected ${2 * HALF}`);
}

function pushVarint(out, value) {
  let v = value;
  do {
    const d = v % HALF;
    v = Math.floor(v / HALF);
    out.push(AB[v > 0 ? HALF + d : d]);
  } while (v > 0);
}

const zigzag = (n) => (n < 0 ? -2 * n - 1 : 2 * n);

const world = JSON.parse(
  readFileSync("./node_modules/world-atlas/land-110m.json", "utf8")
);
const land = feature(world, world.objects.land);
const geometries = land.features ? land.features.map((f) => f.geometry) : [land.geometry];

const rings = [];
for (const geom of geometries) {
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  for (const poly of polys) for (const ring of poly) rings.push(ring);
}

// 0.1 degrees is about 11 km: under a pixel at zoom 1, barely visible at full zoom.
const Q = 10;
const out = [];
pushVarint(out, rings.length);
let points = 0;

for (const ring of rings) {
  const quantized = [];
  let prevLon = null;
  let prevLat = null;
  for (const [lon, lat] of ring) {
    const qLon = Math.round(lon * Q);
    const qLat = Math.round(lat * Q);
    if (qLon === prevLon && qLat === prevLat) continue; // duplicate points after quantisation
    quantized.push([qLon, qLat]);
    prevLon = qLon;
    prevLat = qLat;
  }
  pushVarint(out, quantized.length);
  let lastLon = 0;
  let lastLat = 0;
  for (const [qLon, qLat] of quantized) {
    pushVarint(out, zigzag(qLon - lastLon));
    pushVarint(out, zigzag(qLat - lastLat));
    lastLon = qLon;
    lastLat = qLat;
  }
  points += quantized.length;
}

const blob = out.join("");
const START = "/*LAND-DATA-START*/";
const END = "/*LAND-DATA-END*/";

const target = "./globe/land-data.js";
const js = readFileSync(target, "utf8");
const from = js.indexOf(START);
const to = js.indexOf(END);
if (from === -1 || to === -1) {
  throw new Error(`cannot find the LAND-DATA markers in ${target}`);
}

const replacement = `${START}\nvar LAND_AB="${AB}";\nvar LAND="${blob}";\n${END}`;
writeFileSync(target, js.slice(0, from) + replacement + js.slice(to + END.length));

console.log(
  `${rings.length} rings, ${points} points, ${(blob.length / 1024).toFixed(1)} KB written to ${target}`
);
