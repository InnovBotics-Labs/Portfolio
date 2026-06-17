/* ============================================================
   hero-orbit.js — satellites orbiting the SSD ("planets around Earth")
   Manual 3D: elliptical tilted orbits, depth → scale/opacity/z-index.
   ============================================================ */
(function () {
  "use strict";
  var sys = document.getElementById("orbitSystem");
  if (!sys) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TILT = Math.sin(28 * Math.PI / 180);   // vertical squash of the orbit ellipse
  var sats = Array.prototype.slice.call(sys.querySelectorAll(".sat"));

  sats.forEach(function (el) {
    el._r = parseFloat(el.dataset.r) || 120;
    el._a = (parseFloat(el.dataset.a) || 0) * Math.PI / 180;
    el._s = parseFloat(el.dataset.s) || 0.3;
  });

  function place(el, ang) {
    var x = el._r * Math.cos(ang);
    var f = el._r * Math.sin(ang);          // in-plane forward component
    var y = f * TILT;                        // screen vertical
    var t = (f + el._r) / (2 * el._r);       // 0 (far/back) .. 1 (near/front)
    var scale = 0.72 + t * 0.46;
    var op = 0.5 + t * 0.5;
    el.style.transform =
      "translate(-50%,-50%) translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
    el.style.opacity = op.toFixed(3);
    el.style.zIndex = f >= 0 ? 80 : 20;      // front of / behind the drive
  }

  if (reduce) { sats.forEach(function (el) { place(el, el._a); }); }
  else {
    var last = performance.now();
    (function frame(now) {
      var dt = (now - last) / 1000; last = now;
      if (!document.hidden) {
        for (var i = 0; i < sats.length; i++) {
          sats[i]._a += sats[i]._s * dt;
          place(sats[i], sats[i]._a);
        }
      }
      requestAnimationFrame(frame);
    })(performance.now());
  }

  /* fit the orbit to the room actually available: measure the orbit centre and
     scale so the outermost satellite labels never cross either viewport edge */
  var host = sys.parentElement;            // .hero3d
  var maxR = sats.reduce(function (m, el) { return Math.max(m, el._r); }, 0);
  function fit() {
    var prev = sys.style.getPropertyValue("--scale");
    sys.style.setProperty("--scale", "1");           // measure unscaled
    var box = sys.getBoundingClientRect();
    var cx = box.left + box.width / 2;
    var badgeHalf = sats.reduce(function (m, el) { return Math.max(m, el.offsetWidth); }, 0) / 2;
    var halfExtent = maxR + badgeHalf;               // px from centre at scale 1
    var vw = document.documentElement.clientWidth;
    var margin = 14;
    var room = Math.min(cx - margin, vw - cx - margin);   // nearer edge wins
    var s = room / halfExtent;
    s = Math.max(0.42, Math.min(1.4, s));
    sys.style.setProperty("--scale", s ? s.toFixed(3) : (prev || "1"));
  }
  fit();
  window.addEventListener("resize", fit, { passive: true });
})();
