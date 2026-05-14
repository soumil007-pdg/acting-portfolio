import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const email = 'soumilchadha@gmail.com';
  const phone = '+91 79822 93732';
  const phoneTel = '+917982293732';

  return (
    <>
      <div className="fixed inset-0 parchment-texture pointer-events-none z-0" />
      <div className="fixed inset-0 vignette-bottom-main pointer-events-none z-0" />

      {/* Header — matches Awards / Biography layout */}
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
        {/* Eyebrow */}
        <div className="font-label text-[10px] tracking-[0.45em] uppercase text-tertiary opacity-60 mb-8">
          A note · An invitation
        </div>

        {/* Editorial headline */}
        <h1
          className="font-headline italic text-on-surface text-center leading-[0.95] tracking-tight mb-3"
          style={{ fontSize: 'clamp(56px, 12vw, 144px)' }}
        >
          Let&rsquo;s create
        </h1>
        <h1
          className="font-headline italic text-on-surface text-center leading-[0.95] tracking-tight mb-12 md:mb-16"
          style={{ fontSize: 'clamp(56px, 12vw, 144px)' }}
        >
          something.
        </h1>

        {/* Hairline rule */}
        <div className="w-16 h-px bg-on-surface/30 mb-12" />

        {/* Contact lines */}
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <a
            href={`mailto:${email}`}
            className="group flex flex-col items-center"
          >
            <span className="font-label text-[9px] tracking-[0.4em] uppercase text-tertiary opacity-50 mb-2">
              Write
            </span>
            <span
              className="font-headline italic text-on-surface group-hover:text-primary transition-colors duration-500"
              style={{ fontSize: 'clamp(22px, 4.5vw, 36px)' }}
            >
              {email}
            </span>
          </a>

          <a
            href={`tel:${phoneTel}`}
            className="group flex flex-col items-center"
          >
            <span className="font-label text-[9px] tracking-[0.4em] uppercase text-tertiary opacity-50 mb-2">
              Call
            </span>
            <span
              className="font-headline italic text-on-surface group-hover:text-primary transition-colors duration-500"
              style={{ fontSize: 'clamp(22px, 4.5vw, 36px)' }}
            >
              {phone}
            </span>
          </a>
        </div>

        {/* Footer mark */}
        <div className="mt-20 md:mt-28 flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-on-surface/40 mb-3" />
          <span className="font-label text-[9px] tracking-[0.4em] uppercase text-tertiary opacity-50">
            Based in Delhi · Available worldwide
          </span>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="mt-16 font-label text-[10px] tracking-[0.4em] uppercase text-on-surface/70 hover:text-primary transition-colors"
        >
          ← Back to Home
        </button>
      </main>
    </>
  );
}
