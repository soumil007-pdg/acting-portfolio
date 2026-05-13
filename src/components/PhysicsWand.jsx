import { useEffect } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const PRIMARY = '#2D5A27';
const PARTICLE_COLORS = [PRIMARY, '#A9DFBF', '#FFFFFF'];
const SETUP_KEY = '__physWandSetup';

function spawnParticle(x, y) {
  const col = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  const p = document.createElement('div');
  p.style.cssText = `
    position:fixed;width:6px;height:6px;border-radius:50%;
    background:${col};left:${x}px;top:${y}px;
    pointer-events:none;z-index:9600;
    box-shadow:0 0 8px ${PRIMARY};
    transition:transform 0.6s ease-out,opacity 0.6s ease-out;
  `;
  document.body.appendChild(p);
  const ang = Math.random() * Math.PI * 2;
  const d = Math.random() * 80 + 20;
  requestAnimationFrame(() => {
    p.style.transform = `translate(${Math.cos(ang) * d}px,${Math.sin(ang) * d}px) scale(0)`;
    p.style.opacity = '0';
  });
  setTimeout(() => p.remove(), 600);
}

export default function PhysicsWand() {
  useEffect(() => {
    // Guard against React Strict Mode double-invoke
    if (window[SETUP_KEY]) return;
    window[SETUP_KEY] = true;

    const cleanups = [];

    const run = async () => {
      const Matter = await import('matter-js');
      const { Engine, Bodies, Composite, Body, Events, Runner } = Matter;

      // ── Engine setup (default gravity, like reference) ───────────────────
      const engine = Engine.create();
      const W = window.innerWidth, H = window.innerHeight;

      const ground = Bodies.rectangle(W / 2, H + 50, W * 2, 100, { isStatic: true, label: 'ground' });
      Composite.add(engine.world, ground);

      const runner = Runner.create();
      Runner.run(runner, engine);

      // ── Full-screen overlay container ─────────────────────────────────────
      const container = document.createElement('div');
      container.id = 'phys-wand-container';
      container.style.cssText =
        'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9000;overflow:visible;';
      document.body.appendChild(container);

      // Wait two frames for layout to settle
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // ── Measurement canvas for accurate character widths ──────────────────
      const measureCanvas = document.createElement('canvas');
      const measureCtx = measureCanvas.getContext('2d');

      const connectedEntities = [];

      // ── Process every [data-physics] element ──────────────────────────────
      document.querySelectorAll('[data-physics]').forEach(el => {
        const elRect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
        const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
        const rawText = el.textContent.trim();
        if (!rawText) return;

        measureCtx.font = font;

        let prepared;
        try {
          prepared = prepareWithSegments(rawText, font);
        } catch {
          return;
        }
        const { lines } = layoutWithLines(prepared, elRect.width, lineH);

        const startX = elRect.left;
        const startY = elRect.top;

        lines.forEach((line, li) => {
          let cx = 0;
          const si = line.start.segmentIndex;
          const ei = line.end.segmentIndex;

          for (let i = si; i < ei; i++) {
            const seg = prepared.segments[i];
            const segW = prepared.widths[i];

            if (!seg || seg.trim() === '') {
              cx += segW;
              continue;
            }

            // Split each word into individual characters
            const chars = seg.split('');
            let charX = cx;

            chars.forEach((char) => {
              const charWidth = measureCtx.measureText(char).width;

              const centerX = startX + charX + charWidth / 2;
              const centerY = startY + li * lineH + lineH / 2;

              // Create char span (positioned via transform from 0,0)
              const span = document.createElement('span');
              span.textContent = char;
              span.style.cssText = `
                position:absolute;
                left:0;top:0;
                width:${charWidth}px;
                height:${lineH}px;
                display:flex;
                align-items:center;
                justify-content:center;
                font:${font};
                color:${cs.color};
                white-space:pre;
                pointer-events:none;
                transition:color 0.3s,text-shadow 0.3s;
              `;
              container.appendChild(span);

              // Create physics body
              const body = Bodies.rectangle(centerX, centerY, charWidth, lineH, {
                label: 'char',
                isStatic: true,
                restitution: 0.7,
                friction: 0.05,
              });
              Composite.add(engine.world, body);

              connectedEntities.push({
                htmlNode: span,
                physicsBody: body,
                width: charWidth,
                height: lineH,
                originX: centerX,
                originY: centerY,
                origColor: cs.color,
                isReturning: false,
                healTimer: null,
                returnTimer: null,
              });

              charX += charWidth;
            });

            cx += segW;
          }
        });

        // Hide original text
        el.style.color = 'transparent';
        el.style.textShadow = 'none';
        el.style.caretColor = 'transparent';
        el.style.webkitTextFillColor = 'transparent';
        cleanups.push(() => {
          el.style.color = '';
          el.style.textShadow = '';
          el.style.caretColor = '';
          el.style.webkitTextFillColor = '';
        });
      });

      // ── afterUpdate: sync ALL entities (matching reference exactly) ───────
      Events.on(engine, 'afterUpdate', () => {
        connectedEntities.forEach(e => {
          const x = e.physicsBody.position.x;
          const y = e.physicsBody.position.y;
          const angle = e.physicsBody.angle;
          e.htmlNode.style.transform =
            `translate(${x - e.width / 2}px, ${y - e.height / 2}px) rotate(${angle}rad)`;
        });
      });

      // ── Wand setup ────────────────────────────────────────────────────────
      const wand = document.createElement('div');
      wand.style.cssText = `
        position:fixed;top:0;left:0;width:4px;height:50px;
        background:linear-gradient(to bottom,#FFFFFF 0%,${PRIMARY} 100%);
        border-radius:4px;z-index:9500;pointer-events:none;
        transform-origin:center center;
        box-shadow:0 0 10px ${PRIMARY},0 0 20px rgba(45,90,39,0.6);
      `;
      document.body.appendChild(wand);

      const glowEl = document.createElement('div');
      glowEl.style.cssText = `
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        pointer-events:none;z-index:8900;
        transition:background 0.1s;
      `;
      document.body.appendChild(glowEl);

      const NUM_TRAIL = 12;
      const trail = Array.from({ length: NUM_TRAIL }, (_, i) => {
        const sc = 1 - i / NUM_TRAIL;
        const seg = document.createElement('div');
        seg.style.cssText = `
          position:fixed;top:0;left:0;width:16px;height:16px;
          background:#FFFFFF;border-radius:50%;
          pointer-events:none;z-index:9490;
          box-shadow:0 0 12px ${PRIMARY},0 0 24px rgba(45,90,39,0.5);
          transform:scale(${sc.toFixed(2)});
          opacity:${(sc * 0.8).toFixed(2)};
        `;
        document.body.appendChild(seg);
        return seg;
      });

      document.body.style.cursor = 'crosshair';

      cleanups.push(() => {
        window[SETUP_KEY] = false;
        container.remove();
        wand.remove();
        glowEl.remove();
        trail.forEach(s => s.remove());
        document.body.style.cursor = '';
        connectedEntities.forEach(e => {
          clearTimeout(e.healTimer);
          clearTimeout(e.returnTimer);
        });
        Runner.stop(runner);
      });

      // ── Mouse tracking ────────────────────────────────────────────────────
      const history = [];
      let prevX = W / 2, prevY = H / 2, wandAngle = 0;

      const onMove = ({ clientX: mx, clientY: my }) => {
        const dx = mx - prevX, dy = my - prevY;

        glowEl.style.background =
          `radial-gradient(circle at ${mx}px ${my}px,rgba(45,90,39,0.12) 0%,transparent 300px)`;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          wandAngle = Math.atan2(dy, dx);
          spawnParticle(mx, my);
        }

        wand.style.transform =
          `translate(${mx - 2}px,${my - 25}px) rotate(${wandAngle + Math.PI / 2}rad)`;

        history.unshift({ x: mx, y: my });
        if (history.length > NUM_TRAIL * 3) history.pop();
        trail.forEach((seg, i) => {
          const pt = history[i * 3];
          if (pt) {
            seg.style.left = `${pt.x - 8}px`;
            seg.style.top = `${pt.y - 8}px`;
          }
        });

        prevX = mx;
        prevY = my;
      };

      // ── Click → bullet fires toward screen center ─────────────────────────
      const onDown = ({ clientX, clientY }) => {
        const bullet = Bodies.circle(clientX, clientY, 30, {
          label: 'bullet',
          restitution: 0.9,
          density: 1.0,
        });
        const dx = W / 2 - clientX;
        const dy = H / 2 - clientY;
        const a = Math.atan2(dy, dx);
        Body.setVelocity(bullet, { x: Math.cos(a) * 40, y: Math.sin(a) * 40 });
        Composite.add(engine.world, bullet);

        for (let i = 0; i < 5; i++) spawnParticle(clientX, clientY);

        // Remove bullet after 2s
        setTimeout(() => Composite.remove(engine.world, bullet), 2000);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mousedown', onDown);
      cleanups.push(() => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mousedown', onDown);
      });

      // ── Collision → scatter + 3s heal (matching reference exactly) ───────
      Events.on(engine, 'collisionStart', ({ pairs }) => {
        pairs.forEach(({ bodyA, bodyB }) => {
          let charBody = null;
          let bulletBody = null;

          if (bodyA.label === 'bullet' && bodyB.label === 'char') {
            bulletBody = bodyA;
            charBody = bodyB;
          } else if (bodyB.label === 'bullet' && bodyA.label === 'char') {
            bulletBody = bodyB;
            charBody = bodyA;
          }

          if (!charBody || !bulletBody) return;

          const entity = connectedEntities.find(e => e.physicsBody === charBody);
          if (!entity) return;

          clearTimeout(entity.healTimer);
          clearTimeout(entity.returnTimer);
          entity.isReturning = false;

          entity.htmlNode.style.transition = 'color 0.3s, text-shadow 0.3s';
          Body.setStatic(charBody, false);

          entity.htmlNode.style.color = PRIMARY;
          entity.htmlNode.style.textShadow = `0 0 10px ${PRIMARY}`;

          for (let i = 0; i < 3; i++) {
            spawnParticle(charBody.position.x, charBody.position.y);
          }

          const dx = charBody.position.x - bulletBody.position.x;
          const dy = charBody.position.y - bulletBody.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const forceMagnitude = 0.003;

          Body.applyForce(charBody, charBody.position, {
            x: (dx / distance) * forceMagnitude,
            y: ((dy / distance) * forceMagnitude) - 0.002,
          });

          // 3-second heal — characters fly back to origin
          entity.healTimer = setTimeout(() => {
            entity.isReturning = true;
            entity.htmlNode.style.transition =
              'transform 1s ease-in-out, color 1s, text-shadow 1s';
            entity.htmlNode.style.color = entity.origColor;
            entity.htmlNode.style.textShadow = '';

            Body.setStatic(charBody, true);
            Body.setPosition(charBody, { x: entity.originX, y: entity.originY });
            Body.setAngle(charBody, 0);
            Body.setVelocity(charBody, { x: 0, y: 0 });

            entity.returnTimer = setTimeout(() => {
              entity.htmlNode.style.transition = 'color 0.3s, text-shadow 0.3s';
              entity.isReturning = false;
            }, 1000);
          }, 3000);
        });
      });
    };

    run();
    return () => cleanups.forEach(fn => fn());
  }, []);

  return null;
}
