import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Contact page — three-act animation:
 *   1. headline   →  "Let's create something." fades in, holds, fades out
 *   2. envelope   →  sealed envelope drops in, gently floats, "tap to open"
 *   3. letter     →  flap lifts, letter slides up, email revealed (mailto)
 */
export default function Contact() {
  const navigate = useNavigate();
  const email = 'soumilchadha@gmail.com';

  // 'headline' | 'envelope' | 'opening' | 'letter'
  const [phase, setPhase] = useState('headline');

  // Auto-advance from headline → envelope after the title has had its moment
  useEffect(() => {
    if (phase !== 'headline') return;
    const t = setTimeout(() => setPhase('envelope'), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  const openEnvelope = () => {
    if (phase !== 'envelope') return;
    setPhase('opening');
    // Letter slides up shortly after the flap finishes rotating
    setTimeout(() => setPhase('letter'), 700);
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

      <main className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-6 py-32">
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

        {/* ── Act 2 + 3: Envelope ────────────────────────────────── */}
        <div
          className={`relative flex flex-col items-center justify-center transition-opacity duration-700 ${
            phase === 'headline' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div
            onClick={openEnvelope}
            role="button"
            aria-label="Open envelope"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openEnvelope()}
            className={`envelope ${phase === 'envelope' ? 'envelope-idle' : ''} ${
              phase !== 'envelope' ? 'envelope-opened' : ''
            }`}
          >
            {/* The letter — hidden inside until flap opens, then slides up */}
            <div className={`letter ${phase === 'envelope' ? 'letter-tucked' : ''} ${phase === 'letter' ? 'letter-out' : ''}`}>
              <div className="letter-inner">
                <div className="letter-eyebrow">— An Invitation </div>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="letter-email"
                  onClick={e => e.stopPropagation()}
                >
                  {email}
                </a>
                <div className="letter-foot">Soumil · Delhi</div>
              </div>
            </div>

            {/* Envelope body */}
            <div className="env-back" />
            <div className="env-fold-left" />
            <div className="env-fold-right" />
            <div className="env-fold-bottom" />

            {/* Top flap — rotates open on click */}
            <div className="env-flap">
              <div className="env-seal">S</div>
            </div>
          </div>

          {/* Tap-to-open hint, only visible while sealed */}
          <div
            className={`mt-10 font-label text-[10px] tracking-[0.4em] uppercase text-tertiary transition-opacity duration-500 ${
              phase === 'envelope' ? 'opacity-60' : 'opacity-0'
            }`}
          >
            Tap to open
          </div>

          {/* Footer note — only visible once letter is out */}
          <div
            className={`mt-12 font-label text-[10px] tracking-[0.4em] uppercase text-tertiary transition-opacity duration-700 ${
              phase === 'letter' ? 'opacity-60' : 'opacity-0'
            }`}
          >
            Based in Delhi · Available worldwide
          </div>
        </div>

        {/* Back link — always visible */}
        <button
          onClick={() => navigate('/')}
          className="absolute bottom-10 font-label text-[10px] tracking-[0.4em] uppercase text-on-surface/70 hover:text-primary transition-colors"
        >
          ← Back to Home
        </button>
      </main>

      <style>{`
        /* ── Headline entrance ───────────────────────────── */
        .contact-eyebrow {
          animation: cFadeUp 0.9s 0.1s ease both;
        }
        .contact-line-1 {
          animation: cFadeUp 1.1s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .contact-line-2 {
          animation: cFadeUp 1.1s 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Envelope ─────────────────────────────────────── */
        .envelope {
          position: relative;
          width: clamp(280px, 70vw, 420px);
          height: clamp(180px, 45vw, 270px);
          cursor: pointer;
          perspective: 1200px;
          opacity: 1;
        }
        .envelope-opened {
          cursor: default;
        }

        /* Back panel of the envelope (the body) */
        .env-back {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #d9c9a8 0%, #b89c70 100%);
          border-radius: 4px;
          box-shadow:
            0 18px 40px rgba(0,0,0,0.18),
            inset 0 0 0 1px rgba(0,0,0,0.08);
        }

        /* Diagonal folds — the classic envelope V */
        .env-fold-left, .env-fold-right, .env-fold-bottom {
          position: absolute;
          background: linear-gradient(180deg, #c2a87f 0%, #a98a5b 100%);
          z-index: 3;
        }
        .env-fold-left {
          left: 0; bottom: 0;
          width: 50%; height: 100%;
          clip-path: polygon(0 100%, 100% 50%, 0 0);
          opacity: 0.85;
        }
        .env-fold-right {
          right: 0; bottom: 0;
          width: 50%; height: 100%;
          clip-path: polygon(100% 100%, 0 50%, 100% 0);
          opacity: 0.85;
        }
        .env-fold-bottom {
          left: 0; right: 0; bottom: 0;
          height: 60%;
          clip-path: polygon(0 100%, 50% 0, 100% 100%);
          background: linear-gradient(180deg, #d2b88a 0%, #b29464 100%);
        }

        /* Top flap — rotates upward to open */
        .env-flap {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 60%;
          background: linear-gradient(180deg, #e3d2af 0%, #c5a878 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top center;
          transform: rotateX(0deg);
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 5;
          box-shadow: 0 2px 0 rgba(0,0,0,0.04);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 14%;
        }
        .envelope-opened .env-flap {
          transform: rotateX(-180deg);
          z-index: 1; /* drop behind once open so the letter sits in front */
        }

        /* Wax seal in the middle of the flap */
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
          transition: opacity 0.4s;
        }
        .envelope-opened .env-seal {
          opacity: 0.7;
        }

        /* The letter (sits inside the envelope, slides up when opened) */
        .letter {
          position: absolute;
          left: 6%; right: 6%;
          top: 25%;
          height: 85%;
          background: #fbf6ee;
          border-radius: 3px;
          z-index: 2;
          box-shadow:
            0 1px 0 rgba(0,0,0,0.05),
            0 2px 12px rgba(0,0,0,0.10);
          transform: translateY(0);
          transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
                      top 0.9s cubic-bezier(0.22, 1, 0.36, 1),
                      height 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .letter-tucked {
          /* Closed envelope — letter is fully tucked inside, not visible */
          opacity: 0;
          transform: translateY(40%) scale(0.96);
        }
        .letter-out {
          /* Slide up out of the envelope and grow taller to feel like
             a folded sheet unfurling */
          transform: translateY(-30%);
          top: 18%;
          height: 125%;
          z-index: 4;
          opacity: 1;
        }
        .letter-inner {
          opacity: 0;
          transition: opacity 0.5s 0.4s ease;
          padding: 48px 32px;
          text-align: center;
          width: 100%;
        }
        .letter-out .letter-inner {
          opacity: 1;
        }
        .letter-eyebrow {
          font-family: 'Work Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(28,28,25,0.45);
          margin-bottom: 20px;
        }
        .letter-email {
          display: inline-block;
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 500;
          color: #1c1c19;
          font-size: clamp(18px, 4.5vw, 28px);
          letter-spacing: -0.5px;
          line-height: 1.2;
          white-space: nowrap;     /* keep email on one line — never break the address */
          text-decoration: none;
          padding: 10px 8px;
          border-bottom: 2px solid rgba(28,28,25,0.18);
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
