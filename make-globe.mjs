// Generează datele de coastă folosite de globurile interactive din globe.js.
//
//   npm install world-atlas topojson-client
//   node make-globe.mjs
//
// Scriptul rescrie blocul dintre marcajele LAND-DATA din globe.js. Nu trebuie
// rulat ca să adaugi o destinație nouă — rutele sunt definite tot în globe.js,
// în obiectul ROUTES. Rulează-l doar dacă vrei altă rezoluție a coastelor.

import { feature } from "topojson-client";
import { readFileSync, writeFileSync } from "fs";

// Alfabet de 86 de caractere sigure într-un literal JS cu ghilimele duble.
const AB =
  "!#$%()*+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}";
const HALF = 43; // cifră 0..42 = ultimul caracter, 43+d = continuă

if (AB.length !== 2 * HALF) {
  throw new Error(`alfabet de ${AB.length} caractere, aștept ${2 * HALF}`);
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

// 0,1° ≈ 11 km: sub un pixel la zoom 1, abia vizibil la zoom maxim.
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
    if (qLon === prevLon && qLat === prevLat) continue; // puncte duplicate după cuantizare
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

const js = readFileSync("./globe.js", "utf8");
const from = js.indexOf(START);
const to = js.indexOf(END);
if (from === -1 || to === -1) {
  throw new Error("nu găsesc marcajele LAND-DATA în globe.js");
}

const replacement = `${START}\nvar LAND_AB="${AB}";\nvar LAND="${blob}";\n${END}`;
writeFileSync("./globe.js", js.slice(0, from) + replacement + js.slice(to + END.length));

console.log(
  `${rings.length} contururi, ${points} puncte, ${(blob.length / 1024).toFixed(1)} KB scrise în globe.js`
);
