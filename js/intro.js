// Intro overlay: the quote is drawn on a canvas; on the first click, tap or key
// press it breaks into particles that fly up from left to right and fade out
// (about 2.5 s), then the overlay cross-fades into the app.
// With prefers-reduced-motion it is a plain cross-fade.

const QUOTE = ['The storm is coming.', 'The tower is waiting.', 'Begin.'];
const PALETTE = ['#000000', '#ff7a1a', '#ffc04d'];
const MAX_PARTICLES = 6000;
const MAX_PARTICLES_SMALL = 3500;
const SWEEP = 0.9; // seconds for the left-to-right wave to cross the text
const JITTER = 0.25;
const LIFE = 1.35; // seconds a particle lives once released
const FADE_MS = 600;

/**
 * Shows the intro in `box` and resolves when it has finished and is hidden.
 * Safe to call again later (replay); calls while it is showing are ignored.
 */
export function playIntro(box) {
  if (box.dataset.active === '1') return Promise.resolve();
  box.dataset.active = '1';

  return new Promise((resolve) => {
    const canvas = box.querySelector('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let text = null; // layout of the drawn text
    let running = false;
    let raf = 0;

    function layout() {
      W = box.clientWidth;
      H = box.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fs = Math.round(Math.min(44, Math.max(20, W / 14)));
      const lh = fs * 1.5;
      // Keep the text in the free sky above the scene (wave crest is at 84 % of its height).
      const sceneH = box.querySelector('.intro-scene')?.offsetHeight || Math.min((W * 200) / 680, H * 0.62);
      const free = H - sceneH * 0.84;
      const cy = Math.max(free * 0.5, lh * 1.6);
      text = { fs, lh, y0: cy - ((QUOTE.length - 1) * lh) / 2 };
      drawText();
    }

    function drawText() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${text.fs}px Georgia, "Times New Roman", serif`;
      QUOTE.forEach((line, i) => ctx.fillText(line, W / 2, text.y0 + i * text.lh));
    }

    /** Samples the drawn text into particles (every 2 CSS px, coarser if too many). */
    function sample() {
      const top = Math.max(0, Math.floor((text.y0 - text.lh) * dpr));
      const bottom = Math.min(canvas.height, Math.ceil((text.y0 + QUOTE.length * text.lh) * dpr));
      const h = Math.max(1, bottom - top);
      const w = canvas.width;
      const data = ctx.getImageData(0, top, w, h).data;
      const weak = W < 480 || (navigator.hardwareConcurrency || 8) <= 4;
      const limit = weak ? MAX_PARTICLES_SMALL : MAX_PARTICLES;

      let step = Math.max(2, Math.round(2 * dpr)); // device px
      let hits;
      for (;;) {
        hits = [];
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            if (data[(y * w + x) * 4 + 3] > 140) hits.push(x, y);
          }
        }
        if (hits.length / 2 <= limit) break;
        step += 1;
      }

      let minX = Infinity;
      let maxX = -Infinity;
      for (let i = 0; i < hits.length; i += 2) {
        if (hits[i] < minX) minX = hits[i];
        if (hits[i] > maxX) maxX = hits[i];
      }
      const span = Math.max(1, maxX - minX);
      const particles = [];
      for (let i = 0; i < hits.length; i += 2) {
        particles.push({
          x: hits[i] / dpr,
          y: (hits[i + 1] + top) / dpr,
          delay: ((hits[i] - minX) / span) * SWEEP + Math.random() * JITTER,
          vx: (Math.random() - 0.5) * 60,
          vy: -(30 + Math.random() * 90),
          color: Math.random() < 0.55 ? 0 : Math.random() < 0.5 ? 1 : 2,
        });
      }
      return { particles, size: step / dpr };
    }

    function animate() {
      const { particles, size } = sample();
      const start = performance.now();
      const frame = (now) => {
        const elapsed = (now - start) / 1000;
        ctx.clearRect(0, 0, W, H);
        let alive = false;
        for (const p of particles) {
          const tt = elapsed - p.delay;
          if (tt <= 0) {
            // not released yet: still part of the black text
            alive = true;
            ctx.globalAlpha = 1;
            ctx.fillStyle = PALETTE[0];
            ctx.fillRect(p.x, p.y, size, size);
            continue;
          }
          const alpha = 1 - tt / LIFE;
          if (alpha <= 0) continue;
          alive = true;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = PALETTE[p.color];
          ctx.fillRect(p.x + p.vx * tt + Math.sin(tt * 5 + p.x) * 6 * tt, p.y + p.vy * tt, size, size);
        }
        ctx.globalAlpha = 1;
        if (alive) raf = requestAnimationFrame(frame);
        else leave();
      };
      raf = requestAnimationFrame(frame);
    }

    function leave() {
      box.classList.add('is-leaving');
      setTimeout(finish, FADE_MS + 20);
    }

    function finish() {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
      box.removeEventListener('click', go);
      box.hidden = true;
      box.dataset.active = '0';
      resolve();
    }

    // Further clicks or key presses while it runs do nothing.
    function go() {
      if (running) return;
      running = true;
      if (reduced) leave();
      else animate();
    }

    function onKey(e) {
      if (e.repeat || ['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      go();
    }

    function onResize() {
      if (!running) layout();
    }

    box.hidden = false;
    box.classList.remove('is-leaving');
    layout();
    box.addEventListener('click', go);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    try {
      box.focus({ preventScroll: true });
    } catch {
      /* focus is a nicety only */
    }
  });
}
