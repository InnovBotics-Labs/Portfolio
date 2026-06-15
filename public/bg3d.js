/* ============================================================
   bg3d.js — 3D data-field backdrop
   Full-page clustered point cloud with depth parallax + mesh.
   Exposes window.BG3D = { setEnabled, refreshColor }.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.id = "bg3d";
  canvas.setAttribute("aria-hidden", "true");
  var s = canvas.style;
  s.position = "fixed";
  s.inset = "0";
  s.width = "100%";
  s.height = "100%";
  s.zIndex = "0";              /* above .atmosphere (0) in DOM order, below content (1) */
  s.pointerEvents = "none";
  s.opacity = "0";
  s.transition = "opacity 1.2s ease";
  // append AFTER .atmosphere so it paints on top of the glows/grain, still behind main (z-index:1)
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  /* ---- build clustered point cloud (normalized 0..1 coords) ---- */
  var pts = [];
  function gaussian() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }

  function build() {
    pts = [];
    var COUNT = (W < 680 ? 48 : W < 1100 ? 72 : 96);
    // cluster centres spread across the whole page, incl. middle + edges
    var centres = [
      { x: 0.18, y: 0.22, r: 0.16 },
      { x: 0.78, y: 0.18, r: 0.15 },
      { x: 0.50, y: 0.46, r: 0.20 },   // middle, denser
      { x: 0.50, y: 0.50, r: 0.10 },   // tight core in middle
      { x: 0.22, y: 0.74, r: 0.16 },
      { x: 0.82, y: 0.70, r: 0.17 },
      { x: 0.62, y: 0.88, r: 0.14 }
    ];
    for (var i = 0; i < COUNT; i++) {
      var nx, ny;
      if (i < COUNT * 0.82) {
        // clustered
        var c = centres[(Math.random() * centres.length) | 0];
        nx = c.x + gaussian() * c.r;
        ny = c.y + gaussian() * c.r * 1.1;
      } else {
        // scattered fill so the whole page has texture
        nx = Math.random();
        ny = Math.random();
      }
      pts.push({
        nx: Math.max(-0.05, Math.min(1.05, nx)),
        ny: Math.max(-0.05, Math.min(1.05, ny)),
        z: Math.random() * 2 - 1,          // depth for parallax + size
        r: 0.6 + Math.random() * 1.1,
        vx: (Math.random() * 2 - 1) * 0.00006,
        vy: (Math.random() * 2 - 1) * 0.00006,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  build();

  window.addEventListener("resize", function () { resize(); build(); }, { passive: true });

  /* ---- accent colour (resolve any CSS color space → rgb via canvas) ---- */
  var rgb = [124, 140, 255];
  var _probeCanvas = document.createElement("canvas");
  _probeCanvas.width = _probeCanvas.height = 1;
  var _pc = _probeCanvas.getContext("2d", { willReadFrequently: true });
  function refreshColor() {
    try {
      var probe = document.createElement("span");
      probe.style.cssText = "color:var(--accent);display:none";
      document.body.appendChild(probe);
      var col = getComputedStyle(probe).color;
      document.body.removeChild(probe);
      _pc.clearRect(0, 0, 1, 1);
      _pc.fillStyle = "#000";
      _pc.fillStyle = col;                 // accepts rgb(), oklch(), hsl(), etc.
      _pc.fillRect(0, 0, 1, 1);
      var p = _pc.getImageData(0, 0, 1, 1).data;
      if (p[3] > 0) rgb = [p[0], p[1], p[2]];
    } catch (e) {}
  }
  refreshColor();

  function isLight() { return document.documentElement.getAttribute("data-theme") === "light"; }
  // colour used to draw: accent in light mode, a lightened accent tint in dark for visibility
  function drawRGB(light) {
    if (light) return rgb;
    return [
      Math.round(rgb[0] + (255 - rgb[0]) * 0.55),
      Math.round(rgb[1] + (255 - rgb[1]) * 0.55),
      Math.round(rgb[2] + (255 - rgb[2]) * 0.55)
    ];
  }

  /* ---- pointer parallax ---- */
  var mx = 0, my = 0, px = 0, py = 0, t = 0;
  window.addEventListener("pointermove", function (e) {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  var enabled = true, running = false, hidden = false;

  function pos(p) {
    var depth = 0.55 + (p.z + 1) / 2 * 0.85;          // 0.55 .. 1.4
    var par = (p.z) * 30;                              // depth parallax strength
    var sx = p.nx * W + px * par + Math.sin(t * 0.0006 + p.tw) * 6;
    var sy = p.ny * H + py * par + Math.cos(t * 0.0005 + p.tw) * 6;
    return { sx: sx, sy: sy, depth: depth };
  }

  function render(animate) {
    var light = isLight();
    var col = drawRGB(light);
    ctx.clearRect(0, 0, W, H);

    var proj = new Array(pts.length);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (animate) {
        p.nx += p.vx; p.ny += p.vy;
        if (p.nx < -0.05 || p.nx > 1.05) p.vx *= -1;
        if (p.ny < -0.05 || p.ny > 1.05) p.vy *= -1;
        p.tw += 0.015;
      }
      proj[i] = pos(p);
    }

    // mesh
    var maxD = Math.min(W, H) * 0.16;
    var lineBase = light ? 0.16 : 0.28;
    for (var a = 0; a < proj.length; a++) {
      for (var b = a + 1; b < proj.length; b++) {
        var dx = proj[a].sx - proj[b].sx, dy = proj[a].sy - proj[b].sy;
        var d2 = dx * dx + dy * dy;
        if (d2 < maxD * maxD) {
          var d = Math.sqrt(d2);
          var dep = (proj[a].depth + proj[b].depth) * 0.5;
          var alpha = (1 - d / maxD) * lineBase * dep;
          ctx.strokeStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(proj[a].sx, proj[a].sy);
          ctx.lineTo(proj[b].sx, proj[b].sy);
          ctx.stroke();
        }
      }
    }

    // points
    var dotBase = light ? 0.7 : 1.0;
    for (var k = 0; k < proj.length; k++) {
      var pr = proj[k], pp = pts[k];
      var tw = 0.65 + 0.35 * Math.sin(pp.tw);
      var alpha2 = Math.min(1, pr.depth * dotBase * tw);
      var rad = pp.r * pr.depth * 1.45;
      ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + alpha2.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(pr.sx, pr.sy, rad, 0, 6.2832);
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (hidden) return;
    t = now || 0;
    px += (mx - px) * 0.05;
    py += (my - py) * 0.05;
    render(true);
  }

  function targetOpacity() { return isLight() ? "0.85" : "1"; }

  function start() {
    if (reduce || !enabled) { if (enabled) { render(false); s.opacity = targetOpacity(); } return; }
    if (running) { s.opacity = targetOpacity(); return; }
    running = true;
    s.opacity = targetOpacity();
    requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    s.opacity = "0";
    setTimeout(function () { if (!running) ctx.clearRect(0, 0, W, H); }, 1200);
  }

  document.addEventListener("visibilitychange", function () { hidden = document.hidden; });

  window.BG3D = {
    setEnabled: function (on) { enabled = !!on; if (enabled) start(); else stop(); },
    refreshColor: function () {
      refreshColor();
      if (running) s.opacity = targetOpacity();
      else if (reduce && enabled) { render(false); s.opacity = targetOpacity(); }
    }
  };
})();
