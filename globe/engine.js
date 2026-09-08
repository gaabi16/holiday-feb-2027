/* The globe engine. A hand-written orthographic projection, no libraries.
   Reads ROUTES from globe/routes.js and LAND from globe/land-data.js, both of
   which must be loaded first.

   Each canvas rotates by dragging with the mouse or a finger, zooms from the
   + / - buttons (the wheel only works after a click on the globe, otherwise it
   would steal the page scroll; pinch works on a phone), and carries the flight
   duration written on every stretch of the route. The projection centres itself
   on the middle of the route.

   Labels hold digits only — the flight duration and the layover — because the
   direction is already readable from the column on the right. Each label finds
   the spot with the least overlap against what is already drawn; without that,
   airports close together (Brussels-Zaventem and Charleroi are 46 km apart,
   Abu Dhabi and Dubai 116 km) end up with their labels on top of each other. */
(function () {
  "use strict";

  /* surface transport (bus/taxi) is still a solid line, with the same glow as
     the flights, but teal — clearly not a flight without being faded out */
  var GROUND = "#3ddbd9";
  var GROUND_GLOW = "rgba(61,219,217,.7)";

  var RAD = Math.PI / 180;

  function decodeLand() {
    if (!LAND) return [];
    var half = LAND_AB.length / 2;
    var idx = {}, i;
    for (i = 0; i < LAND_AB.length; i++) idx[LAND_AB.charAt(i)] = i;
    var p = 0;
    function varint() {
      var v = 0, mul = 1, c;
      for (;;) {
        c = idx[LAND.charAt(p++)];
        if (c >= half) { v += (c - half) * mul; mul *= half; }
        else return v + c * mul;
      }
    }
    function delta() { var z = varint(); return z & 1 ? -(z + 1) / 2 : z / 2; }

    var rings = [], n = varint(), r, len, lon, lat, j;
    for (r = 0; r < n; r++) {
      len = varint();
      var xyz = new Float32Array(len * 3);
      lon = 0; lat = 0;
      for (j = 0; j < len; j++) {
        lon += delta();
        lat += delta();
        toXYZ(lon / 10, lat / 10, xyz, j * 3);
      }
      rings.push(xyz);
    }
    return rings;
  }

  function toXYZ(lon, lat, out, o) {
    var a = lon * RAD, b = lat * RAD, cb = Math.cos(b);
    out[o] = cb * Math.cos(a);
    out[o + 1] = cb * Math.sin(a);
    out[o + 2] = Math.sin(b);
  }

  var LAND_RINGS = decodeLand();

  /* the graticule: meridians and parallels every 20 degrees */
  var GRATICULE = (function () {
    var lines = [], lon, lat, i, n, xyz;
    for (lon = -180; lon < 180; lon += 20) {
      n = 73; xyz = new Float32Array(n * 3);
      for (i = 0; i < n; i++) toXYZ(lon, -90 + i * 2.5, xyz, i * 3);
      lines.push(xyz);
    }
    for (lat = -80; lat <= 80; lat += 20) {
      n = 145; xyz = new Float32Array(n * 3);
      for (i = 0; i < n; i++) toXYZ(-180 + i * 2.5, lat, xyz, i * 3);
      lines.push(xyz);
    }
    return lines;
  })();

  /* sample a great-circle arc between two points */
  function greatCircle(a, b) {
    var A = new Float32Array(3), B = new Float32Array(3);
    toXYZ(a.lon, a.lat, A, 0);
    toXYZ(b.lon, b.lat, B, 0);
    var dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    var omega = Math.acos(dot);
    var steps = Math.max(16, Math.round((omega / RAD) * 1.2));
    var xyz = new Float32Array((steps + 1) * 3), i, t, s1, s2, so = Math.sin(omega);
    for (i = 0; i <= steps; i++) {
      t = i / steps;
      if (so < 1e-6) { s1 = 1 - t; s2 = t; }
      else { s1 = Math.sin((1 - t) * omega) / so; s2 = Math.sin(t * omega) / so; }
      xyz[i * 3] = A[0] * s1 + B[0] * s2;
      xyz[i * 3 + 1] = A[1] * s1 + B[1] * s2;
      xyz[i * 3 + 2] = A[2] * s1 + B[2] * s2;
    }
    return xyz;
  }

  /* ---- a single globe ---- */
  function Globe(el) {
    var route = ROUTES[el.getAttribute("data-route")];
    if (!route) return;

    var canvas = el.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var pts = route.points;

    var lons = pts.map(function (p) { return p.lon; });
    var lats = pts.map(function (p) { return p.lat; });
    var home = {
      lon: (Math.min.apply(null, lons) + Math.max.apply(null, lons)) / 2,
      lat: (Math.min.apply(null, lats) + Math.max.apply(null, lats)) / 2
    };
    var cLon = home.lon, cLat = home.lat, zoom = 1;

    var arcs = [], i;
    for (i = 0; i < pts.length - 1; i++) arcs.push(greatCircle(pts[i], pts[i + 1]));

    /* surface stretches (bus/taxi) are drawn separately from the flights */
    var ground = {};
    (route.ground || []).forEach(function (idx) { ground[idx] = true; });

    var wpXYZ = new Float32Array(pts.length * 3);
    for (i = 0; i < pts.length; i++) toXYZ(pts[i].lon, pts[i].lat, wpXYZ, i * 3);

    /* the duration label sits at the middle of the longest stretch in the span —
       not the middle of the whole route, where it would fall across a layover */
    var spans = (route.spans || []).map(function (s) {
      var best = arcs[s.from], k;
      for (k = s.from + 1; k < s.to; k++) if (arcs[k].length > best.length) best = arcs[k];
      var n = best.length / 3;
      var at = function (j) {
        j = Math.max(0, Math.min(n - 1, j)) * 3;
        return [best[j], best[j + 1], best[j + 2]];
      };
      var m = Math.floor(n / 2);
      return { text: s.text, ground: s.ground, mid: at(m), prev: at(m - 3), next: at(m + 3) };
    });

    var size = 0, dpr = 1, R = 0, cx = 0, cy = 0;
    var sc = 0, cc = 0, sd = 0, cd = 0;
    var vx = 0, vy = 0, vz = 0;

    function setCenter() {
      var a = cLon * RAD, b = cLat * RAD;
      sc = Math.sin(a); cc = Math.cos(a); sd = Math.sin(b); cd = Math.cos(b);
    }

    /* rotate a 3D point and project it to pixels; result lands in vx, vy, vz */
    function project(buf, o) {
      var X = buf[o], Y = buf[o + 1], Z = buf[o + 2];
      var ex = -X * sc + Y * cc;
      var ny = -X * cc * sd - Y * sc * sd + Z * cd;
      vz = X * cc * cd + Y * sc * cd + Z * sd;
      vx = cx + R * ex;
      vy = cy - R * ny;
    }

    /* the point on the horizon, between a visible point and a hidden one */
    function horizon(ax, ay, az, bx, by, bz) {
      var t = az / (az - bz);
      var x = ax + (bx - ax) * t - cx, y = ay + (by - ay) * t - cy;
      var l = Math.sqrt(x * x + y * y) || 1;
      return [cx + (x / l) * R, cy + (y / l) * R];
    }

    function polyline(buf, close) {
      var open = false, px = 0, py = 0, pz = 0, first = true, h;
      for (var o = 0; o < buf.length; o += 3) {
        project(buf, o);
        if (vz > 0) {
          if (!open) {
            if (!first && pz <= 0) { h = horizon(vx, vy, vz, px, py, pz); ctx.moveTo(h[0], h[1]); ctx.lineTo(vx, vy); }
            else ctx.moveTo(vx, vy);
            open = true;
          } else ctx.lineTo(vx, vy);
        } else if (open) {
          h = horizon(px, py, pz, vx, vy, vz);
          ctx.lineTo(h[0], h[1]);
          open = false;
        }
        px = vx; py = vy; pz = vz; first = false;
      }
      if (open && close) ctx.closePath();
    }

    /* for land: hidden points are clamped to the limb of the globe, so that
       the polygon stays closed and draws no chords across the ocean */
    function ringPath(buf) {
      var any = false, x, y, l;
      for (var o = 0; o < buf.length; o += 3) {
        project(buf, o);
        if (vz > 0) any = true;
        else {
          x = vx - cx; y = vy - cy;
          l = Math.sqrt(x * x + y * y);
          if (l < 1e-6) { x = 1; y = 0; l = 1; }
          vx = cx + (x / l) * R; vy = cy + (y / l) * R;
        }
        if (o === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      return any;
    }

    /* labels already placed in the current frame, so they do not collide */
    var placed = [];
    function overlap(box) {
      var total = 0, k, q, w, hh;
      for (k = 0; k < placed.length; k++) {
        q = placed[k];
        w = Math.min(box[2], q[2]) - Math.max(box[0], q[0]);
        hh = Math.min(box[3], q[3]) - Math.max(box[1], q[1]);
        if (w > 0 && hh > 0) total += w * hh;
      }
      return total;
    }

    function pillBox(lines, x, y) {
      var fs = Math.max(10, Math.min(12, size * 0.031));
      ctx.font = "600 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      var w = 0, i;
      for (i = 0; i < lines.length; i++) w = Math.max(w, ctx.measureText(lines[i]).width);
      var lh = fs * 1.35;
      var bw = w + 14, bh = lh * lines.length + 8;
      var bx = Math.max(8, Math.min(size - bw - 8, x - bw / 2));
      var by = Math.max(8, Math.min(size - bh - 8, y - bh / 2));
      return [bx, by, bx + bw, by + bh, fs, lh];
    }

    function pill(lines, x, y, isGround) {
      var b = pillBox(lines, x, y);
      var bx = b[0], by = b[1], bw = b[2] - b[0], bh = b[3] - b[1], fs = b[4], lh = b[5];
      var i;
      ctx.fillStyle = "rgba(7,19,32,.86)";
      ctx.strokeStyle = isGround ? "rgba(61,219,217,.55)" : "rgba(255,176,32,.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isGround ? GROUND : "#ffb020";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + bw / 2, by + 4 + lh * (i + 0.5));
      }
    }

    function draw() {
      if (!size) return;
      setCenter();
      R = size * 0.47 * zoom;
      cx = size / 2; cy = size / 2;
      var clip = Math.min(R, size / 2);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, clip, 0, Math.PI * 2);
      ctx.clip();

      var g = ctx.createRadialGradient(cx - R * 0.26, cy - R * 0.38, R * 0.05, cx, cy, R * 1.75);
      g.addColorStop(0, "#123049");
      g.addColorStop(0.62, "#0b1e30");
      g.addColorStop(1, "#050e18");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(43,77,105,.45)";
      ctx.beginPath();
      for (var i = 0; i < GRATICULE.length; i++) polyline(GRATICULE[i], false);
      ctx.stroke();

      ctx.fillStyle = "#1b3a4f";
      ctx.strokeStyle = "#2f6684";
      ctx.lineWidth = 0.6;
      for (i = 0; i < LAND_RINGS.length; i++) {
        ctx.beginPath();
        if (ringPath(LAND_RINGS[i])) { ctx.fill(); ctx.stroke(); }
      }

      /* the surface stretch (bus/taxi) — solid line, teal, not a flight */
      var hasGround = false;
      for (i = 0; i < arcs.length; i++) if (ground[i]) hasGround = true;
      if (hasGround) {
        ctx.save();
        ctx.shadowColor = GROUND_GLOW;
        ctx.shadowBlur = 9;
        ctx.strokeStyle = GROUND;
        ctx.lineWidth = 2.1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (i = 0; i < arcs.length; i++) if (ground[i]) polyline(arcs[i], false);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.shadowColor = "rgba(255,176,32,.7)";
      ctx.shadowBlur = 9;
      ctx.strokeStyle = "#ffb020";
      ctx.lineWidth = 2.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (i = 0; i < arcs.length; i++) if (!ground[i]) polyline(arcs[i], false);
      ctx.stroke();
      ctx.restore();

      var vg = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R);
      vg.addColorStop(0, "rgba(79,163,209,0)");
      vg.addColorStop(1, "rgba(79,163,209,.5)");
      ctx.fillStyle = vg;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "rgba(61,123,163,.6)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy, clip - 0.5, 0, Math.PI * 2);
      ctx.stroke();

      /* Labels are placed one at a time, each in the first free spot. Without this,
         airports close together — Abu Dhabi and Dubai are 116 km apart — end up
         with their labels on top of each other at globe scale. */
      placed.length = 0;
      var wpPos = [];
      for (i = 0; i < pts.length; i++) {
        project(wpXYZ, i * 3);
        wpPos.push(vz > 0 ? [vx, vy] : null);
      }

      /* airport codes: eight directions around the point, first free one wins */
      var fs = Math.max(11, Math.min(13, size * 0.033));
      ctx.font = "600 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      var codeAt = [];
      for (i = 0; i < pts.length; i++) {
        if (!wpPos[i]) { codeAt.push(null); continue; }
        var x = wpPos[i][0], y = wpPos[i][1];
        /* a closed route passes through the same airport twice — the code
           is written only once */
        var dup = false;
        for (var q = 0; q < i; q++) {
          if (wpPos[q] && pts[q].code === pts[i].code &&
              Math.abs(wpPos[q][0] - x) < 2 && Math.abs(wpPos[q][1] - y) < 2) { dup = true; break; }
        }
        if (dup) { codeAt.push(null); continue; }
        var cw = ctx.measureText(pts[i].code).width;
        var ddx = x - cx, ddy = y - cy, dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        var base = Math.atan2(ddy / dl, ddx / dl);
        var spot = null, spotBox = null, spotCost = Infinity;
        for (var a = 0; a < 8; a++) {
          var ang = base + Math.ceil(a / 2) * (a % 2 ? -1 : 1) * (Math.PI / 4);
          var lx = x + Math.cos(ang) * 13, ly = y + Math.sin(ang) * 13;
          var right = Math.cos(ang) >= -0.01;
          var bx0 = right ? lx : lx - cw;
          var box = [bx0 - 2, ly - fs / 2 - 2, bx0 + cw + 2, ly + fs / 2 + 2];
          var cost = overlap(box);
          if (cost < spotCost) { spot = [lx, ly, right]; spotBox = box; spotCost = cost; }
          if (cost === 0) break;
        }
        placed.push(spotBox);
        codeAt.push(spot);
      }

      /* the duration on each stretch, nudged until it clears what is already placed */
      var offs = [26, 42, 58, 74, 90, 106];
      for (i = 0; i < spans.length; i++) {
        var s = spans[i];
        if (!s.mid) continue;
        project(s.mid, 0);
        if (vz <= 0.06) continue;
        var mx = vx, my = vy;
        project(s.prev, 0); var ax = vx, ay = vy;
        project(s.next, 0); var bx = vx, by = vy;
        var tx = bx - ax, ty = by - ay, tl = Math.sqrt(tx * tx + ty * ty) || 1;
        var nx = -ty / tl, ny = tx / tl;
        var pick = null, pickBox = null, pickCost = Infinity;
        for (var oi = 0; oi < offs.length && pickCost > 0; oi++) {
          for (var sg = 0; sg < 2; sg++) {
            var sx = sg ? -nx : nx, sy = sg ? -ny : ny;
            var px2 = mx + sx * offs[oi], py2 = my + sy * offs[oi];
            var pb = pillBox(s.text, px2, py2);
            var pc = overlap(pb);
            if (pc < pickCost) { pick = [px2, py2]; pickBox = pb; pickCost = pc; }
            if (pc === 0) break;
          }
        }
        placed.push(pickBox);
        pill(s.text, pick[0], pick[1], s.ground);
      }

      /* airports, drawn on top of the labels */
      for (i = 0; i < pts.length; i++) {
        if (!wpPos[i] || !codeAt[i]) continue;
        var px3 = wpPos[i][0], py3 = wpPos[i][1];
        ctx.fillStyle = "rgba(255,176,32,.28)";
        ctx.beginPath(); ctx.arc(px3, py3, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(px3, py3, 3.2, 0, Math.PI * 2); ctx.fill();

        ctx.font = "600 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
        ctx.textAlign = codeAt[i][2] ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(5,14,24,.85)";
        ctx.strokeText(pts[i].code, codeAt[i][0], codeAt[i][1]);
        ctx.fillStyle = "#e3edf5";
        ctx.fillText(pts[i].code, codeAt[i][0], codeAt[i][1]);
      }
    }

    var pending = false;
    function render() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; draw(); });
    }

    function resize() {
      var w = Math.round(el.clientWidth);
      if (!w || w === size) { if (w) render(); return; }
      size = w;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.height = size + "px";
      render();
    }

    /* ---- rotation, zoom ---- */
    var pointers = {}, last = null, pinch = 0;
    /* the wheel only zooms after a click on the globe, otherwise it would block
       page scrolling for anyone whose mouse passes over it */
    var armed = false;

    function setZoom(z) {
      zoom = Math.max(1, Math.min(8, z));
      render();
    }

    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      last = { x: e.clientX, y: e.clientY };
      pinch = 0;
      armed = true;
      el.classList.add("dragging");
    });

    canvas.addEventListener("focus", function () { armed = true; });
    canvas.addEventListener("blur", function () { armed = false; });
    canvas.addEventListener("pointerleave", function () {
      if (!Object.keys(pointers).length && document.activeElement !== canvas) armed = false;
    });

    canvas.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length >= 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        if (pinch) setZoom(zoom * (d / pinch));
        pinch = d;
        last = null;
        return;
      }
      if (!last) { last = { x: e.clientX, y: e.clientY }; return; }
      var k = 1 / (R * RAD);
      cLon -= (e.clientX - last.x) * k;
      cLat += (e.clientY - last.y) * k;
      cLat = Math.max(-90, Math.min(90, cLat));
      if (cLon > 180) cLon -= 360;
      if (cLon < -180) cLon += 360;
      last = { x: e.clientX, y: e.clientY };
      render();
    });

    function endPointer(e) {
      delete pointers[e.pointerId];
      if (!Object.keys(pointers).length) { last = null; pinch = 0; el.classList.remove("dragging"); }
    }
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    canvas.addEventListener("wheel", function (e) {
      if (!armed) return; // let the page scroll
      e.preventDefault();
      setZoom(zoom * Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.03 : 0.0016)));
    }, { passive: false });

    canvas.addEventListener("keydown", function (e) {
      var step = 8, done = true;
      if (e.key === "ArrowLeft") cLon -= step;
      else if (e.key === "ArrowRight") cLon += step;
      else if (e.key === "ArrowUp") cLat = Math.min(90, cLat + step);
      else if (e.key === "ArrowDown") cLat = Math.max(-90, cLat - step);
      else if (e.key === "+" || e.key === "=") setZoom(zoom * 1.35);
      else if (e.key === "-" || e.key === "_") setZoom(zoom / 1.35);
      else if (e.key === "0") { cLon = home.lon; cLat = home.lat; setZoom(1); }
      else done = false;
      if (done) { e.preventDefault(); render(); }
    });

    el.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "in") setZoom(zoom * 1.35);
      else if (act === "out") setZoom(zoom / 1.35);
      else { cLon = home.lon; cLat = home.lat; setZoom(1); }
    });

    if (window.ResizeObserver) new ResizeObserver(resize).observe(el);
    window.addEventListener("resize", resize);
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
  }

  var nodes = document.querySelectorAll(".globe[data-route]");
  for (var n = 0; n < nodes.length; n++) new Globe(nodes[n]);
})();
