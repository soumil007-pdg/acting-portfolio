import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Ordered latest → first (descending), Roman numerals match the
// chronological "Film N°" mapping used on the Awards page.
const projects = [
  {
    title: "TERMINAL STATE",
    year: "2026",
    era: "IV",
    role: "Director · Cinematographer · Editor · Writer",
    desc: "Best Cinematographer, Best Editing, and three festival placements.",
    video: "/terminalstate.mp4",
    link: "https://youtu.be/BtS6iLSdedw?si=6b6IaNWY1vX5411W"
  },
  {
    title: "EXTRA TIME",
    year: "2025",
    era: "III",
    role: "Actor",
    desc: "Best Actor, Best Screenplay, Best Director.",
    video: "/extratime.mp4",
    link: "https://youtu.be/lC-NUB7IDAg?si=Ts2X1L-atMCw9Okh"
  },
  {
    title: "ANVESHANAM",
    year: "2025",
    era: "II",
    role: "Actor · Camera Assistant",
    desc: "3rd Position at the International Goa Film Festival.",
    video: "/anveshanam.mp4",
    link: "https://youtu.be/wJ8Cx9XLewA?si=EpQvMB9xxyFD2BEV"
  },
  {
    title: "TOESTIP",
    year: "2024",
    era: "I",
    role: "Actor",
    desc: "Official Selection at the International Ahmedabad Film Festival.",
    video: "/toestip.mp4",
    link: "https://youtube.com"
  }
];

const heights = ['h-[75%]', 'h-[80%]', 'h-[90%]', 'h-[85%]', 'h-[82%]', 'h-[78%]', 'h-[85%]'];
const offsets = ['-translate-y-8', 'translate-y-4', '', '', 'translate-y-6', '-translate-y-4', ''];
const flexBasis = ['flex-[1]', 'flex-[0.8]', 'flex-[1]', 'flex-[1.2]', 'flex-[1.5]', 'flex-[1]', 'flex-[0.7]'];

