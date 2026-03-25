import React from 'react';
import MusicPlayer from './components/MusicPlayer';
import CarGame from './components/CarGame';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      {/* Background ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] rounded-full bg-green-600/5 blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Neon Cruiser
          </h1>
          <p className="text-gray-400 mt-2 font-mono tracking-widest text-sm">SYNTHWAVE // PHYSICS // V3.0</p>
        </header>

        <main className="flex-1 flex flex-col xl:flex-row items-start justify-center gap-8 xl:gap-12 w-full max-w-7xl mx-auto">
          <div className="w-full xl:w-3/4 flex justify-center order-1">
            <CarGame />
          </div>
          
          <div className="w-full xl:w-1/4 flex justify-center order-2">
            <MusicPlayer />
          </div>
        </main>

        <footer className="mt-12 text-center text-gray-600 font-mono text-xs">
          <p>AI Studio Build // 2026</p>
        </footer>
      </div>
    </div>
  );
}

