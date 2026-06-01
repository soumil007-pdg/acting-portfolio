import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * REEL OF HONOR
 * ─────────────
 * The page is one continuous filmstrip. Vertical scroll drives horizontal
 * translation, so reading the page feels like watching a reel pass through
 * the projector gate. Sprocket holes stay still (the gate); the film moves
 * past them. Each frame is one film, tinted with its chronology colour
 * (sepia → cobalt = oldest → newest).
 */

const FILMS = [
  {
    title: 'ToesTip',
    era: 'I',
    accent: '#D4943A',                 // warm vintage gold
    bgFrom: '#1A1108',
    bgTo:   '#0A0603',
    awards: [
      { honor: 'Official Selection', venue: 'International Ahmedabad Film Festival' }
    ]
  },
  {
    title: 'Anveshanam',
    era: 'II',
    accent: '#C25E4F',                 // terracotta brightened for dark stock
    bgFrom: '#1B0A07',
    bgTo:   '#0A0302',
    awards: [
      { honor: '2nd Position', venue: 'International Sanskrit Film Festival' }
    ]
  },
  {
    title: 'Extra Time',
    era: 'III',
    accent: '#5CB8A5',                 // muted teal — the era turn
    bgFrom: '#061A16',
    bgTo:   '#030A08',
    awards: [
      { honor: 'Best Actor' },
      { honor: 'Best Screenplay' },
      { honor: 'Best Director' }
    ]
  },
  {
    title: 'Terminal State',
    era: 'IV',
    accent: '#6C92FF',                 // cobalt — modern colour stock, the present
    bgFrom: '#060A1C',
    bgTo:   '#03050C',
    awards: [
      { honor: 'Best Cinematographer' },
      { honor: 'Best Editing' },
      { honor: '3rd Position', venue: 'Enigma' },
      { honor: '2nd Position', venue: 'Phantom' },
      { honor: '3rd Position', venue: 'Engifest DTU' }
    ]
  }
];

const FRAME_COLORS = ['#9C7A55', ...FILMS.map(f => f.accent), '#9C7A55'];
const NUM_FRAMES = 1 + FILMS.length + 1; // intro + films + outro

/* ────────────────────────────────────────────────────────────── */

function Sprockets({ position }) {
  // Enough holes to span any reasonable viewport
  return (
    <div className={`sprocket-row sprocket-row-${position}`}>
      {Array.from({ length: 28 }).map((_, i) => (
        <div key={i} className="sprocket-hole" />
      ))}
    </div>
  );
}

function FilmFrame({ film }) {
  return (
    <div
      className="reel-frame film-frame"
      style={{
        background:
          `radial-gradient(ellipse at 30% 30%, ${film.bgFrom} 0%, ${film.bgTo} 80%)`
      }}
    >
      {/* Big title */}
      <div className="frame-body">
        {/* Frame number — sits above the title, aligned with it */}
        <div className="frame-clapper" style={{ borderColor: film.accent }}>
          <span className="clapper-label">Film N°</span>
          <span className="clapper-era" style={{ color: film.accent }}>{film.era}</span>
        </div>

        <h2 className="frame-title" style={{ color: '#F5EBD8' }}>
          {film.title}
        </h2>

        <div className="frame-rule" style={{ background: film.accent }} />

        {/* Honor count meta */}
        <div className="frame-meta">
          <span className="meta-tag" style={{ color: film.accent }}>
            {film.awards.length} {film.awards.length === 1 ? 'Honor' : 'Honors'}
          </span>
        </div>

        {/* Credits-roll style award list */}
        <ul className="credits">
          {film.awards.map((a, i) => (
            <li key={i} className="credit-row" style={{ '--accent': film.accent }}>
              <span className="credit-honor">{a.honor}</span>
              <span className="credit-divider">—</span>
              <span className="credit-venue">
                {a.venue || 'Festival distinction'}
              </span>
              <div className="winner-stamp" style={{ borderColor: film.accent, color: film.accent }}>
                <span>★</span> Winner
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Subtle film-grain texture per frame */}
      <div className="film-grain" />

      {/* Era watermark */}
      <div className="era-watermark" style={{ color: film.accent }}>{film.era}</div>
    </div>
  );
}

function IntroFrame() {
  return (
    <div
      className="reel-frame intro-frame"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, #181208 0%, #060403 80%)'
      }}
    >
      <div className="frame-body intro-body">
        <span className="intro-eyebrow">A retrospective in IV chapters</span>
        <h1 className="intro-title">
          Reel <em>of</em> Honor
        </h1>
        <div className="intro-rule" />
        <p className="intro-byline">
          Filmography &amp; festival laurels, from the earliest stock
          to the present cut.
        </p>
        <div className="intro-hint">
          <span className="hint-arrow">↓</span>
          <span>Scroll to advance the reel</span>
          <span className="hint-arrow">→</span>
        </div>
      </div>
      <div className="film-grain" />
    </div>
  );
}