/* ─── Mobile Work page — dark hero + vertical film stack ──────── */
function MobileFocus({ projects, navigate }) {
  // Pause/play videos as cards enter/exit the viewport (battery-friendly)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target.querySelector('video');
        if (!v) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else { v.pause(); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('.mwork-card').forEach(c => io.observe(c));
    return () => io.disconnect();
  }, []);

  const featured = projects[0]; // latest film headlines the hero

  return (
    <main className="md:hidden relative z-10 min-h-[100svh] w-full flex flex-col" style={{ background: '#0d0d0c' }}>
      {/* Top nav (over hero) */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-5 pb-3 text-white">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center"
          aria-label="Back home"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <h1
          className="italic font-bold text-[18px] tracking-tight"
          style={{ fontFamily: '"Newsreader", serif' }}
        >
          Short Films
        </h1>
        <button
          onClick={() => { if (window.openMenu) window.openMenu() }}
          className="w-9 h-9 flex flex-col items-center justify-center gap-[3px]"
          aria-label="Open menu"
        >
          <span className="block w-[18px] h-[1.5px] bg-white/85" />
          <span className="block w-[18px] h-[1.5px] bg-white/85" />
          <span className="block w-[18px] h-[1.5px] bg-white/85" />
        </button>
      </nav>

      {/* Hero — full-viewport portrait of the latest film */}
      <section className="relative w-full h-[100svh] flex flex-col justify-end overflow-hidden">
        <video
          src={featured.video}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(0.5) brightness(0.55)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)'
        }} />

        <div className="relative px-6 pb-24 text-white">
          <span className="font-label text-[10px] tracking-[0.4em] uppercase opacity-70 block mb-3">
            Filmography · Latest
          </span>
          <span className="font-label text-[10px] tracking-[0.35em] uppercase opacity-55 block mb-2">
            Film N° {featured.era} — {featured.year}
          </span>
          <h2
            className="italic font-bold leading-[0.88] tracking-tight"
            style={{
              fontFamily: '"Newsreader", serif',
              fontSize: 'clamp(48px, 13vw, 96px)',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              maxWidth: '100%',
            }}
          >
            {featured.title.split(' ').map((word, i) => (
              <span key={i} className="block" style={{ opacity: i === 0 ? 1 : 0.92 }}>
                {word}
              </span>
            ))}
          </h2>
          <p className="font-body italic text-base opacity-75 mt-5 max-w-xs leading-relaxed">
            {featured.role}. {featured.desc}
          </p>
          <button
            onClick={() => window.open(featured.link, '_blank', 'noopener')}
            className="mt-6 inline-flex items-center gap-2 border border-white/30 px-5 py-3 font-label text-[10px] tracking-[0.4em] uppercase hover:bg-white/10 transition-colors"
          >
            Watch Film <span aria-hidden="true">↗</span>
          </button>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60">
          <span className="font-label text-[9px] tracking-[0.35em] uppercase mb-2">Filmography</span>
          <span className="material-symbols-outlined text-base animate-bounce">expand_more</span>
        </div>
      </section>

      {/* Vertical stack — full filmography (latest → first) */}
      <section className="w-full bg-[#0d0d0c] py-16 px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-label text-[10px] tracking-[0.35em] uppercase text-white/50 mb-1">
              Selected Work
            </div>
            <div
              className="italic text-white/90"
              style={{ fontFamily: '"Newsreader", serif', fontSize: 28, lineHeight: 1, letterSpacing: '-0.5px' }}
            >
              Latest first
            </div>
          </div>
          <span className="font-label text-[10px] tracking-[0.35em] uppercase text-white/40">
            {projects.length} films
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {projects.map((proj) => (
            <article
              key={proj.title}
              className="mwork-card relative w-full h-[55vh] overflow-hidden cursor-pointer group rounded-sm"
              onClick={() => window.open(proj.link, '_blank', 'noopener')}
            >
              <video
                src={proj.video}
                muted loop playsInline preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.7)' }}
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)'
              }} />

              {/* Top-right meta badge */}
              <div className="absolute top-4 right-4 text-right text-white/80">
                <div className="font-label text-[9px] tracking-[0.4em] uppercase opacity-70">
                  {proj.year}
                </div>
                <div
                  className="italic font-bold leading-none mt-1"
                  style={{ fontFamily: '"Newsreader", serif', fontSize: 22 }}
                >
                  N° {proj.era}
                </div>
              </div>

              {/* Bottom-left title block */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <span className="font-label text-[9px] tracking-[0.4em] uppercase opacity-60 block mb-2">
                  {proj.role}
                </span>
                <h3
                  className="italic font-bold tracking-tight leading-[1.05] mb-3"
                  style={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: 'clamp(26px, 7vw, 34px)',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {proj.title}
                </h3>
                <p className="font-body text-xs opacity-80 leading-relaxed line-clamp-2">
                  {proj.desc}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 font-label text-[10px] tracking-[0.35em] uppercase opacity-70">
                  Watch <span aria-hidden="true">↗</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-10 w-full border border-white/20 py-4 text-white font-label text-[11px] tracking-[0.4em] uppercase hover:bg-white/5 transition-colors"
        >
          ← Back to Home
        </button>

        <div className="mt-12 text-center">
          <span className="font-label text-[9px] tracking-[0.2rem] uppercase text-white/30">
            © 2026 Soumil — Selected Works
          </span>
        </div>
      </section>
    </main>
  );
}

