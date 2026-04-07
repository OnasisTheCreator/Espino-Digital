/* ─── Espino Digital — Shared Interactions ──────────────────────────────── */

(function () {

  /* ── Magnetic Buttons ──────────────────────────────────────────────────
     Lerp-based follow: button smoothly drifts toward cursor at 10% per frame.
     On mouseleave: glides back to origin. No snapping, no hard transitions.
  ──────────────────────────────────────────────────────────────────────── */
  function initMagnetic() {
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(function (btn) {
      var hovered   = false;
      var targetX   = 0, targetY   = 0;
      var currentX  = 0, currentY  = 0;
      var rafId     = null;

      function tick() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        btn.style.transform = 'translate(' + currentX.toFixed(2) + 'px,' + currentY.toFixed(2) + 'px)';

        var done = !hovered
          && Math.abs(currentX - targetX) < 0.05
          && Math.abs(currentY - targetY) < 0.05;

        if (done) {
          btn.style.transform = '';
          rafId = null;
        } else {
          rafId = requestAnimationFrame(tick);
        }
      }

      btn.addEventListener('mouseenter', function () {
        hovered = true;
        if (!rafId) rafId = requestAnimationFrame(tick);
      });

      btn.addEventListener('mousemove', function (e) {
        var r  = btn.getBoundingClientRect();
        targetX = (e.clientX - (r.left + r.width  / 2)) * 0.22;
        targetY = (e.clientY - (r.top  + r.height / 2)) * 0.22;
      });

      btn.addEventListener('mouseleave', function () {
        hovered  = false;
        targetX  = 0;
        targetY  = 0;
        if (!rafId) rafId = requestAnimationFrame(tick);
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagnetic);
  } else {
    initMagnetic();
  }

})();
