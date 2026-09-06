import * as d3 from "d3-geo";
import { feature } from "topojson-client";
import { readFileSync, writeFileSync } from "fs";

const world = JSON.parse(
  readFileSync("./node_modules/world-atlas/land-110m.json", "utf8")
);
const land = feature(world, world.objects.land);

const SIZE = 420;
const R = 186;

function buildGlobe(waypoints, opts = {}) {
  const lons = waypoints.map((w) => w.lon);
  const lats = waypoints.map((w) => w.lat);
  const cLon = opts.cLon ?? (Math.min(...lons) + Math.max(...lons)) / 2;
  const cLat = opts.cLat ?? (Math.min(...lats) + Math.max(...lats)) / 2;

  const proj = d3
    .geoOrthographic()
    .scale(R)
    .translate([SIZE / 2, SIZE / 2])
    .rotate([-cLon, -cLat]);

  const path = d3.geoPath(proj);
  const landPath = path(land);
  const graticule = path(d3.geoGraticule().step([20, 20])());
  const spherePath = path({ type: "Sphere" });

  // great-circle arcs between consecutive waypoints
  const arcs = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const interp = d3.geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
    const coords = [];
    for (let t = 0; t <= 1.0001; t += 1 / 80) coords.push(interp(Math.min(t, 1)));
    arcs.push(path({ type: "LineString", coordinates: coords }));
  }

  const dots = waypoints
    .map((w) => {
      const p = proj([w.lon, w.lat]);
      if (!p) return "";
      // visibility check on the near side
      const visible = d3.geoDistance([w.lon, w.lat], [cLon, cLat]) < Math.PI / 2;
      if (!visible) return "";
      const dx = w.dx ?? 0;
      const dy = w.dy ?? 0;
      return `<g class="wp">
      <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="7" class="dot-halo"/>
      <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2" class="dot"/>
      <text x="${(p[0] + dx).toFixed(1)}" y="${(p[1] + dy).toFixed(1)}" class="wp-label" text-anchor="${w.anchor || "start"}">${w.code}</text>
    </g>`;
    })
    .join("\n");

  return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" class="globe" role="img" aria-label="Traseul zborului pe glob">
  <style>
    .dot { fill: #ffffff; }
    .dot-halo { fill: #ffb020; opacity: 0.28; }
    .wp-label { fill: #e3edf5; font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; }
  </style>
  <defs>
    <radialGradient id="ocean" cx="38%" cy="32%" r="78%">
      <stop offset="0%" stop-color="#123049"/>
      <stop offset="62%" stop-color="#0b1e30"/>
      <stop offset="100%" stop-color="#050e18"/>
    </radialGradient>
    <radialGradient id="limb" cx="50%" cy="50%" r="50%">
      <stop offset="86%" stop-color="#4fa3d1" stop-opacity="0"/>
      <stop offset="100%" stop-color="#4fa3d1" stop-opacity="0.55"/>
    </radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <path d="${spherePath}" fill="url(#ocean)"/>
  <path d="${graticule}" fill="none" stroke="#2b4d69" stroke-width="0.4" stroke-opacity="0.45"/>
  <path d="${landPath}" fill="#1b3a4f" stroke="#2f6684" stroke-width="0.5"/>
  <g filter="url(#glow)">
    ${arcs.map((a) => `<path d="${a}" fill="none" stroke="#ffb020" stroke-width="2.1" stroke-linecap="round"/>`).join("\n    ")}
  </g>
  ${dots}
  <path d="${spherePath}" fill="url(#limb)"/>
  <path d="${spherePath}" fill="none" stroke="#3d7ba3" stroke-width="0.8" stroke-opacity="0.6"/>
</svg>`;
}

const manila = buildGlobe([
  { lon: 26.085, lat: 44.571, code: "OTP", dx: -10, dy: -9, anchor: "end" },
  { lon: 55.364, lat: 25.253, code: "DXB", dx: -11, dy: -7, anchor: "end" },
  { lon: 103.994, lat: 1.359, code: "SIN", dx: -9, dy: 13, anchor: "end" },
  { lon: 121.02, lat: 14.509, code: "MNL", dx: 10, dy: 2, anchor: "start" },
]);

writeFileSync("./globe-manila.svg", manila);
console.log("ok", manila.length);

const kuwait = buildGlobe([
  { lon: 26.085, lat: 44.571, code: "OTP", dx: -10, dy: -9, anchor: "end" },
  { lon: 55.364, lat: 25.253, code: "DXB", dx: 6, dy: 14, anchor: "start" },
  { lon: 47.979, lat: 29.227, code: "KWI", dx: -10, dy: -7, anchor: "end" },
  { lon: 121.02, lat: 14.509, code: "MNL", dx: 10, dy: 2, anchor: "start" },
]);
writeFileSync("./globe-kuwait.svg", kuwait);
console.log("kuwait ok");
