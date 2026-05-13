import React, { useRef, useEffect } from 'react';
import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext';

// ── Dragon constants ──────────────────────────────────────────────────────────
const N       = 20;
const GAP     = 48;      // px between segment centres
const STEP_MS = 80;
const MAX_DA  = 0.28;
const IDLE_MS = 2000;

// Draw scales
const BODY_S = 0.52;    // head + body (~248px wide head)
const WING_S = 0.34;    // wings
const FIRE_S = 0.58;    // fire composite base scale

// HW: exclusion half-radii per segment = max(sprite_w, sprite_h) × BODY_S × 0.5
// Sprites (w×h): head(477,221) body1(170,130) body2(245,203) body3(165,223)
//   body4(215,285) body5(188,299) body6(193,281) body7(228,224) body8(194,192)
//   body9(142,174) body10(160,191) body11(266,156) body12(183,155) body13(156,122)
//   body14(114,126) body15(136,125) body16(147,107) body17(147,101)
//   body18(210,101) body19(245,81)
const HW = [124, 44, 64, 58, 74, 78, 73, 59, 50, 45, 50, 69, 48, 41, 33, 35, 38, 38, 55, 64];

const BG  = '#f4eee0';
const INK = '#2a1a0a';

// ── Sprite paths ──────────────────────────────────────────────────────────────
const SPRITE_SRCS = {
  head:      '/dragon/head.png',
  tongue:    '/dragon/tongue.png',
  wingFront: '/dragon/wing-front.png',
  wingBack:  '/dragon/wing-back.png',
  ...Object.fromEntries(Array.from({ length: 19 }, (_, i) => [`body${i + 1}`, `/dragon/body-${i + 1}.png`])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`fire${i}`,     `/fires/Layer ${i + 2}.png`])),
};

// ── Math utilities ────────────────────────────────────────────────────────────
const lerp   = (a, b, t) => a + (b - a) * t;
const adiff  = (a, b) => ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
const snoise = s => Math.sin(s * 9301 + 49297) * 0.5 + 0.5;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── Dragon physics ────────────────────────────────────────────────────────────
// Head at lower-right, tail spreading toward upper-left (diagonal pose)
function mkDragon(W, H) {
  const hx = W * 0.75, hy = H * 0.70;  // head lower-right
  const initAngle = Math.PI / 4;         // ~0.785 rad — head faces lower-right, tail goes upper-left
  return {
    segs: Array.from({ length: N }, (_, i) => ({
      x: hx + Math.cos(initAngle + Math.PI) * i * GAP * 0.80,
      y: hy + Math.sin(initAngle + Math.PI) * i * GAP * 0.80,
      a: initAngle,
    })),
    lastTick: 0,
    jitter: 0,
  };
}

function coilTarget(ax, ay) {
  const out = [];
  let px = ax, py = ay;
  for (let i = 0; i < N; i++) {
    const a = -(i / (N - 1)) * (Math.PI / 2) * 1.4;
    out.push({ x: px, y: py, a });
    px -= Math.cos(a) * GAP;
    py -= Math.sin(a) * GAP;
  }
  return out;
}

function tickDragon(dr, mx, my, idle, ax, ay, now) {
  if (now - dr.lastTick < STEP_MS) return false;
  dr.lastTick = now;
  dr.jitter   = Math.random() * 1000;
  const { segs } = dr;

  if (idle) {
    const coil = coilTarget(ax, ay);
    for (let i = 0; i < N; i++) {
      segs[i].x = lerp(segs[i].x, coil[i].x, 0.12);
      segs[i].y = lerp(segs[i].y, coil[i].y, 0.12);
      segs[i].a = lerp(segs[i].a, coil[i].a, 0.12);
    }
    return true;
  }

  // Only chase mouse if it has entered the canvas (mx > 0)
  const h = segs[0];
  const targetX = (mx < 0) ? h.x : mx;
  const targetY = (my < 0) ? h.y : my;
  const dx = targetX - h.x, dy = targetY - h.y;
  const d  = Math.sqrt(dx * dx + dy * dy);
  if (d > 4) {
    const spd = Math.min(d, Math.max(14, d * 0.15));
    h.x += (dx / d) * spd;
    h.y += (dy / d) * spd;
    h.a  = Math.atan2(dy, dx);
  }

  for (let i = 1; i < N; i++) {
    const p = segs[i - 1], s = segs[i];
    const ta    = Math.atan2(p.y - s.y, p.x - s.x);
    const delta = adiff(s.a, ta);
    s.a = p.a + clamp(delta, -MAX_DA, MAX_DA);
    s.x = p.x - Math.cos(s.a) * GAP;
    s.y = p.y - Math.sin(s.a) * GAP;
  }
  return true;
}