function OutroFrame() {
  return (
    <div
      className="reel-frame outro-frame"
      style={{
        background:
          'radial-gradient(ellipse at 50% 60%, #181208 0%, #060403 80%)'
      }}
    >
      <div className="frame-body outro-body">
        <div className="outro-mark">⬤</div>
        <span className="outro-eyebrow">End of Reel</span>
        <h2 className="outro-title">
          Currently <em>in production</em>
        </h2>
        <div className="intro-rule" />
        <p className="outro-byline">
          The next chapter is being printed.<br />
          Return for the IInd act.
        </p>
        <div className="outro-signature">— Soumil</div>
      </div>
      <div className="film-grain" />
    </div>
  );
}

/* ─── Mobile-stack fallback (≤ 767px) ─────────────────────────── */

function MobileStack() {
  return (
    <main className="mobile-reel">
      <header className="mobile-header">
        <span className="intro-eyebrow">A retrospective in IV chapters</span>
        <h1 className="intro-title intro-title-mobile">
          Reel <em>of</em> Honor
        </h1>
      </header>
      {FILMS.map(film => (
        <section
          key={film.title}
          className="mobile-frame"
          style={{
            background:
              `radial-gradient(ellipse at 30% 30%, ${film.bgFrom} 0%, ${film.bgTo} 90%)`
          }}
        >
          {/* Vertical sprocket strips — left + right edges, like 35mm film */}
          <div className="sprocket-col sprocket-col-left">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="sprocket-hole-v" />
            ))}
          </div>
          <div className="sprocket-col sprocket-col-right">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="sprocket-hole-v" />
            ))}
          </div>

          <div className="mobile-frame-inner">
            <div className="frame-clapper" style={{ borderColor: film.accent }}>
              <span className="clapper-label">Film N°</span>
              <span className="clapper-era" style={{ color: film.accent }}>{film.era}</span>
            </div>
            <h2 className="frame-title frame-title-mobile" style={{ color: '#F5EBD8' }}>
              {film.title}
            </h2>
            <div className="frame-rule" style={{ background: film.accent }} />
            <ul className="credits credits-mobile">
              {film.awards.map((a, i) => (
                <li key={i} className="credit-row credit-row-mobile">
                  <span className="credit-honor">{a.honor}</span>
                  {a.venue && (
                    <span className="credit-venue">{a.venue}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <footer className="mobile-outro">
        <div className="outro-mark">⬤</div>
        <span className="outro-eyebrow">End of Reel</span>
        <p className="outro-byline">Currently in production. — Soumil</p>
      </footer>
    </main>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function Awards() {
  const navigate = useNavigate();
  const outerRef = useRef(null);
  const stripRef = useRef(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const onChange = e => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Scroll → translate
  useEffect(() => {
    if (isMobile) return;

    let raf = 0;
    const tick = () => {
      const outerEl = outerRef.current;
      const stripEl = stripRef.current;
      if (!outerEl || !stripEl) return;

      const rect = outerEl.getBoundingClientRect();
      const total = outerEl.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / total));

      const stripW = stripEl.scrollWidth;
      const visibleW = window.innerWidth;
      const maxT = Math.max(0, stripW - visibleW);

      stripEl.style.transform = `translate3d(${-progress * maxT}px, 0, 0)`;
      const idx = Math.round(progress * (NUM_FRAMES - 1));
      setActiveFrame(prev => (prev === idx ? prev : idx));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  return (
    <>
      {/* Top nav — translucent dark for the cinema page */}
      <nav className="awards-nav">
        <div
          className="awards-brand"
          onClick={() => navigate('/')}
        >
          ARCHIVE
        </div>
        <span
          className="material-symbols-outlined awards-menu"
          onClick={() => { if (window.openMenu) window.openMenu(); }}
        >
          menu
        </span>
      </nav>

      {isMobile ? (
        <MobileStack />
      ) : (
        <div
          ref={outerRef}
          className="reel-outer"
          style={{ height: `${NUM_FRAMES * 100}vh` }}
        >
          <div className="reel-sticky">
            <Sprockets position="top" />
            <div ref={stripRef} className="reel-strip">
              <IntroFrame />
              {FILMS.map(film => (
                <FilmFrame key={film.title} film={film} />
              ))}
              <OutroFrame />
            </div>
            <Sprockets position="bottom" />

            {/* Progress indicator */}
            <div className="reel-progress">
              {Array.from({ length: NUM_FRAMES }).map((_, i) => (
                <div
                  key={i}
                  className={`reel-dot ${i === activeFrame ? 'active' : ''}`}
                  style={{
                    background:
                      i === activeFrame
                        ? FRAME_COLORS[i]
                        : 'rgba(245, 235, 216, 0.18)',
                    boxShadow:
                      i === activeFrame
                        ? `0 0 12px ${FRAME_COLORS[i]}`
                        : 'none'
                  }}
                />
              ))}
            </div>

            {/* Section label updates with scroll */}
            <div className="reel-section-label">
              {activeFrame === 0
                ? 'Opening'
                : activeFrame === NUM_FRAMES - 1
                ? 'End of reel'
                : `Chapter ${FILMS[activeFrame - 1]?.era ?? ''}`}
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root { --reel-ink: #F5EBD8; }
        body { background: #060403; }

        /* ─── Top nav ───────────────────────────────────────── */
        .awards-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 40px;
          background: linear-gradient(to bottom, rgba(6,4,3,0.85), rgba(6,4,3,0));
          backdrop-filter: blur(6px);
        }
        .awards-brand {
          font-family: 'Newsreader', serif;
          font-weight: 700;
          font-size: 26px;
          letter-spacing: -1px;
          color: var(--reel-ink);
          cursor: pointer;
          mix-blend-mode: difference;
        }
        .awards-nav-links {
          display: none;
          gap: 44px;
        }
        @media (min-width: 768px) {
          .awards-nav-links { display: flex; }
        }
        .awards-nav-links a {
          font-family: 'Work Sans', sans-serif;
          color: rgba(245, 235, 216, 0.55);
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-decoration: none;
          transition: color 0.4s ease;
        }
        .awards-nav-links a:hover { color: var(--reel-ink); }
        .awards-menu {
          color: var(--reel-ink);
          font-size: 22px;
          cursor: pointer;
          opacity: 0.9;
        }

        /* ─── Reel mechanics ────────────────────────────────── */
        .reel-outer { position: relative; }
        .reel-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #060403;
        }
        .reel-strip {
          position: absolute;
          top: 0; left: 0;
          height: 100vh;
          display: flex;
          will-change: transform;
        }
        .reel-frame {
          flex: 0 0 100vw;
          height: 100vh;
          padding: 140px 8vw 110px;
          display: flex;
          flex-direction: column;
          /* flex-start + auto margins on frame-body = "safe center":
             content centres when it fits, top-aligns when it overflows.
             This prevents the clapper from being pushed above the sprocket. */
          justify-content: flex-start;
          position: relative;
          color: var(--reel-ink);
          overflow: hidden;
        }
        .intro-frame, .outro-frame {
          padding-top: 110px;
          justify-content: center;
        }

        /* ─── Sprockets ─────────────────────────────────────── */
        .sprocket-row {
          position: absolute;
          left: 0; right: 0;
          height: 56px;
          background:
            linear-gradient(#0a0705, #050302);
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 16px;
          z-index: 5;
          box-shadow: 0 0 30px rgba(0,0,0,0.6);
        }
        .sprocket-row-top { top: 0; }
        .sprocket-row-bottom { bottom: 0; }
        .sprocket-hole {
          width: 32px;
          height: 22px;
          background: #1d1812;
          border-radius: 4px;
          box-shadow:
            inset 0 1px 0 rgba(0,0,0,0.6),
            inset 0 -1px 0 rgba(255,255,255,0.03);
        }

        /* ─── Frame anatomy ─────────────────────────────────── */
        .frame-body {
          max-width: 920px;
          width: 100%;
          align-self: center;
          /* auto margins: distribute spare space equally above + below when
             content fits (visual centering). When content is too tall, both
             margins collapse to 0 and content anchors from the top padding. */
          margin-top: auto;
          margin-bottom: auto;
          position: relative;
          z-index: 2;
        }
        .frame-clapper {
          align-self: flex-start;
          margin-bottom: 28px;
          z-index: 3;
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 18px;
          border: 1px solid;
          border-radius: 2px;
        }
        .clapper-label {
          font-family: 'Work Sans', sans-serif;
          font-size: 9px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: rgba(245, 235, 216, 0.55);
        }
        .clapper-era {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 28px;
          line-height: 1;
          letter-spacing: -1px;
        }

        .frame-title {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 500;
          /* Scale with both width AND height — prevents wrapping on short/narrow
             screens and keeps content within the visible frame on all laptops */
          font-size: clamp(44px, min(9vw, 11vh), 160px);
          line-height: 0.92;
          letter-spacing: -3px;
          margin: 0;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .frame-rule {
          width: 90px;
          height: 2px;
          margin: 36px 0 28px;
          opacity: 0.85;
        }
        .frame-meta { margin-bottom: 36px; }
        .meta-tag {
          font-family: 'Work Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.4em;
          text-transform: uppercase;
        }

        /* ─── Credits roll ──────────────────────────────────── */
        .credits {
          list-style: none;
          margin: 0; padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 720px;
        }
        .credit-row {
          position: relative;
          display: grid;
          grid-template-columns: minmax(220px, auto) 24px 1fr;
          align-items: baseline;
          gap: 0 12px;
          padding: 6px 0;
          color: var(--reel-ink);
          transition: opacity 0.4s ease;
        }
        .credit-honor {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 400;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }
        .credit-divider {
          opacity: 0.35;
          font-family: 'Newsreader', serif;
          font-size: 18px;
        }
        .credit-venue {
          font-family: 'Work Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(245, 235, 216, 0.55);
        }

        /* WINNER stamp */
        .winner-stamp {
          position: absolute;
          right: -130px;
          top: 50%;
          transform: translate(-32px, -50%) rotate(-12deg) scale(0.7);
          opacity: 0;
          padding: 8px 18px;
          border: 2px solid;
          border-radius: 999px;
          font-family: 'Work Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
          white-space: nowrap;
        }
        .winner-stamp span {
          margin-right: 6px;
          font-size: 11px;
        }
        .credit-row:hover .winner-stamp {
          opacity: 1;
          transform: translate(0, -50%) rotate(-8deg) scale(1);
        }
        .credit-row:hover .credit-honor {
          color: var(--accent);
        }

        /* ─── Era watermark ─────────────────────────────────── */
        .era-watermark {
          position: absolute;
          right: 4vw;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 200;
          font-size: clamp(280px, 38vw, 580px);
          line-height: 0.85;
          opacity: 0.06;
          user-select: none;
          pointer-events: none;
          z-index: 1;
        }

        /* ─── Intro / Outro frames ──────────────────────────── */
        .intro-body, .outro-body {
          text-align: center;
          max-width: 760px;
          margin: 0 auto;
        }
        .intro-eyebrow, .outro-eyebrow {
          font-family: 'Work Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(245, 235, 216, 0.55);
          margin-bottom: 28px;
          display: block;
        }
        .intro-title, .outro-title {
          font-family: 'Newsreader', serif;
          font-weight: 400;
          font-size: clamp(80px, 13vw, 220px);
          line-height: 0.9;
          letter-spacing: -4px;
          margin: 0;
          color: var(--reel-ink);
        }
        .intro-title em, .outro-title em {
          font-style: italic;
          font-weight: 300;
          opacity: 0.75;
        }
        .intro-rule {
          width: 80px;
          height: 2px;
          background: rgba(245, 235, 216, 0.4);
          margin: 36px auto;
        }
        .intro-byline, .outro-byline {
          font-family: 'Work Sans', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(245, 235, 216, 0.65);
          font-weight: 300;
          margin: 0 0 56px;
        }
        .intro-hint {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: 'Work Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(245, 235, 216, 0.4);
        }
        .hint-arrow { font-size: 14px; opacity: 0.6; }
        .outro-mark {
          font-size: 8px;
          color: rgba(245, 235, 216, 0.3);
          margin-bottom: 28px;
        }
        .outro-signature {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 22px;
          color: rgba(245, 235, 216, 0.6);
          margin-top: 16px;
        }

        /* ─── Film grain ────────────────────────────────────── */
        .film-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 4;
        }

        /* ─── Reel HUD ──────────────────────────────────────── */
        .reel-progress {
          position: absolute;
          right: 32px;
          bottom: 84px;
          z-index: 6;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .reel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
        }
        .reel-dot.active {
          transform: scale(1.6);
        }
        .reel-section-label {
          position: absolute;
          left: 32px;
          bottom: 84px;
          z-index: 6;
          font-family: 'Work Sans', sans-serif;
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(245, 235, 216, 0.55);
          font-weight: 500;
        }

        /* ─── Mobile stack ──────────────────────────────────── */
        .mobile-reel {
          padding-top: 100px;
          background: #060403;
          color: var(--reel-ink);
        }
        .mobile-header {
          padding: 60px 28px 80px;
          text-align: center;
        }
        .intro-title-mobile { font-size: 56px; letter-spacing: -2px; }
        .mobile-frame {
          padding: 60px 56px 80px;        /* extra side padding so text clears the sprockets */
          position: relative;
          border-top: 1px solid rgba(245, 235, 216, 0.06);
          overflow: hidden;
        }
        .mobile-frame-inner {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          padding-top: 80px;
        }
        /* Vertical filmstrip sprockets — sides of every mobile frame */
        .sprocket-col {
          position: absolute;
          top: 0; bottom: 0;
          width: 36px;
          background: linear-gradient(90deg, #0a0705, #050302);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          padding: 18px 0;
          z-index: 5;
          box-shadow: 0 0 30px rgba(0,0,0,0.6);
        }
        .sprocket-col-left  { left: 0; }
        .sprocket-col-right { right: 0; }
        .sprocket-hole-v {
          width: 22px;
          height: 28px;
          background: #1d1812;
          border-radius: 4px;
          box-shadow:
            inset 0 1px 0 rgba(0,0,0,0.6),
            inset 0 -1px 0 rgba(255,255,255,0.03);
        }
        .frame-title-mobile {
          font-size: clamp(54px, 12vw, 100px);
          letter-spacing: -2px;
        }
        .credits-mobile { gap: 18px; }
        .credit-row-mobile {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mobile-outro {
          padding: 80px 28px 120px;
          text-align: center;
        }

        /* ─── Short-viewport compression ───────────────────────── */
        /* Tighten vertical padding so all frame content stays
           inside the viewport on smaller / scaled laptop screens   */
        @media (max-height: 760px) {
          .reel-frame        { padding-top: 90px;  padding-bottom: 75px; }
          .frame-clapper     { margin-bottom: 16px; }
          .frame-rule        { margin: 20px 0 16px; }
          .frame-meta        { margin-bottom: 18px; }
          .credits           { gap: 8px; }
        }
        @media (max-height: 640px) {
          .reel-frame        { padding-top: 72px;  padding-bottom: 60px; }
          .frame-clapper     { margin-bottom: 10px; padding: 10px 14px; }
          .clapper-era       { font-size: 22px; }
          .frame-rule        { margin: 14px 0 12px; width: 60px; }
          .frame-meta        { margin-bottom: 12px; }
          .credits           { gap: 6px; }
          .credit-honor      { font-size: 20px; }
          .intro-title,
          .outro-title       { font-size: clamp(60px, 10vw, 160px); }
        }
      `}</style>
    </>
  );
}
