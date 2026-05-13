import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Biography() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data && e.data.type === 'biography-wand-mode') {
        setIsDark(!!e.data.isDark);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const headerBg = isDark ? 'rgba(6,18,26,0.85)' : 'rgba(248,246,246,0.85)';
  const inkColor = isDark ? '#E6F8FB' : '#1C1C19';
  const inkSoft = isDark ? 'rgba(230,248,251,0.6)' : 'rgba(28,28,25,0.6)';
  const accent = isDark ? '#22D3EE' : '#2C5BC4';

  return (
    <>
      <iframe
        src="/biography-physics.html"
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', border: 'none', zIndex: 0 }}
        title="Biography"
      />

      {/* Header overlay — matches Awards page layout */}
      <nav
        className="fixed top-0 w-full flex justify-between items-center px-12 py-6 backdrop-blur-xl"
        style={{
          zIndex: 150,
          background: headerBg,
          transition: 'background 0.6s ease, color 0.6s ease',
          borderBottom: `1px solid ${isDark ? 'rgba(230,236,250,0.08)' : 'rgba(28,28,25,0.06)'}`,
        }}
      >
        <div
          onClick={() => navigate('/')}
          className="font-headline text-3xl font-bold tracking-tighter cursor-pointer"
          style={{ color: inkColor, transition: 'color 0.6s ease' }}
        >
          MEMOIR
        </div>

        <div className="flex items-center gap-6">
          {/* Lumos toggle */}
          <button
            onClick={() => {
              const iframe = document.querySelector('iframe[title="Biography"]');
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'biography-toggle-wand' }, '*');
              }
            }}
            title="Toggle Lumos mode (Ctrl+Shift+W)"
            className="material-symbols-outlined text-2xl cursor-pointer"
            style={{
              color: isDark ? accent : inkColor,
              transition: 'color 0.6s ease',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            {isDark ? 'auto_awesome' : 'auto_fix_high'}
          </button>
          <span
            className="material-symbols-outlined text-2xl cursor-pointer"
            style={{ color: inkColor, transition: 'color 0.6s ease' }}
            onClick={() => { if (window.openMenu) window.openMenu(); }}
          >
            menu
          </span>
        </div>
      </nav>
    </>
  );
}