export default function Focus() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placardIndex, setPlacardIndex] = useState(2); // start with original placard position
  const [collapsed, setCollapsed] = useState(true);
  const containerRef = useRef(null);

  // Trigger entering animation after render
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setCollapsed(false);
    });
    return () => cancelAnimationFrame(handle);
  }, [currentIndex, placardIndex]);

  const syncSlices = () => {
    if (!containerRef.current) return;
    const panels = containerRef.current.querySelectorAll('.piano-panel:not(.bg-surface-container-lowest)');
    panels.forEach((panel) => {
      const videoContainer = panel.querySelector('.video-container');
      if (!videoContainer) return;
      const rect = panel.getBoundingClientRect();
      videoContainer.style.left = `${-rect.left}px`;
      videoContainer.style.top = `${-rect.top}px`;
      videoContainer.style.width = `${window.innerWidth}px`;
      videoContainer.style.height = `${window.innerHeight}px`;
    });
  };

  useEffect(() => {
    syncSlices();
    window.addEventListener('resize', syncSlices);
    return () => window.removeEventListener('resize', syncSlices);
  }, [currentIndex, collapsed]);

  const transitionTo = (index) => {
    setCollapsed(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setPlacardIndex(Math.floor(Math.random() * 7));
    }, 1100);
  };

  const handleNext = () => transitionTo((currentIndex + 1) % projects.length);
  const handlePrev = () => transitionTo((currentIndex - 1 + projects.length) % projects.length);

  const handleMouseEnter = () => {
    if (!containerRef.current) return;
    const videos = containerRef.current.querySelectorAll('video');
    videos.forEach(v => v.play().catch(() => { }));
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    const videos = containerRef.current.querySelectorAll('video');
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
    });
  };

  const project = projects[currentIndex];

  const renderPanels = () => {
    const panels = [];
    for (let i = 0; i < 7; i++) {
      const delay = `${Math.random() * 300}ms`;
      if (i === placardIndex) {
        panels.push(
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            key={`placard-${i}-${currentIndex}`}
            className={`${flexBasis[i]} h-[90%] bg-surface-container-lowest flex flex-col items-center justify-center py-12 relative z-10 piano-panel shadow-sm transition-all duration-1000 ${collapsed ? 'collapsed' : ''} cursor-pointer group/link hover:bg-[#F2EFEA]`}
            style={{ transitionDelay: collapsed ? delay : delay, textDecoration: 'none' }}
            onTransitionEnd={syncSlices}
          >
            <div className="flex flex-col items-center">
              <h2 className="vertical-text font-headline text-6xl italic tracking-tighter text-on-surface leading-none group-hover/link:text-primary transition-colors duration-500">{project.title}</h2>
            </div>
          </a>
        );
      } else {
        panels.push(
          <div
            key={`video-${i}-${currentIndex}`}
            className={`piano-panel ${flexBasis[i]} ${heights[i]} ${offsets[i]} relative overflow-hidden bg-surface-container-highest transition-all duration-1000 ${collapsed ? 'collapsed' : ''}`}
            style={{ transitionDelay: collapsed ? delay : delay }}
            onTransitionEnd={syncSlices}
          >
            <div className="video-container" id={`slice-${i}`}>
              <video muted loop playsInline className="video-slice">
                <source src={project.video} type="video/mp4" />
              </video>
            </div>
          </div>
        );
      }
    }
    return panels;
  };

  return (
    <>
      <div className="fixed inset-0 parchment-texture z-50 pointer-events-none hidden md:block"></div>

      {/* ─── MOBILE WORK PAGE (≤ md) ──────────────────────────────── */}
      <MobileFocus projects={projects} navigate={navigate} />

      <header className="hidden md:flex fixed top-0 w-full justify-between items-center px-12 py-8 z-40 bg-[#F8F6F6]/95 backdrop-blur-xl">
        <div className="flex-1 hidden md:flex items-center gap-8">
          <a className="text-[#D32F2F] font-medium border-b border-[#D32F2F] uppercase text-[10px] tracking-[0.3rem]" href="#">Chronology</a>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-serif italic text-stone-900 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>SHORT FILMS</h1>
        </div>
        <div className="flex-1 flex justify-end items-center gap-8">
          <a className="text-stone-600 uppercase text-[10px] tracking-[0.3rem] hover:text-[#D32F2F] transition-colors duration-500 hidden md:block" href="#"><br /></a>
          <button className="text-on-surface" onClick={() => { if (window.openMenu) window.openMenu() }}>
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </header>

      <button className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-50 text-white mix-blend-difference hover:text-primary transition-colors duration-500" onClick={handlePrev}>
        <span className="material-symbols-outlined text-6xl">chevron_left</span>
      </button>
      <button className="hidden md:block fixed right-6 top-1/2 -translate-y-1/2 z-50 text-white mix-blend-difference hover:text-primary transition-colors duration-500" onClick={handleNext}>
        <span className="material-symbols-outlined text-6xl">chevron_right</span>
      </button>

      <main
        className="hidden md:flex h-screen w-full items-center justify-center px-12 pt-20 pb-24 gap-4"
        id="gallery-container"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {renderPanels()}
      </main>

      <footer className="hidden md:flex fixed bottom-0 left-0 w-full justify-between items-center px-12 py-6 z-40 vignette-bottom-focus">
        <div className="flex items-center gap-12">
          <span className="text-stone-400 uppercase text-[9px] tracking-[0.25rem]">© EXHIBITION</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <a className="group flex flex-col items-center" href="#">
            <span className="text-primary font-bold uppercase text-[9px] tracking-[0.35rem]">See all works</span>
            <span className="material-symbols-outlined text-primary text-xl mt-1 group-hover:translate-y-1 transition-transform">expand_more</span>
          </a>
        </div>
        <div className="flex items-center gap-8">
          <button className="text-stone-400 hover:text-[#D32F2F] transition-colors duration-500" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
          <button className="text-stone-400 hover:text-[#D32F2F] transition-colors duration-500">
            <span className="material-symbols-outlined text-xl">fullscreen</span>
          </button>
        </div>
      </footer>
    </>
  );
}