// ── Text exclusion ────────────────────────────────────────────────────────────
function getExclusions(segs, lineY, lineH, pad = 14) {
  const cy = lineY + lineH / 2;
  const raw = [];
  for (let i = 0; i < segs.length; i++) {
    const r  = HW[i] + pad;
    const dy = Math.abs(segs[i].y - cy);
    if (dy >= r) continue;
    const hw = Math.sqrt(r * r - dy * dy);
    raw.push([segs[i].x - hw, segs[i].x + hw]);
  }
  raw.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const s of raw) {
    if (merged.length && s[0] <= merged[merged.length - 1][1])
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], s[1]);
    else merged.push([...s]);
  }
  return merged;
}

function bestInterval(full, excl, minW = 38) {
  let intervals = [[full[0], full[1]]];
  for (const [l, r] of excl) {
    const next = [];
    for (const [a, b] of intervals) {
      if (r <= a || l >= b) { next.push([a, b]); continue; }
      if (l > a) next.push([a, l]);
      if (r < b) next.push([r, b]);
    }
    intervals = next;
  }
  intervals = intervals.filter(([a, b]) => b - a >= minW);
  if (!intervals.length) return [full[0], full[1]];
  return intervals.reduce((best, iv) => iv[1] - iv[0] > best[1] - best[0] ? iv : best);
}

// ── Grain ─────────────────────────────────────────────────────────────────────
function buildGrain(w, h) {
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const oc = off.getContext('2d');
  const id = oc.createImageData(w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = Math.random() * 40;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 18;
  }
  oc.putImageData(id, 0, 0);
  return off;
}

// ── Text content ──────────────────────────────────────────────────────────────
const BIO_TEXT =
  'My journey into storytelling began as a search for hope within the pages of books. ' +
  'Reading allowed me to travel to distant lands where the rules of reality were rewritten. ' +
  'With every story, I lived an entirely new life, returning to the real world full of ' +
  'fresh experiences and the strength to restart. Today, my mission as a filmmaker is to ' +
  'reverse that flow. Instead of just seeking that refuge, I craft narratives to provide it. ' +
  'Through the visual stories I tell, I aim to build immersive worlds for my audience ' +
  'offering them the exact same sense of hope, escape, and renewal that first inspired me.';

const QUOTE = '‘Art without science risks chaos, and science without art risks stagnation.’';

