import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close the menu automatically when navigating to a new route
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Expose a global method to open the menu so other components can trigger it
  useEffect(() => {
    window.openMenu = () => setIsOpen(true);
    return () => { delete window.openMenu; };
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[9990] ${isOpen ? 'open' : ''} transition-opacity duration-1200 ease-in-out`}
        id="overlay"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`fixed inset-x-0 top-0 h-screen md:h-[35vh] bg-[#1c1c19] z-[9999] flex flex-col p-8 md:p-12 justify-center shadow-2xl ${isOpen ? 'open' : ''}`}
        id="side-nav"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <button 
          className="absolute top-6 right-8 text-[#fcf9f4] hover:text-primary transition-colors duration-500" 
          onClick={() => setIsOpen(false)}
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>
        
        <div className="mb-6 md:mb-8 staggered-item" style={{ transitionDelay: '0.1s' }}>
          <h2 className="text-5xl md:text-6xl font-headline italic tracking-tighter text-[#fcf9f4]">Soumil</h2>
          <p className="font-body text-[#fcf9f4] opacity-50 mt-2 tracking-widest uppercase text-[10px]">Cinematic Legacy</p>
        </div>
        
        <nav className="flex flex-col md:flex-row md:space-x-12 space-y-4 md:space-y-0">
          <Link to="/" className="staggered-item text-[#fcf9f4] opacity-80 text-3xl font-headline transition-all duration-700 hover:pl-4 md:hover:pl-0 md:hover:-translate-y-2 hover:text-[#a12d22] hover:opacity-100" style={{ transitionDelay: '0.2s' }}>Home</Link>
          <Link to="/focus" className="staggered-item text-[#fcf9f4] opacity-80 text-3xl font-headline transition-all duration-700 hover:pl-4 md:hover:pl-0 md:hover:-translate-y-2 hover:text-[#a12d22] hover:opacity-100" style={{ transitionDelay: '0.3s' }}>Work</Link>
          <Link to="/biography" className="staggered-item text-[#fcf9f4] opacity-80 text-3xl font-headline transition-all duration-700 hover:pl-4 md:hover:pl-0 md:hover:-translate-y-2 hover:text-[#a12d22] hover:opacity-100" style={{ transitionDelay: '0.4s' }}>Biography</Link>
          <Link to="/awards" className="staggered-item text-[#fcf9f4] opacity-80 text-3xl font-headline transition-all duration-700 hover:pl-4 md:hover:pl-0 md:hover:-translate-y-2 hover:text-[#a12d22] hover:opacity-100" style={{ transitionDelay: '0.5s' }}>Awards</Link>
          <Link to="#" className="staggered-item text-[#fcf9f4] opacity-80 text-3xl font-headline transition-all duration-700 hover:pl-4 md:hover:pl-0 md:hover:-translate-y-2 hover:text-[#a12d22] hover:opacity-100" style={{ transitionDelay: '0.6s' }}>Get in touch</Link>
        </nav>
      </div>
    </>
  );
}
