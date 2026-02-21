"use client";
import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';

export default function AuraApp() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied'>('idle');
  const [activeTab, setActiveTab] = useState('drop');

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    
    setStatus('loading');
    
    setTimeout(() => {
      const enteredKey = key.trim().toUpperCase();
      if (enteredKey === 'EIGHT' || enteredKey === 'NOCHECK') {
        setIsUnlocked(true);
      } else {
        setStatus('denied');
      }
    }, 1200);
  };

  // ==========================================
  // VIEW 1: THE DASHBOARD (Unlocked State)
  // ==========================================
  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-1000">
        <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif tracking-tighter">∞ AURA</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em] hidden md:flex">
            <button onClick={() => setActiveTab('drop')} className={`hover:text-red-600 transition-colors ${activeTab === 'drop' && 'text-red-600 border-b-2 border-red-600'}`}>The Drop</button>
            <button onClick={() => setActiveTab('guestlist')} className={`hover:text-red-600 transition-colors ${activeTab === 'guestlist' && 'text-red-600 border-b-2 border-red-600'}`}>Circles</button>
            <button onClick={() => setActiveTab('vault')} className={`hover:text-red-600 transition-colors ${activeTab === 'vault' && 'text-red-600 border-b-2 border-red-600'}`}>Vault</button>
          </div>
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-xs font-bold uppercase tracking-widest">
            SNY
          </div>
        </nav>

        <main className="max-w-4xl mx-auto pt-16 px-6">
          <div className="mb-16 border-b-2 border-black pb-12">
            <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight mb-4">DropCircle UI</h1>
            <p className="font-mono text-sm uppercase tracking-widest text-zinc-500 mb-6">[ Secure Release Environment ]</p>
            <div className="flex gap-3 font-mono uppercase text-xs font-bold">
              <span className="px-3 py-1 bg-black text-white">Artist Mode</span>
              <span className="px-3 py-1 border-2 border-black text-black">Fan View</span>
            </div>
          </div>

          {activeTab === 'drop' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="font-serif text-4xl font-bold mb-6">The Artifacts</h2>
              
              <div className="space-y-0 border-t-2 border-black bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-black hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-bold text-xl uppercase tracking-tight group-hover:text-red-600 transition-colors">No Check (Rough Draft)</h3>
                    <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-widest">WAV // 44.1kHz // WATERMARKED</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-black bg-black text-white">Boardroom</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-black hover:bg-zinc-50 transition-colors cursor-pointer group">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-bold text-xl uppercase tracking-tight group-hover:text-red-600 transition-colors">Rain Screen Visuals</h3>
                    <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-widest">MP4 // 1080p // WATERMARKED</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-black bg-transparent text-black">Studio</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guestlist' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="font-serif text-4xl font-bold mb-12">The Communion</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black bg-white">
                <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col h-full hover:bg-black hover:text-white transition-colors group">
                  <h3 className="font-serif text-3xl font-bold mb-2">The Boardroom</h3>
                  <p className="font-mono text-[10px] tracking-widest text-zinc-400 mb-8 uppercase">Industry // A&R</p>
                  <ul className="space-y-4 text-xs flex-1 font-mono uppercase tracking-widest">
                    <li>[+] Lossless WAVs</li>
                    <li>[+] Voice Notes</li>
                  </ul>
                </div>
                <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-col h-full bg-black text-white hover:bg-white hover:text-black transition-colors">
                  <h3 className="font-serif text-3xl font-bold mb-2">The Studio</h3>
                  <p className="font-mono text-[10px] tracking-widest text-zinc-500 mb-8 uppercase">Collaborators</p>
                  <ul className="space-y-4 text-xs flex-1 font-mono uppercase tracking-widest">
                    <li>[+] Stream Only</li>
                    <li>[+] A/B Voting</li>
                  </ul>
                </div>
                <div className="p-8 flex flex-col h-full hover:bg-[#ff3300] hover:text-white transition-colors">
                  <h3 className="font-serif text-3xl font-bold mb-2">Front Row</h3>
                  <p className="font-mono text-[10px] tracking-widest text-zinc-500 mb-8 uppercase">Super Fans</p>
                  <ul className="space-y-4 text-xs flex-1 font-mono uppercase tracking-widest">
                    <li>[+] Subscriptions</li>
                    <li>[+] Fund Drops</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="animate-in fade-in duration-300">
               <h2 className="font-serif text-4xl font-bold mb-12">The Vault</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 border-2 border-black bg-white flex flex-col justify-between h-72">
                  <div>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Capital Generated</p>
                    <h1 className="font-serif text-7xl font-bold tracking-tighter">$14.2k</h1>
                  </div>
                  <button className="w-full flex items-center justify-between px-6 py-4 bg-black text-white font-mono text-xs uppercase tracking-widest hover:bg-[#ff3300] transition-colors">
                    <span>Initiate Transfer</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="p-8 border-2 border-black bg-white flex flex-col h-72">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest mb-6">Top Providers</h3>
                  <div className="space-y-4 flex-1 overflow-y-auto font-mono text-xs uppercase tracking-widest">
                      <div className="flex justify-between border-b border-zinc-200 pb-3">
                        <span className="text-zinc-500">Alex Mercer</span>
                        <span className="font-bold text-black">$500</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200 pb-3">
                        <span className="text-zinc-500">Sarah Jenkins</span>
                        <span className="font-bold text-black">$120</span>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#ff3300] text-white hover:bg-black hover:scale-105 transition-all flex items-center justify-center rounded-none z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
          <Plus size={32} strokeWidth={2} />
        </button>

        <footer className="fixed bottom-4 left-6 font-mono text-[10px] text-zinc-400 uppercase tracking-[0.3em]">
          E.I.G.H.T.
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE HYPE GATE (Locked State)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ff3300] selection:text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Texture / Grain effect (CSS simulated) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <nav className="flex justify-between items-start border-b border-zinc-800 pb-6 relative z-10">
        <div className="font-serif text-3xl tracking-tighter">∞ AURA</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3300]">
          [ System Locked ]
        </div>
      </nav>

      <main className="w-full mx-auto flex flex-col justify-center mt-12 mb-20 animate-in fade-in duration-1000 relative z-10 lg:pl-12">
        
        <h1 className="font-serif text-7xl md:text-9xl font-bold uppercase tracking-tighter mb-16 leading-none">
          Strictly <br/>
          <span className="text-transparent border-text" style={{ WebkitTextStroke: '2px white' }}>Confidential.</span>
        </h1>
        
        {/* THE MANIFESTO (Poetic Teaser) */}
        <div className="font-mono text-xs md:text-sm uppercase tracking-widest mb-20 max-w-2xl flex flex-col gap-8">
          
          <div className="border-l-2 border-[#ff3300] pl-6 py-1">
            <span className="text-white block mb-2 font-bold">[01] The Artifact</span>
            <span className="text-zinc-500 leading-loose">Audio severed from the algorithm. <br/>Watermarked. Ephemeral. Immutable.</span>
          </div>

          <div className="border-l-2 border-white pl-6 py-1">
            <span className="text-white block mb-2 font-bold">[02] The Communion</span>
            <span className="text-zinc-500 leading-loose">Audiences are not metrics. They are circles. <br/>The Boardroom. The Studio. The Front Row.</span>
          </div>

          <div className="border-l-2 border-zinc-700 pl-6 py-1">
            <span className="text-white block mb-2 font-bold">[03] The Vault</span>
            <span className="text-zinc-500 leading-loose">Capital without intermediaries. <br/>Value transferred directly from blood to heart.</span>
          </div>

        </div>

        {/* TERMINAL INPUT */}
        <form onSubmit={handleAccess} className="w-full max-w-md flex flex-col gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#ff3300]">{'>'}</span>
            <input 
              type="text" 
              placeholder="ENTER BETA KEY" 
              className="w-full bg-zinc-950 border-2 border-zinc-800 py-5 pl-12 pr-4 font-mono text-lg uppercase tracking-[0.2em] focus:outline-none focus:border-[#ff3300] transition-colors placeholder:text-zinc-800 text-white"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setStatus('idle');
              }}
            />
          </div>
          
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-white text-black py-5 font-mono font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#ff3300] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {status === 'loading' ? 'Authenticating...' : 'Initiate Access'}
          </button>

          <div className="h-6 mt-2">
            {status === 'denied' && (
              <p className="font-mono text-[10px] text-[#ff3300] uppercase tracking-widest animate-pulse">
                ERR: Unrecognized clearance code.
              </p>
            )}
          </div>
        </form>

        <button className="mt-12 font-mono text-[10px] text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.2em] text-left w-fit flex items-center gap-2 group">
          <span className="w-4 h-[1px] bg-zinc-600 group-hover:bg-white transition-colors"></span>
          Petition for Entry
        </button>
      </main>

      <footer className="flex flex-col md:flex-row justify-between items-end gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 border-t border-zinc-900 pt-8 relative z-10">
        <div>
          <span className="text-white">AURA</span> // V.0.1.0<br/>
          &copy; 2026
        </div>
        <div className="text-right">
          Experience Infinite<br/>Greatness Here Today
        </div>
      </footer>
    </div>
  );
}