// ── Component ─────────────────────────────────────────────────────────────────
export default function ManuscriptCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // ── Load sprites ──────────────────────────────────────────────────────────
    const imgs = {};
    for (const [key, src] of Object.entries(SPRITE_SRCS)) {
      const img = new Image();
      img.src = src;
      imgs[key] = img;
    }

    // ── State ─────────────────────────────────────────────────────────────────
    let W = 0, H = 0;
    let dragon     = null;
    let grain      = null;
    let mx = -999, my = -999;
    let lastMove   = performance.now();   // start in "active" mode — dragon holds pose for 2s
    let dirty      = true;
    let layout     = null;
    let fireEvents = [];
    let rafId, t   = 0;
    let quotePrep  = null, bioPrep = null;

    const QFONT  = 'italic 32px "Newsreader", "Iowan Old Style", Georgia, serif';
    const BFONT  = '17px "Work Sans", sans-serif';
    const LFONT  = '600 10px "Work Sans", sans-serif';
    const Q_LH   = 44;
    const B_LH   = 28;
    const MARGIN = 64;

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      const par = canvas.parentElement;
      W = par.clientWidth;
      H = par.clientHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      grain = buildGrain(W, H);
      if (!dragon) dragon = mkDragon(W, H);
      ctx.font = QFONT; quotePrep = prepareWithSegments(QUOTE, QFONT);
      ctx.font = BFONT; bioPrep   = prepareWithSegments(BIO_TEXT, BFONT);
      dirty = true;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();

    // ── Layout ────────────────────────────────────────────────────────────────
    function computeLayout() {
      if (!dragon) return null;
      const segs = dragon.segs;
      const maxW = W - MARGIN * 2;
      const out  = [];
      let y = MARGIN + 20;

      const layoutBlock = (prepared, font, lineH) => {
        ctx.font = font;
        let cur = { segmentIndex: 0, graphemeIndex: 0 };
        while (true) {
          const excl = getExclusions(segs, y, lineH);
          const [x0, x1] = bestInterval([MARGIN, MARGIN + maxW], excl);
          const avail    = Math.max(38, x1 - x0);
          const range    = layoutNextLineRange(prepared, cur, avail);
          if (!range) break;
          const line = materializeLineRange(prepared, range);
          out.push({ text: line.text, x: x0, y: y + lineH * 0.82, font });
          cur = range.end;
          y  += lineH;
        }
      };

      out.push({ text: '01', x: MARGIN, y: y + 4, font: LFONT, isLabel: true });
      y += 18;
      layoutBlock(quotePrep, QFONT, Q_LH);
      y += 10;
      out.push({ text: '— FROM THE JOURNAL OF SOUMIL', x: MARGIN, y: y + 14, font: LFONT, isLabel: true });
      y += 44;

      out.push({ text: '02', x: MARGIN, y: y + 4, font: LFONT, isLabel: true });
      y += 18;
      layoutBlock(bioPrep, BFONT, B_LH);
      y += 20;

      out.push({ text: '03', x: MARGIN, y: y + 4, font: LFONT, isLabel: true });
      y += 18;
      out.push({ text: 'FOCUS',         x: MARGIN,       y: y + 12, font: LFONT, isLabel: true });
      out.push({ text: 'LOCATION',      x: MARGIN + 180, y: y + 12, font: LFONT, isLabel: true });
      y += 26;
      out.push({ text: 'Actor',         x: MARGIN,       y: y + 14, font: 'italic 20px "Newsreader", Georgia, serif', isMeta: true });
      out.push({ text: 'Delhi / India', x: MARGIN + 180, y: y + 14, font: 'italic 20px "Newsreader", Georgia, serif', isMeta: true });

      return out;
    }

    // ── Sprite helpers ────────────────────────────────────────────────────────
    const rdy = img => img?.complete && img.naturalWidth > 0;

    // ── Dragon drawing ────────────────────────────────────────────────────────
    function drawDragon(time) {
      if (!rdy(imgs.head)) return;
      const { segs, jitter } = dragon;

      // wing-back (behind body)
      if (rdy(imgs.wingBack)) {
        const s  = segs[4];
        const wb = imgs.wingBack;
        const iw = wb.width  * WING_S;
        const ih = wb.height * WING_S;
        const flap = Math.sin(time * 2.8) * 0.30;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.a - Math.PI / 2 + flap);
        ctx.globalAlpha = 0.78;
        ctx.drawImage(wb, -iw * 0.88, -ih * 0.92, iw, ih);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // body segments: tail (19) → neck (1), back-to-front
      for (let i = N - 1; i >= 1; i--) {
        const s   = segs[i];
        const img = imgs[`body${i}`];
        if (!rdy(img)) continue;
        const iw = img.width  * BODY_S;
        const ih = img.height * BODY_S;
        const jx = (snoise(jitter + i * 37) - 0.5) * 1.6;
        const jy = (snoise(jitter + i * 73) - 0.5) * 1.6;
        ctx.save();
        ctx.translate(s.x + jx, s.y + jy);
        ctx.rotate(s.a);
        ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
        ctx.restore();
      }

      // wing-front (in front of body)
      if (rdy(imgs.wingFront)) {
        const s  = segs[4];
        const wf = imgs.wingFront;
        const iw = wf.width  * WING_S;
        const ih = wf.height * WING_S;
        const flap = Math.sin(time * 2.8 + 0.55) * 0.30;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.a - Math.PI / 2 + flap);
        ctx.drawImage(wf, -iw * 0.85, -ih * 0.90, iw, ih);
        ctx.restore();
      }

      // head (on top)
      {
        const s   = segs[0];
        const img = imgs.head;
        const iw  = img.width  * BODY_S;
        const ih  = img.height * BODY_S;
        const jx  = (snoise(jitter) - 0.5) * 1.6;
        const jy  = (snoise(jitter + 37) - 0.5) * 1.6;
        ctx.save();
        ctx.translate(s.x + jx, s.y + jy);
        // head.png snout faces RIGHT → direct rotation matches direction of travel
        ctx.rotate(s.a);
        ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
        ctx.restore();
      }

      // tongue (wags from snout tip)
      if (rdy(imgs.tongue)) {
        const s   = segs[0];
        const img = imgs.tongue;
        const iw  = img.width  * BODY_S;
        const ih  = img.height * BODY_S;
        const hw  = imgs.head.width * BODY_S / 2;
        const wag = Math.sin(time * 6) * 0.18;
        const jx  = (snoise(jitter) - 0.5) * 1.6;
        const jy  = (snoise(jitter + 37) - 0.5) * 1.6;
        ctx.save();
        ctx.translate(s.x + jx, s.y + jy);
        ctx.rotate(s.a + wag);
        ctx.globalAlpha = 0.92;
        ctx.drawImage(img, hw, -ih / 2, iw, ih);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    // ── Fire — composite burst (all 10 layers simultaneously) ─────────────────
    function spawnFire() {
      const h  = dragon.segs[0];
      const hw = (imgs.head?.width ?? 200) * BODY_S / 2;
      fireEvents.push({
        x:      h.x + Math.cos(h.a) * hw,
        y:      h.y + Math.sin(h.a) * hw,
        angle:  h.a,
        age:    0,
        maxAge: 52,
      });
    }

    function updateFire() {
      for (let i = fireEvents.length - 1; i >= 0; i--) {
        fireEvents[i].age++;
        if (fireEvents[i].age >= fireEvents[i].maxAge) fireEvents.splice(i, 1);
      }
    }

    function drawFire() {
      if (!fireEvents.length) return;
      for (const evt of fireEvents) {
        const progress    = evt.age / evt.maxAge;
        const masterAlpha = Math.pow(1 - progress, 0.75);
        const expand      = 1 + progress * 1.2;

        ctx.save();
        ctx.translate(evt.x, evt.y);
        ctx.rotate(evt.angle);

        for (let i = 0; i < 10; i++) {
          const img = imgs[`fire${i}`];
          if (!rdy(img)) continue;
          const sc  = FIRE_S * expand * (0.85 + (i % 3) * 0.2);
          const iw  = img.width  * sc;
          const ih  = img.height * sc;
          const jx  = Math.sin(evt.age * 0.35 + i * 1.9) * 14;
          const jy  = Math.cos(evt.age * 0.28 + i * 2.3) * 10;
          const rot = Math.sin(evt.age * 0.22 + i * 1.1) * 0.18;
          ctx.save();
          ctx.rotate(rot);
          ctx.globalAlpha = masterAlpha * (0.6 + (i % 4) * 0.1);
          ctx.drawImage(img, jx, -ih / 2 + jy, iw, ih);
          ctx.restore();
        }

        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    const render = (now) => {
      t += 0.013;
      // Only go idle once the mouse has actually entered the canvas
      const mouseEntered = mx > 0;
      const idle  = mouseEntered && (now - lastMove > IDLE_MS);
      const ax    = W * 0.40;
      const ay    = H * 0.55;
      const moved = dragon ? tickDragon(dragon, mx, my, idle, ax, ay, now) : false;
      if (moved) dirty = true;
      if (dirty) { layout = computeLayout(); dirty = false; }

      updateFire();

      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Grain
      if (grain) {
        ctx.globalAlpha = 0.55;
        ctx.drawImage(grain, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      // Vignette
      const vT = ctx.createLinearGradient(0, 0, 0, H * 0.12);
      vT.addColorStop(0, 'rgba(210,195,165,0.35)');
      vT.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vT;
      ctx.fillRect(0, 0, W, H * 0.12);
      const vB = ctx.createLinearGradient(0, H * 0.88, 0, H);
      vB.addColorStop(0, 'rgba(0,0,0,0)');
      vB.addColorStop(1, 'rgba(200,185,155,0.35)');
      ctx.fillStyle = vB;
      ctx.fillRect(0, H * 0.88, W, H * 0.12);

      // Text
      ctx.textBaseline = 'alphabetic';
      for (const line of (layout || [])) {
        ctx.font        = line.font;
        ctx.fillStyle   = line.isLabel ? 'rgba(42,26,10,0.45)' : INK;
        ctx.globalAlpha = line.isLabel ? 0.7 : 0.92;
        ctx.fillText(line.text, line.x, line.y);
      }
      ctx.globalAlpha = 1;

      // Dragon
      if (dragon) drawDragon(t);

      // Fire
      drawFire();

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // ── Events ────────────────────────────────────────────────────────────────
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      lastMove = performance.now();
    };
    const onDown = () => { if (dragon) spawnFire(); };
    const onTouch = (e) => {
      const r  = canvas.getBoundingClientRect();
      const tch = e.touches[0];
      mx = tch.clientX - r.left;
      my = tch.clientY - r.top;
      lastMove = performance.now();
    };

    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mousedown',  onDown);
    canvas.addEventListener('touchmove',  onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('mousemove',  onMove);
      canvas.removeEventListener('mousedown',  onDown);
      canvas.removeEventListener('touchmove',  onTouch);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
    />
  );
}
