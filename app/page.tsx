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
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-32 animate-in fade-in duration-1000">
        <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif tracking-tighter">∞ AURA</span>
          </div>
          <div className="flex gap-6 text-sm font-bold uppercase tracking-widest hidden md:flex">
            <button onClick={() => setActiveTab('drop')} className={`hover:underline underline-offset-4 decoration-2 ${activeTab === 'drop' && 'underline'}`}>The Drop</button>
            <button onClick={() => setActiveTab('guestlist')} className={`hover:underline underline-offset-4 decoration-2 ${activeTab === 'guestlist' && 'underline'}`}>Circles</button>
            <button onClick={() => setActiveTab('vault')} className={`hover:underline underline-offset-4 decoration-2 ${activeTab === 'vault' && 'underline'}`}>Vault</button>
          </div>
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold uppercase">
            SNY
          </div>
        </nav>

        <main className="max-w-4xl mx-auto pt-16 px-6">
          <div className="mb-16 border-b-2 border-black pb-12">
            <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight mb-4">DropCircle UI</h1>
            <p className="font-serif text-2xl md:text-3xl mb-6">Private releases. Real feedback. Paid drops.</p>
            <div className="flex gap-3 font-sans">
              <span className="px-3 py-1 bg-zinc-200 text-sm rounded-full font-medium">Artist</span>
              <span className="px-3 py-1 bg-zinc-200 text-sm rounded-full font-medium">Fan</span>
            </div>
          </div>

          {activeTab === 'drop' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="font-serif text-4xl font-bold mb-6">Artist Dashboard</h2>
              <p className="font-serif text-xl mb-12">Upload &rarr; Choose Circle &rarr; Publish &rarr; Share.</p>
              
              <div className="space-y-0 border-t-2 border-black">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-black hover:bg-zinc-100 transition-colors cursor-pointer">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-bold text-xl uppercase tracking-tight text-red-600">No Check (Rough Draft)</h3>
                    <p className="text-sm font-mono text-zinc-500 mt-1">WAV • 44.1kHz • WATERMARKED</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 text-xs font-bold uppercase border border-black bg-black text-white">Boardroom</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-black hover:bg-zinc-100 transition-colors cursor-pointer">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-bold text-xl uppercase tracking-tight text-black">Rain Screen Visuals</h3>
                    <p className="text-sm font-mono text-zinc-500 mt-1">MP4 • 1080p • WATERMARKED</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 text-xs font-bold uppercase border border-black bg-zinc-200 text-black">Studio</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guestlist' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="font-serif text-4xl font-bold mb-12">Distribution Circles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 border-2 border-black bg-black text-white flex flex-col h-full">
                  <h3 className="font-serif text-3xl font-bold mb-2">The Boardroom</h3>
                  <p className="font-mono text-xs text-zinc-400 mb-8 uppercase">Industry & A&R</p>
                  <ul className="space-y-4 text-sm flex-1 font-mono">
                    <li>+ Lossless WAVs</li>
                    <li>+ Voice Notes</li>
                  </ul>
                  <button className="mt-8 w-full py-3 border border-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-sm">Edit Access</button>
                </div>
                <div className="p-8 border-2 border-black bg-zinc-200 text-black flex flex-col h-full">
                  <h3 className="font-serif text-3xl font-bold mb-2">The Studio</h3>
                  <p className="font-mono text-xs text-zinc-500 mb-8 uppercase">Collaborators</p>
                  <ul className="space-y-4 text-sm flex-1 font-mono">
                    <li>+ Stream Only</li>
                    <li>+ A/B Voting</li>
                  </ul>
                  <button className="mt-8 w-full py-3 border border-black hover:bg-black hover:text-white transition-colors font-bold uppercase text-sm">Edit Access</button>
                </div>
                <div className="p-8 border-2 border-black bg-white text-black flex flex-col h-full">
                  <h3 className="font-serif text-3xl font-bold mb-2">Front Row</h3>
                  <p className="font-mono text-xs text-zinc-500 mb-8 uppercase">Super Fans</p>
                  <ul className="space-y-4 text-sm flex-1 font-mono">
                    <li>+ Subscriptions</li>
                    <li>+ Fund Drops</li>
                  </ul>
                  <button className="mt-8 w-full py-3 border border-black hover:bg-black hover:text-white transition-colors font-bold uppercase text-sm">Edit Access</button>
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
                    <p className="font-mono text-sm text-zinc-500 uppercase tracking-widest mb-4">Total Revenue</p>
                    <h1 className="font-serif text-7xl font-bold tracking-tighter">$14.2k</h1>
                  </div>
                  <button className="w-full flex items-center justify-between px-6 py-4 bg-black text-white font-bold uppercase text-sm hover:bg-zinc-800 transition-colors">
                    <span>Cash Out</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="p-8 border-2 border-black bg-[#f4f4f0] flex flex-col h-72">
                  <h3 className="font-bold text-xl uppercase mb-6">Top Investors</h3>
                  <div className="space-y-4 flex-1 overflow-y-auto font-mono text-sm">
                      <div className="flex justify-between border-b border-black pb-2">
                        <span>Alex Mercer</span>
                        <span className="font-bold">$500</span>
                      </div>
                      <div className="flex justify-between border-b border-black pb-2">
                        <span>Sarah Jenkins</span>
                        <span className="font-bold">$120</span>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <button className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all flex items-center justify-center rounded-none z-50">
          <Plus size={32} strokeWidth={2} />
        </button>

        <footer className="fixed bottom-4 left-6 font-mono text-xs text-zinc-400 uppercase tracking-widest">
          E.I.G.H.T.
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE HYPE GATE (Locked State)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between p-6 md:p-12">
      <nav className="flex justify-between items-start border-b border-zinc-900 pb-6">
        <div className="font-serif text-3xl tracking-tighter">∞ AURA</div>
        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          [ Phase 1 : Closed ]
        </div>
      </nav>

      <main className="max-w-2xl w-full mx-auto flex flex-col items-center text-center mt-12 mb-20 animate-in fade-in duration-1000">
        <h1 className="font-serif text-6xl md:text-8xl font-bold uppercase tracking-tight mb-8">
          Invite Only
        </h1>
        
        {/* NEW MYSTERIOUS TEASER BLOCK */}
        <div className="font-mono text-xs md:text-sm text-zinc-400 uppercase tracking-widest mb-16 max-w-lg leading-loose space-y-6 flex flex-col items-center">
          <p>The ecosystem is currently locked.</p>
          <div className="border-l border-zinc-700 pl-6 text-left text-zinc-300 w-full max-w-sm space-y-2 py-2">
            <p>[01] A closed-circuit infrastructure.</p>
            <p>[02] Zero leaks. Zero algorithms.</p>
            <p>[03] Direct-to-Vault drops.</p>
          </div>
          <p className="text-zinc-500">Beta access is strictly limited to 100 visionaries.</p>
        </div>

        <form onSubmit={handleAccess} className="w-full max-w-sm flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="ENTER ACCESS KEY" 
            className="w-full bg-transparent border-b-2 border-zinc-800 py-4 px-2 font-mono text-center text-lg uppercase tracking-widest focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setStatus('idle');
            }}
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full border-2 border-white bg-black text-white py-4 mt-6 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
          >
            {status === 'loading' ? 'Verifying...' : 'Unlock'}
            {status !== 'loading' && <ArrowRight size={18} />}
          </button>

          <div className="h-8 mt-4 flex items-center justify-center">
            {status === 'denied' && (
              <p className="font-mono text-xs text-red-600 uppercase tracking-widest animate-pulse">
                Invalid Key. Access Denied.
              </p>
            )}
          </div>
        </form>

        <button className="mt-8 font-mono text-xs text-zinc-600 hover:text-white underline underline-offset-8 decoration-zinc-800 transition-colors uppercase tracking-widest">
          Request A Beta Key
        </button>
      </main>

      <footer className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700 border-t border-zinc-900 pt-6">
        <div>&copy; 2026 AURA</div>
        <div className="text-center hidden md:block text-zinc-500">
          Experience Infinite Greatness Here Today
        </div>
        <div>E.I.G.H.T.</div>
      </footer>
    </div>
  );
}
