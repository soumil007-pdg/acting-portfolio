import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManuscriptCanvas from '../components/ManuscriptCanvas';

export default function DragonPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Grain Overlay */}
      <div className="fixed inset-0 parchment-texture z-[100] pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-8 bg-[#f4eee0]/90 backdrop-blur-xl">
        <button
          className="font-serif text-3xl font-bold tracking-tighter text-[#1C1C19] cursor-pointer hover:text-[#D32F2F] transition-colors duration-500"
          onClick={() => navigate('/biography')}
        >
          MYSELF
        </button>
        <span className="uppercase text-[10px] tracking-[0.35rem] text-[#1C1C19]/40 hidden md:block">
          Illuminated Manuscript
        </span>
        <button
          className="uppercase text-[10px] tracking-[0.35rem] text-[#1C1C19]/40 hover:text-[#D32F2F] transition-colors duration-500 flex items-center gap-2"
          onClick={() => navigate('/biography')}
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </button>
      </header>

      {/* Full-screen dragon canvas */}
      <main className="h-screen w-full pt-[72px]">
        <ManuscriptCanvas />
      </main>
    </>
  );
}
