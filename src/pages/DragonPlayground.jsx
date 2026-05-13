import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DragonPlayground() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Dragon constants
    const N = 20;
    const GAP = 48;
    const STEP_MS = 80;
    const MAX_DA = 0.28;
    const IDLE_MS = 2000;
    const BODY_S = 0.52;
    const WING_S = 0.34;
    const FIRE_S = 0.58;
    const HW = [124, 44, 64, 58, 74, 78, 73, 59, 50, 45, 50, 69, 48, 41, 33, 35, 38, 38, 55, 64];
    const BG = '#f4eee0';
    const INK = '#2a1a0a';

    // Sprite cache
    const spriteCache = {};
    const spriteNames = ['head', 'tongue', 'wingFront', 'wingBack', ...Array.from({ length: 19 }, (_, i) => `body${i + 1}`), ...Array.from({ length: 10 }, (_, i) => `fire${i}`)];

    // Load sprites
    spriteNames.forEach(name => {
      const img = new Image();
      let src = '';
      if (name === 'head') src = '/dragon/head.png';
      else if (name === 'tongue') src = '/dragon/tongue.png';
      else if (name === 'wingFront') src = '/dragon/wing-front.png';
      else if (name === 'wingBack') src = '/dragon/wing-back.png';
      else if (name.startsWith('body')) {
        const num = name.replace('body', '');
        src = `/dragon/body-${num}.png`;
      } else if (name.startsWith('fire')) {
        const num = parseInt(name.replace('fire', '')) + 2;
        src = `/fires/Layer ${num}.png`;
      }
      img.src = src;
      spriteCache[name] = img;
    });

    // Math utilities
    const lerp = (a, b, t) => a + (b - a) * t;
    const adiff = (a, b) => ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const snoise = s => Math.sin(s * 9301 + 49297) * 0.5 + 0.5;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // Dragon creation
    function mkDragon(W, H) {
      const hx = W * 0.75, hy = H * 0.70;
      const initAngle = Math.PI / 4;
      return {
        segs: Array.from({ length: N }, (_, i) => ({
          x: hx + Math.cos(initAngle + Math.PI) * i * GAP * 0.80,
          y: hy + Math.sin(initAngle + Math.PI) * i * GAP * 0.80,
          a: initAngle,
        })),
        lastTick: 0,
        lastMove: performance.now(),
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
      dr.jitter = Math.random() * 1000;
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

      const h = segs[0];
      const targetX = mx < 0 ? h.x : mx;
      const targetY = my < 0 ? h.y : my;
      const dx = targetX - h.x, dy = targetY - h.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 4) {
        const spd = Math.min(d, Math.max(14, d * 0.15));
        h.x += (dx / d) * spd;
        h.y += (dy / d) * spd;
        h.a = Math.atan2(dy, dx);
      }

      for (let i = 1; i < N; i++) {
        const p = segs[i - 1], c = segs[i];
        const dx = p.x - c.x, dy = p.y - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 1) continue;
        const targ = Math.atan2(dy, dx);
        const ad = adiff(c.a, targ);
        c.a += clamp(ad, -MAX_DA, MAX_DA);
        c.x = p.x - Math.cos(c.a) * GAP;
        c.y = p.y - Math.sin(c.a) * GAP;
      }
      return true;
    }

    function drawDragon(dr, ctx, now) {
      const { segs } = dr;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Draw wings
      const wingScale = 0.5 + 0.15 * Math.sin(now / 200);
      const headSeg = segs[0];
      ctx.save();
      ctx.translate(headSeg.x, headSeg.y);
      ctx.rotate(headSeg.a);
      ctx.drawImage(spriteCache.wingBack, -spriteCache.wingBack.width * WING_S * wingScale * 0.5, -spriteCache.wingBack.height * WING_S * 0.5, spriteCache.wingBack.width * WING_S * wingScale, spriteCache.wingBack.height * WING_S);
      ctx.restore();

      // Draw body segments
      segs.forEach((s, i) => {
        if (i === 0) return;
        const spr = spriteCache[`body${i}`];
        if (!spr || !spr.complete) return;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.a);
        const w = spr.width * BODY_S;
        const h = spr.height * BODY_S;
        ctx.drawImage(spr, -w * 0.5, -h * 0.5, w, h);
        ctx.restore();
      });

      // Draw head
      const headSpr = spriteCache.head;
      if (headSpr && headSpr.complete) {
        ctx.save();
        ctx.translate(headSeg.x, headSeg.y);
        ctx.rotate(headSeg.a);
        const w = headSpr.width * BODY_S;
        const h = headSpr.height * BODY_S;
        ctx.drawImage(headSpr, -w * 0.5, -h * 0.5, w, h);
        ctx.restore();
      }

      // Draw wings front
      ctx.save();
      ctx.translate(headSeg.x, headSeg.y);
      ctx.rotate(headSeg.a);
      ctx.drawImage(spriteCache.wingFront, -spriteCache.wingFront.width * WING_S * wingScale * 0.5, -spriteCache.wingFront.height * WING_S * 0.5, spriteCache.wingFront.width * WING_S * wingScale, spriteCache.wingFront.height * WING_S);
      ctx.restore();

      // Draw fire
      for (let i = 0; i < 10; i++) {
        const fireSpr = spriteCache[`fire${i}`];
        if (!fireSpr || !fireSpr.complete) continue;
        const firePhase = (now + dr.jitter) % 600;
        const fireScale = lerp(0.8, 1.2, snoise(firePhase / 300 + i * 0.1));
        const fireOpacity = snoise(firePhase / 200 + i * 0.2);
        ctx.save();
        ctx.globalAlpha = fireOpacity * 0.8;
        ctx.translate(headSeg.x - Math.cos(headSeg.a) * 50, headSeg.y - Math.sin(headSeg.a) * 50);
        ctx.rotate(headSeg.a);
        const w = fireSpr.width * FIRE_S * fireScale;
        const h = fireSpr.height * FIRE_S * fireScale;
        ctx.drawImage(fireSpr, -w * 0.5, -h * 0.5, w, h);
        ctx.restore();
      }
    }

    // Initialize
    const dragon = mkDragon(W, H);
    let mx = -1, my = -1;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      dragon.lastMove = performance.now();
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationId;
    const animate = () => {
      const now = performance.now();
      const idle = now - dragon.lastMove > IDLE_MS;
      tickDragon(dragon, mx, my, idle, W * 0.4, H * 0.55, now);
      drawDragon(dragon, ctx, now);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-[#f4eee0]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-[#f4eee0]/90 backdrop-blur-sm border-b border-[#2a1a0a]/10">
        <button
          onClick={() => navigate('/biography')}
          className="font-serif text-xl font-bold text-[#2a1a0a] hover:text-[#D32F2F] transition-colors"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl font-bold text-[#2a1a0a] text-center flex-1">
          Dragon Playground
        </h1>
        <div className="w-16"></div>
      </header>

      {/* Canvas */}
      <main className="flex-1 pt-20 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={typeof window !== 'undefined' ? window.innerWidth : 1280}
          height={typeof window !== 'undefined' ? window.innerHeight - 80 : 720}
          className="cursor-crosshair"
        />
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 w-full py-4 px-8 bg-[#f4eee0]/90 backdrop-blur-sm border-t border-[#2a1a0a]/10 text-center text-sm text-[#2a1a0a]/60">
        Move your mouse to control the dragon • Wait for idle animation
      </footer>
    </div>
  );
}
