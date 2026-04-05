/**
 * Espino Digital — Hero Canvas Gradient
 * Adapted from Sphinx HQ wave gradient (sphinxhq.com)
 * Dark theme: #060810 base with animated cyan / purple / blue pools
 */
(function () {
  'use strict';

  /* ─── tunables ─────────────────────────────────────────── */
  var CFG = {
    rotSpeed:      0.00016,   // how fast the gradient rotates
    moveAmp:       0.16,      // how far the gradient drifts (0–1 of canvas size)
    moveSpeedX:    0.00030,
    moveSpeedY:    0.00046,
    shiftSpeed1:   0.00036,   // color-stop shift frequencies
    shiftSpeed2:   0.00052,
    shiftAmp:      0.09,      // how much color stops move
    waveCount:     3,
    waveOpacity:   0.058,     // base wave opacity
    waveOpacDrop:  0.013,     // each extra layer fades by this
    waveAmpMin:    0.22,      // wave height range (fraction of canvas height)
    waveAmpMax:    0.50,
    waveFreqMin:   0.00065,
    waveFreqMax:   0.00175,
    waveSpeedMin:  0.00011,
    waveSpeedMax:  0.00030,
    waveSegs:      44,        // bezier segments per wave (quality vs perf)
    orbCount:      4,
    orbOpacity:    0.17       // peak orb opacity
  };

  /* ─── brand palette ─────────────────────────────────────── */
  var DARK   = [  6,   8,  16];   // #060810
  var CYAN   = [  0, 255, 204];   // #00ffcc
  var PURPLE = [155, 107, 255];   // #9b6bff
  var BLUE   = [  0, 200, 255];   // #00c8ff

  /* ─── helpers ───────────────────────────────────────────── */
  function lerp(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }
  function rgba(c, a) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ─── main ──────────────────────────────────────────────── */
  function init() {
    var canvases = document.querySelectorAll('canvas.hero-canvas');
    if (!canvases.length) return;

    var instances = [];
    var rafId     = null;
    var lastTime  = 0;

    canvases.forEach(function (canvas) {
      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      var inst = {
        canvas:  canvas,
        ctx:     ctx,
        time:    0,
        waves:   [],
        w: 0, h: 0,
        visible: true,
        ready:   false
      };

      /* wave colour cycles: cyan → purple → blue */
      var WAVE_COLS = [CYAN, PURPLE, BLUE];

      function buildWaves() {
        inst.waves = [];
        for (var i = 0; i < CFG.waveCount; i++) {
          inst.waves.push({
            amp:   CFG.waveAmpMin + Math.random() * (CFG.waveAmpMax - CFG.waveAmpMin),
            freq:  CFG.waveFreqMin + Math.random() * (CFG.waveFreqMax - CFG.waveFreqMin),
            phase: Math.random() * Math.PI * 2,
            speed: CFG.waveSpeedMin + Math.random() * (CFG.waveSpeedMax - CFG.waveSpeedMin),
            yOff:  0.28 + Math.random() * 0.48,
            col:   WAVE_COLS[i % 3]
          });
        }
      }

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr  = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width  = Math.round(rect.width  * dpr);
        canvas.height = Math.round(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        inst.w = rect.width;
        inst.h = rect.height;
        buildWaves();
      }

      inst.resize = resize;

      inst.draw = function () {
        var t = inst.time;
        var w = inst.w, h = inst.h;
        if (!w || !h) return;

        ctx.clearRect(0, 0, w, h);

        /* ── rotating base gradient ── */
        var angle = t * CFG.rotSpeed + Math.PI * 0.25;
        var gLen  = Math.sqrt(w * w + h * h);
        var cx = w * 0.5, cy = h * 0.5;
        var dx = Math.sin(t * CFG.moveSpeedX) * w * CFG.moveAmp;
        var dy = Math.cos(t * CFG.moveSpeedY) * h * CFG.moveAmp;
        var ca = Math.cos(angle), sa = Math.sin(angle), half = gLen * 0.5;

        var grad = ctx.createLinearGradient(
          cx + dx - ca * half, cy + dy - sa * half,
          cx + dx + ca * half, cy + dy + sa * half
        );

        /* dynamic color-stop positions */
        var s1 = Math.sin(t * CFG.shiftSpeed1) * CFG.shiftAmp;
        var s2 = Math.cos(t * CFG.shiftSpeed2) * CFG.shiftAmp;

        /* dark base blended subtly toward brand hues */
        var tCyan   = 0.055 + Math.abs(s1) * 0.040;
        var tPurple = 0.080 + Math.abs(s2) * 0.048;
        var tBlue   = 0.065 + Math.abs(s1) * 0.030;

        grad.addColorStop(0,                    rgba(DARK, 1));
        grad.addColorStop(clamp(0.30 + s1 * 0.09), rgba(lerp(DARK, CYAN,   tCyan),   1));
        grad.addColorStop(clamp(0.55 + s2 * 0.07), rgba(lerp(DARK, PURPLE, tPurple), 1));
        grad.addColorStop(clamp(0.78 + s1 * 0.06), rgba(lerp(DARK, BLUE,   tBlue),   1));
        grad.addColorStop(1,                    rgba(DARK, 1));

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        /* ── wave layers ── */
        for (var wi = 0; wi < inst.waves.length; wi++) {
          var wv    = inst.waves[wi];
          var alpha = CFG.waveOpacity - wi * CFG.waveOpacDrop;
          if (alpha <= 0) continue;

          var baseY = h * wv.yOff;
          var phOff = t * wv.speed + wv.phase;
          var ampH  = h * wv.amp;
          var segs  = CFG.waveSegs;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();

          var px = 0;
          var py = baseY + Math.sin(phOff) * ampH;
          ctx.moveTo(px, py);

          for (var si = 1; si <= segs; si++) {
            var nx   = (si / segs) * w;
            var ny   = baseY + Math.sin(nx * wv.freq + phOff) * ampH;
            var midX = (px + nx) * 0.5;
            ctx.bezierCurveTo(midX, py, midX, ny, nx, ny);
            px = nx; py = ny;
          }

          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();

          var wg = ctx.createLinearGradient(0, 0, 0, h);
          wg.addColorStop(0,   rgba(wv.col, 0));
          wg.addColorStop(0.5, rgba(wv.col, 0.7));
          wg.addColorStop(1,   rgba(wv.col, 0));
          ctx.fillStyle = wg;
          ctx.fill();
          ctx.restore();
        }

        /* ── floating orbs ── */
        var ORB_COLS = [CYAN, PURPLE, BLUE, CYAN];
        for (var oi = 0; oi < CFG.orbCount; oi++) {
          var ox = w * (0.10 + oi * 0.25) + Math.sin(t * 0.00027 + oi * 2.09) * w * 0.09;
          var oy = h * 0.46  + Math.cos(t * 0.00035 + oi * 1.57) * h * 0.26;
          var r  = (52 + oi * 24) + Math.sin(t * 0.00053 + oi) * 16;
          var oc = ORB_COLS[oi];

          var og = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
          og.addColorStop(0,   rgba(oc, CFG.orbOpacity));
          og.addColorStop(0.5, rgba(oc, CFG.orbOpacity * 0.32));
          og.addColorStop(1,   rgba(oc, 0));
          ctx.fillStyle = og;
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      resize();
      instances.push(inst);
    });

    if (!instances.length) return;

    /* ── shared resize ── */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        instances.forEach(function (i) { i.resize(); });
      }, 120);
    });

    /* ── visibility (pause off-screen) ── */
    if (typeof IntersectionObserver !== 'undefined') {
      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var inst = instances.find(function (i) { return i.canvas === e.target; });
          if (inst) inst.visible = e.isIntersecting;
        });
      }, { threshold: 0 });
      instances.forEach(function (i) { vis.observe(i.canvas); });
    }

    /* ── single RAF loop ── */
    function tick(now) {
      var delta = now - lastTime;
      if (delta > 120) delta = 16; // recover after tab switch
      lastTime = now;

      instances.forEach(function (inst) {
        if (!inst.visible) return;
        inst.time += delta;
        inst.draw();

        if (!inst.ready) {
          inst.ready = true;
          /* fade in after first painted frame */
          requestAnimationFrame(function () {
            inst.canvas.classList.add('is-ready');
          });
        }
      });
      rafId = requestAnimationFrame(tick);
    }

    /* draw once immediately so there's no blank frame */
    instances.forEach(function (i) { i.visible = true; i.draw(); });
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  /* kick off after DOM is available */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
