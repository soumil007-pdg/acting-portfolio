import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Menken-style mobile carousel (infinite loop) ─────────────── */
function MobileHome({ projects, navigate }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0); // index into the *flattened* loop
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  // Repeat the projects N times so the user can keep swiping in either direction.
  // We start in the middle copy and silently teleport back whenever they
  // wander too close to either edge — feels truly infinite.
  const COPIES = 11; // odd number so there's a true "middle"
  const MIDDLE_COPY = Math.floor(COPIES / 2);
  const N = projects.length;
  const loop = Array.from({ length: COPIES * N }, (_, i) => projects[i % N]);

  const teleportingRef = useRef(false);

  const centerCardAt = (i, behavior = 'smooth') => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelectorAll('.poster-card')[i];
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2,
      behavior,
    });
  };

  // Jump to the middle copy on first mount
  useEffect(() => {
    const startIndex = MIDDLE_COPY * N; // first card of the middle copy
    // Defer one frame so layout is measured
    requestAnimationFrame(() => {
      centerCardAt(startIndex, 'auto');
      setActive(startIndex);
    });
  }, []);

  // iOS Safari blocks video autoplay until the user touches the page once.
  // On the very first touch/click anywhere, kick off all videos manually.
  // (autoPlay+muted+playsInline still does the right thing on Android & most browsers.)
  useEffect(() => {
    const unlock = () => {
      const el = trackRef.current;
      if (!el) return;
      el.querySelectorAll('video').forEach(v => {
        const p = v.play();
        if (p && p.catch) p.catch(() => {/* ignore — will retry on next gesture */});
      });
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);

  // Track which slide is centered + handle the silent teleport at the edges
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (teleportingRef.current) return;

        const center = el.scrollLeft + el.clientWidth / 2;
        const cards = el.querySelectorAll('.poster-card');
        let best = 0, bestDist = Infinity;
        cards.forEach((c, i) => {
          const rect = c.getBoundingClientRect();
          const cardCenter = c.offsetLeft + rect.width / 2;
          const d = Math.abs(cardCenter - center);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setActive(prev => (prev === best ? prev : best));

        // If we drift into the first or last copy, silently snap back to the
        // equivalent card in the middle copy. The visible card doesn't change,
        // so the user can keep scrolling forever.
        const copyIdx = Math.floor(best / N);
        if (copyIdx <= 1 || copyIdx >= COPIES - 2) {
          const localIdx = best % N;
          const targetIdx = MIDDLE_COPY * N + localIdx;
          if (targetIdx !== best) {
            const targetCard = cards[targetIdx];
            const currentCard = cards[best];
            if (targetCard && currentCard) {
              const delta = targetCard.offsetLeft - currentCard.offsetLeft;
              teleportingRef.current = true;
              el.scrollLeft = el.scrollLeft + delta;
              setActive(targetIdx);
              // Release the lock on next frame, after the browser has applied
              // the new scroll position without firing a smooth transition.
              requestAnimationFrame(() => {
                requestAnimationFrame(() => { teleportingRef.current = false; });
              });
            }
          }
        }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const goTo = (localIdx) => {
    // Find the nearest copy of the requested project to the current active
    const targetInMiddle = MIDDLE_COPY * N + localIdx;
    centerCardAt(targetInMiddle, 'smooth');
  };

  const localActive = ((active % N) + N) % N;
  const current = projects[localActive] || projects[0];

  return (
    <main className="md:hidden relative z-10 min-h-[100svh] w-full flex flex-col" style={{ background: '#EFE8DD' }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <button className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center text-black/70">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </button>
        <h1
          className="font-headline italic font-bold text-[22px] tracking-tight text-black/85"
          style={{ fontFamily: '"Newsreader", serif' }}
        >
          Soumil
        </h1>
        <button
          onClick={() => { if (window.openMenu) window.openMenu() }}
          className="w-9 h-9 flex flex-col items-center justify-center gap-[3px]"
          aria-label="Open menu"
        >
          <span className="block w-[18px] h-[1.5px] bg-black/75" />
          <span className="block w-[18px] h-[1.5px] bg-black/75" />
          <span className="block w-[18px] h-[1.5px] bg-black/75" />
        </button>
      </header>

      {/* Poster filmstrip */}
      <div
        ref={trackRef}
        className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollPaddingInline: '50%' }}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        `}</style>

        {/* Leading + trailing spacers so first/last card can center */}
        <div className="flex-shrink-0" style={{ width: '22vw' }} />

        {loop.map((proj, i) => {
          const isActive = i === active;
          // Only mount real <video> elements for the active card and its
          // immediate neighbors. iOS Safari caps concurrent video playback
          // (~16 max), and rendering 44 <video>s at once means NONE of them
          // autoplay reliably. The other cards get a cheap black placeholder.
          const distance = Math.abs(i - active);
          const renderVideo = distance <= 2;
          return (
            <div
              key={i}
              className="poster-card flex-shrink-0 snap-center mx-2"
              style={{
                width: '56vw',
                height: '70vh',
                maxHeight: '560px',
                transition: 'filter 0.5s ease, opacity 0.5s ease, transform 0.5s ease',
                filter: isActive ? 'none' : 'grayscale(1)',
                opacity: isActive ? 1 : 0.18,
                transform: isActive ? 'scale(1)' : 'scale(0.92)',
              }}
              onClick={() => isActive ? navigate('/focus') : centerCardAt(i, 'smooth')}
            >
              <div className="relative w-full h-full overflow-hidden rounded-[4px] shadow-[0_18px_40px_rgba(0,0,0,0.18)] bg-black">
                {renderVideo ? (
                <video
                  src={proj.hoverVideo}
                  autoPlay muted loop playsInline preload="auto"
                  disableRemotePlayback
                  disablePictureInPicture
                  x-webkit-airplay="deny"
                  controls={false}
                  ref={(el) => {
                    if (!el) return;
                    el.muted = true;
                    el.defaultMuted = true;
                    el.setAttribute('webkit-playsinline', 'true');
                    const tryPlay = () => {
                      const p = el.play();
                      if (p && p.catch) p.catch(() => {});
                    };
                    tryPlay();
                    el.addEventListener('loadeddata', tryPlay, { once: true });
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: proj.videoPosition || 'center' }}
                />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-black" />
                )}
              </div>
            </div>
          );
        })}

        <div className="flex-shrink-0" style={{ width: '22vw' }} />
      </div>

      {/* Title + subtitle */}
      <section className="px-6 pb-6 text-center">
        <h2
          key={`t-${localActive}`}
          className="font-headline italic font-bold text-black/90 leading-[1.05] tracking-tight"
          style={{
            fontFamily: '"Newsreader", serif',
            fontSize: 'clamp(28px, 8vw, 44px)',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            animation: 'fadeUp 0.5s ease both',
          }}
        >
          {current.title}
        </h2>
        <p
          key={`s-${localActive}`}
          className="mt-3 text-black/55"
          style={{
            fontFamily: '"Newsreader", serif',
            fontSize: '15px',
            animation: 'fadeUp 0.5s ease 0.05s both',
          }}
        >
          Film N° <em>{romans[localActive] || localActive + 1}</em>
        </p>

        {/* Two circular controls (like Menken's pause + bars) */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/focus')}
            className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white"
            aria-label="View project"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          </button>
          <button
            onClick={() => navigate('/focus')}
            className="w-12 h-12 rounded-full border border-black/35 flex items-center justify-center text-black/70"
            aria-label="All projects"
          >
            <span className="material-symbols-outlined text-[20px]">view_agenda</span>
          </button>
        </div>

        {/* Slide indicator dots — one per unique project */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all"
              style={{
                width: i === localActive ? 18 : 5,
                height: 5,
                borderRadius: 999,
                background: i === localActive ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.22)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const defaultTitle = "SOUMIL";
  const defaultDesc = "Delhi-based filmmaker & theatre artist";

  const [content, setContent] = useState({ title: defaultTitle, desc: defaultDesc });
  const [opacity, setOpacity] = useState(1);

  const uniqueProjects = [
    {
      title: "TOESTIP",
      desc: "First project as an actor. Official selection at Ahmedabad Film Festival.",
      staticImg: "https://lh3.googleusercontent.com/aida-public/AB6A...",
      colorImg: "https://lh3.googleusercontent.com/aida-public/AB6A...",
      hoverVideo: "/toestip.mp4",
      videoPosition: "center"
    },
    {
      title: "ANVESHANAM",
      desc: "Actor and Camera Assistant. Awards: 3rd Position at International Goel Festival Sanskrit.",
      staticImg: "...",
      colorImg: "...",
      hoverVideo: "/anveshanam.mp4",
      videoPosition: "center"
    },
    {
      title: "EXTRA TIME",
      desc: "Actor. Awards: Best Actor, Best Editing, Second Prize at Film Festival.",
      staticImg: "...",
      colorImg: "...",
      hoverVideo: "/extratime.mp4",
      videoPosition: "center"
    },

    {
      title: "TERMINAL STATE",
      desc: "Director, Cinematographer, Editor, and Writer. Awards: Best Cinematographer, 3rd Prize at Film Festival.",
      staticImg: "...",
      colorImg: "...",
      hoverVideo: "/terminalstate.mp4",
      videoPosition: "center"
    }
  ];

  const totalTiles = 6;
  const projects = Array.from({ length: totalTiles }, (_, i) => {
    const baseProj = uniqueProjects[i % uniqueProjects.length];
    return {
      ...baseProj,
      hiddenLg: i >= 4
    };
  });

  let timeoutId;
  const updateContent = (title, desc) => {
    setOpacity(0);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setContent({ title, desc });
      setOpacity(1);
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 parchment-texture pointer-events-none z-0"></div>
      <div className="fixed inset-0 vignette-bottom-main pointer-events-none z-0"></div>

      <nav className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-between items-center px-6 md:px-12 py-6 md:py-10 bg-transparent mix-blend-difference text-white">
        <div className="flex items-center">
          <button className="transition-colors duration-500">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"wght" 600' }}>videocam</span>
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-[1.1rem] md:text-[1.75rem] font-headline italic tracking-tighter uppercase font-bold whitespace-nowrap">work portfolio</h1>
        </div>
        <div className="flex items-center">
          <button className="transition-colors duration-500" onClick={() => { if (window.openMenu) window.openMenu() }}>
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </nav>

      {/* ─── MOBILE HOME — Menken-style poster carousel (≤ md) ─────── */}
      <MobileHome
        projects={uniqueProjects}
        navigate={navigate}
      />

      {/* ─── DESKTOP LAYOUT (≥ md) ─────────────────────────────────── */}
      <main className="hidden md:flex relative h-full min-h-screen w-full flex-col items-center justify-between pb-24 z-10 pt-[160px]" id="main-content">
        <div className="flex-none flex items-center justify-center w-full max-w-[1400px] px-12 panel-container">
          <div className="flex items-stretch justify-center h-[532px] w-full gap-4">

            {projects.map((proj, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden group cursor-pointer h-full panel-item ${proj.hiddenLg ? 'hidden lg:block' : ''}`}
                onMouseEnter={(e) => {
                  updateContent(proj.title, proj.desc);
                  const vid = e.currentTarget.querySelector('.video-reveal video');
                  if (vid) vid.play().catch(() => { });
                }}
                onMouseLeave={(e) => {
                  updateContent(defaultTitle, defaultDesc);
                  const vid = e.currentTarget.querySelector('.video-reveal video');
                  if (vid) {
                    vid.pause();
                    vid.currentTime = 0;
                  }
                }}
                onClick={() => navigate('/focus')}
              >
                <div className="absolute inset-0 grayscale opacity-40 transition-all duration-1000 ease-in-out static-image">
                  {proj.hoverVideo ? (
                    <video
                      src={proj.hoverVideo}
                      muted
                      playsInline
                      preload="metadata"
                      className="object-cover w-full h-full"
                      style={{ objectPosition: proj.videoPosition || 'center' }}
                    />
                  ) : (
                    <img alt={`Project ${idx + 1}`} className="object-cover" src={proj.staticImg} />
                  )}
                </div>
                <div className="absolute inset-0 video-reveal">
                  {proj.hoverVideo ? (
                    <video
                      src={proj.hoverVideo}
                      muted
                      loop
                      playsInline
                      className="object-cover w-full h-full"
                      style={{
                        objectPosition: proj.videoPosition || 'center',
                      }}
                    />
                  ) : (
                    <img alt={`Project ${idx + 1} Color`} className="object-cover" src={proj.colorImg} />
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>

        <section className="text-center mt-12">
          <h2
            className="font-headline text-[5.5rem] md:text-[6.5rem] font-bold tracking-tight text-on-surface leading-none transition-all duration-500 ease-in-out mb-6"
            style={{ opacity: opacity }}
          >
            {content.title}
          </h2>
          <div className="max-w-2xl mx-auto px-6 h-12 overflow-visible">
            <p
              className="font-body text-lg italic text-tertiary leading-relaxed transition-all duration-500 ease-in-out"
              style={{ opacity: opacity === 1 ? 0.7 : 0 }}
            >
              {content.desc}
            </p>
          </div>
        </section>
      </main>

      <footer className="hidden md:flex fixed bottom-0 left-0 w-full px-12 py-10 justify-between items-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center">
          <a className="font-label text-[10px] tracking-[0.25rem] uppercase text-on-surface hover:text-primary transition-colors duration-300 font-bold" href="#">ALL PROJECTS</a>
          <button className="text-on-surface hover:text-primary transition-colors duration-500 ml-4 inline-flex items-center align-middle" onClick={() => navigate('/focus')}>
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
        </div>
        <div className="flex items-center space-x-8 pointer-events-auto">
          <span className="font-label text-[9px] tracking-[0.15rem] uppercase text-on-surface/40">© 2026 Soumil</span>
        </div>
      </footer>
    </>
  );
}
