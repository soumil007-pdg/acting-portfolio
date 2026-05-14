import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Contact page — Harry Potter "Owl Post" animation:
 *   1. headline   →  "Let's create something." fades in, holds, fades out
 *   2. swarm      →  ~12 envelopes fly through screen at random angles;
 *                    one breaks formation and settles in the centre
 *   3. envelope   →  the chosen envelope sits sealed, "tap to open" hint
 *   4. burst      →  on tap, envelope explodes into a flock of pages that
 *                    scatter outward; one page remains in the centre
 *   5. letter     →  remaining page shows the email (mailto)
 */
export default function Contact() {
  const navigate = useNavigate();
  const email = 'soumilchadha@gmail.com';

  // 'headline' | 'swarm' | 'envelope' | 'burst' | 'letter'
  const [phase, setPhase] = useState('headline');

  // ── Pre-compute random trajectories so they don't change between renders ──
  const SWARM_COUNT = 12;
  const BURST_COUNT = 10;

  const swarmFlights = useMemo(() => {
    // Each envelope enters from a random off-screen position, flies through,
    // and exits the opposite side. Pure CSS keyframes do the work; we just
    // hand them custom CSS variables.
    const flights = [];
    for (let i = 0; i < SWARM_COUNT; i++) {
      // Pick an "edge" to start from (0=top, 1=right, 2=bottom, 3=left)
      const startEdge = i % 4;
      const startOffset = (Math.random() - 0.5) * 80; // % offset along that edge
      let fromX, fromY, toX, toY;
      if (startEdge === 0) {
        fromX = startOffset; fromY = -120;
        toX = -startOffset;  toY = 120;
      } else if (startEdge === 1) {
        fromX = 120; fromY = startOffset;
        toX = -120;  toY = -startOffset;
      } else if (startEdge === 2) {
        fromX = startOffset; fromY = 120;
        toX = -startOffset;  toY = -120;
      } else {
        fromX = -120; fromY = startOffset;
        toX = 120;    toY = -startOffset;
      }
      flights.push({
        fromX, fromY, toX, toY,
        rotateStart: (Math.random() - 0.5) * 60,
        rotateEnd: (Math.random() - 0.5) * 720,
        scale: 0.35 + Math.random() * 0.35,
        duration: 1.0 + Math.random() * 0.5,   // seconds
        delay: Math.random() * 0.4,
      });
    }
    return flights;
  }, []);

  const burstPages = useMemo(() => {
    // BURST_COUNT pages fly outward in evenly-spaced directions, with jitter
    return Array.from({ length: BURST_COUNT }, (_, i) => {
      const angle = (i / BURST_COUNT) * 360 + (Math.random() - 0.5) * 30;
      const distance = 360 + Math.random() * 220;
      const rad = (angle * Math.PI) / 180;
      return {
        toX: Math.cos(rad) * distance,
        toY: Math.sin(rad) * distance,
        rotate: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.08,
      };
    });
  }, []);

  // Headline → swarm → envelope sequence
  useEffect(() => {
    if (phase === 'headline') {
      const t = setTimeout(() => setPhase('swarm'), 3000);
      return () => clearTimeout(t);
    }
    if (phase === 'swarm') {
      // Total swarm time ≈ longest (delay + duration) ≈ 1.6s,
      // then a brief settle pause before becoming interactive.
      const t = setTimeout(() => setPhase('envelope'), 1700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const openEnvelope = () => {
    if (phase !== 'envelope') return;
    setPhase('burst');
    // Pages fly out for ~0.8s, then the remaining centre page reveals the email.
    setTimeout(() => setPhase('letter'), 850);
  };

  return (
    <>
      <div className="fixed inset-0 parchment-texture pointer-events-none z-0" />
      <div className="fixed inset-0 vignette-bottom-main pointer-events-none z-0" />

      {/* Header */}
      <nav
        className="fixed top-0 w-full flex justify-between items-center px-6 md:px-12 py-6 backdrop-blur-xl"
        style={{
          zIndex: 150,
          background: 'rgba(248,246,246,0.85)',
          borderBottom: '1px solid rgba(28,28,25,0.06)',
        }}
      >
        <div
          onClick={() => navigate('/')}
          className="font-headline text-2xl md:text-3xl font-bold tracking-tighter cursor-pointer text-on-surface"
        >
          REGARDS
        </div>
        <span
          className="material-symbols-outlined text-2xl cursor-pointer text-on-surface"
          onClick={() => { if (window.openMenu) window.openMenu(); }}
        >
          menu
        </span>
      </nav>

      <main className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-6 py-32 overflow-hidden">
        {/* ── Act 1: Headline ─────────────────────────────────────── */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity duration-700 ${
            phase === 'headline' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="font-label text-[10px] tracking-[0.45em] uppercase text-tertiary opacity-60 mb-8 contact-eyebrow">
            A note · An invitation
          </div>
          <h1
            className="font-headline italic text-on-surface text-center leading-[0.95] tracking-tight contact-line-1"
            style={{ fontSize: 'clamp(56px, 12vw, 144px)' }}
          >
            Let&rsquo;s create
          </h1>
          <h1
            className="font-headline italic text-on-surface text-center leading-[0.95] tracking-tight contact-line-2 mt-1"
            style={{ fontSize: 'clamp(56px, 12vw, 144px)' }}
          >
            something.
          </h1>
        </div>

        {/* ── Act 2: Swarm of envelopes ─────────────────────────── */}
        {(phase === 'swarm') && (
          <div className="swarm-stage">
            {swarmFlights.map((f, i) => (
              <div
                key={i}
                className="swarm-envelope"
                style={{
                  '--from-x': `${f.fromX}vw`,
                  '--from-y': `${f.fromY}vh`,
                  '--to-x': `${f.toX}vw`,
                  '--to-y': `${f.toY}vh`,
                  '--rot-start': `${f.rotateStart}deg`,
                  '--rot-end': `${f.rotateEnd}deg`,
                  '--scale': f.scale,
                  '--dur': `${f.duration}s`,
                  '--delay': `${f.delay}s`,
                }}
              >
                <MiniEnvelope />
              </div>
            ))}
          </div>
        )}

        {/* ── Act 3 + 4 + 5: Chosen envelope ──────────────────────── */}
        <div
          className={`relative flex flex-col items-center justify-center transition-opacity duration-700 ${
            phase === 'envelope' || phase === 'burst' || phase === 'letter'
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Burst pages — only rendered during burst phase */}
          {phase === 'burst' && (
            <div className="burst-stage">
              {burstPages.map((p, i) => (
                <div
                  key={i}
                  className="burst-page"
                  style={{
                    '--to-x': `${p.toX}px`,
                    '--to-y': `${p.toY}px`,
                    '--rot': `${p.rotate}deg`,
                    '--delay': `${p.delay}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* The settled envelope — appears in 'envelope' phase, opens on 'burst' */}
          <div
            onClick={openEnvelope}
            role="button"
            aria-label="Open envelope"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openEnvelope()}
            className={`envelope ${phase === 'envelope' ? 'envelope-settled' : ''} ${
              phase === 'burst' ? 'envelope-bursting' : ''
            } ${phase === 'letter' ? 'envelope-gone' : ''}`}
          >
            <div className="env-back" />
            <div className="env-fold-left" />
            <div className="env-fold-right" />
            <div className="env-fold-bottom" />
            <div className="env-flap">
              <div className="env-seal">S</div>
            </div>
          </div>

          {/* The remaining page in the centre — only after burst completes */}
          {phase === 'letter' && (
            <div className="centre-page">
              <div className="centre-page-inner">
                <div className="letter-eyebrow">— A reply</div>
                <a href={`mailto:${email}`} className="letter-email">
                  {email}
                </a>
                <div className="letter-foot">Soumil · Delhi</div>
              </div>
            </div>
          )}

          {/* Tap-to-open hint — only visible while sealed */}
          <div
            className={`mt-10 font-label text-[10px] tracking-[0.4em] uppercase text-tertiary transition-opacity duration-500 ${
              phase === 'envelope' ? 'opacity-60' : 'opacity-0'
            }`}
          >
            Tap to open
          </div>

          <div
            className={`mt-12 font-label text-[10px] tracking-[0.4em] uppercase text-tertiary transition-opacity duration-700 ${
              phase === 'letter' ? 'opacity-60' : 'opacity-0'
            }`}
          >
            Based in Delhi · Available worldwide
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="absolute bottom-10 font-label text-[10px] tracking-[0.4em] uppercase text-on-surface/70 hover:text-primary transition-colors"
        >
          ← Back to Home
        </button>
      </main>

      <style>{`
        /* ── Headline entrance ───────────────────────────── */
        .contact-eyebrow { animation: cFadeUp 0.9s 0.1s ease both; }
        .contact-line-1  { animation: cFadeUp 1.1s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .contact-line-2  { animation: cFadeUp 1.1s 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes cFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Swarm stage: flock of envelopes flying through ─── */
        .swarm-stage {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 20;
        }
        .swarm-envelope {
          position: absolute;
          top: 50%;
          left: 50%;
          width: clamp(120px, 24vw, 180px);
          height: clamp(76px, 16vw, 116px);
          margin-left: calc(clamp(120px, 24vw, 180px) / -2);
          margin-top: calc(clamp(76px, 16vw, 116px) / -2);
          animation: swarmFly var(--dur) cubic-bezier(0.4, 0, 0.6, 1) var(--delay) forwards;
          opacity: 0;
        }
        @keyframes swarmFly {
          0% {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) rotate(var(--rot-start)) scale(var(--scale));
          }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% {
            opacity: 0;
            transform: translate(var(--to-x), var(--to-y)) rotate(var(--rot-end)) scale(var(--scale));
          }
        }

        /* ── The chosen envelope (settled centre) ─────────── */
        .envelope {
          position: relative;
          width: clamp(280px, 70vw, 420px);
          height: clamp(180px, 45vw, 270px);
          cursor: pointer;
          perspective: 1200px;
        }
        .envelope-settled {
          animation: envSettle 0.6s cubic-bezier(0.22, 1, 0.36, 1) both,
                     envFloat 4s 0.6s ease-in-out infinite;
        }
        @keyframes envSettle {
          from { opacity: 0; transform: translateY(-40px) rotate(-12deg) scale(0.7); }
          to   { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
        }
        @keyframes envFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        .envelope-bursting,
        .envelope-gone {
          animation: envVanish 0.5s ease-out forwards;
          cursor: default;
        }
        @keyframes envVanish {
          0%   { opacity: 1; transform: scale(1); }
          40%  { opacity: 0.85; transform: scale(1.15); }
          100% { opacity: 0; transform: scale(0.4); }
        }

        .env-back {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #d9c9a8 0%, #b89c70 100%);
          border-radius: 4px;
          box-shadow:
            0 18px 40px rgba(0,0,0,0.18),
            inset 0 0 0 1px rgba(0,0,0,0.08);
        }
        .env-fold-left, .env-fold-right, .env-fold-bottom {
          position: absolute;
          background: linear-gradient(180deg, #c2a87f 0%, #a98a5b 100%);
          z-index: 3;
        }
        .env-fold-left {
          left: 0; bottom: 0; width: 50%; height: 100%;
          clip-path: polygon(0 100%, 100% 50%, 0 0);
          opacity: 0.85;
        }
        .env-fold-right {
          right: 0; bottom: 0; width: 50%; height: 100%;
          clip-path: polygon(100% 100%, 0 50%, 100% 0);
          opacity: 0.85;
        }
        .env-fold-bottom {
          left: 0; right: 0; bottom: 0; height: 60%;
          clip-path: polygon(0 100%, 50% 0, 100% 100%);
          background: linear-gradient(180deg, #d2b88a 0%, #b29464 100%);
        }
        .env-flap {
          position: absolute;
          top: 0; left: 0; right: 0; height: 60%;
          background: linear-gradient(180deg, #e3d2af 0%, #c5a878 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 14%;
        }
        .env-seal {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #c63b2c 0%, #7a1d12 100%);
          color: #fbe7c7;
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 2px 6px rgba(0,0,0,0.35),
            inset 0 1px 1px rgba(255,255,255,0.25),
            inset 0 -1px 2px rgba(0,0,0,0.25);
          letter-spacing: -1px;
          transform: rotate(-8deg);
        }

        /* ── Mini envelope used in the swarm ───────────────── */
        .mini-env {
          position: relative;
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));
        }
        .mini-env .mini-back {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, #d9c9a8 0%, #b89c70 100%);
          border-radius: 3px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
        }
        .mini-env .mini-flap {
          position: absolute; top: 0; left: 0; right: 0; height: 60%;
          background: linear-gradient(180deg, #e3d2af 0%, #c5a878 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
        }
        .mini-env .mini-fold-l {
          position: absolute; left: 0; bottom: 0; width: 50%; height: 100%;
          background: linear-gradient(180deg, #c2a87f, #a98a5b);
          clip-path: polygon(0 100%, 100% 50%, 0 0);
          opacity: 0.85;
        }
        .mini-env .mini-fold-r {
          position: absolute; right: 0; bottom: 0; width: 50%; height: 100%;
          background: linear-gradient(180deg, #c2a87f, #a98a5b);
          clip-path: polygon(100% 100%, 0 50%, 100% 0);
          opacity: 0.85;
        }

        /* ── Burst pages ─────────────────────────────────── */
        .burst-stage {
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;
          z-index: 6;
          pointer-events: none;
        }
        .burst-page {
          position: absolute;
          top: -38px; left: -28px;
          width: 56px; height: 76px;
          background: linear-gradient(180deg, #fbf6ee 0%, #ede4d3 100%);
          border-radius: 2px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.18);
          animation: burstFly 0.85s cubic-bezier(0.4, 0, 0.7, 1) var(--delay) both;
        }
        /* tiny ruled lines on each page so it reads as a letter */
        .burst-page::before, .burst-page::after {
          content: '';
          position: absolute;
          left: 8px; right: 8px;
          height: 2px;
          background: rgba(28,28,25,0.18);
          border-radius: 1px;
        }
        .burst-page::before { top: 18px; }
        .burst-page::after  { top: 30px; right: 22px; }
        @keyframes burstFly {
          0% {
            opacity: 0;
            transform: translate(0, 0) rotate(0deg) scale(0.4);
          }
          18% {
            opacity: 1;
            transform: translate(calc(var(--to-x) * 0.18), calc(var(--to-y) * 0.18)) rotate(calc(var(--rot) * 0.2)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--to-x), var(--to-y)) rotate(var(--rot)) scale(0.7);
          }
        }

        /* ── Centre page (the one that remains, with the email) ── */
        .centre-page {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 7;
          animation: centreReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .centre-page-inner {
          background: linear-gradient(180deg, #fbf6ee 0%, #efe7d6 100%);
          width: clamp(280px, 70vw, 420px);
          padding: 36px 18px 30px;
          border-radius: 3px;
          box-shadow:
            0 1px 0 rgba(0,0,0,0.05),
            0 18px 40px rgba(0,0,0,0.16);
          text-align: center;
        }
        @keyframes centreReveal {
          from { opacity: 0; transform: translateY(20px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .letter-eyebrow {
          font-family: 'Work Sans', sans-serif;
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(28,28,25,0.45);
          margin-bottom: 14px;
        }
        .letter-email {
          display: inline-block;
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 500;
          color: #1c1c19;
          font-size: clamp(13px, 4vw, 22px);
          letter-spacing: -0.5px;
          line-height: 1.1;
          white-space: nowrap;
          text-decoration: none;
          padding: 6px 4px;
          border-bottom: 1px solid rgba(28,28,25,0.18);
          transition: color 0.4s, border-color 0.4s;
        }
        .letter-email:hover {
          color: #a12d22;
          border-bottom-color: rgba(161,45,34,0.6);
        }
        .letter-foot {
          margin-top: 18px;
          font-family: 'Work Sans', sans-serif;
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(28,28,25,0.4);
        }
      `}</style>
    </>
  );
}

/** Tiny envelope used inside each swarm flier */
function MiniEnvelope() {
  return (
    <div className="mini-env">
      <div className="mini-back" />
      <div className="mini-fold-l" />
      <div className="mini-fold-r" />
      <div className="mini-flap" />
    </div>
  );
}
