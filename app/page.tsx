"use client";
import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';

export default function DropCircleDashboard() {
  const [activeTab, setActiveTab] = useState('drop');

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* Top Navigation - Utilitarian */}
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-serif tracking-tighter">∞ AURA</span>
        </div>
        <div className="flex gap-6 text-sm font-bold uppercase tracking-widest">
          <button onClick={() => setActiveTab('drop')} className={`hover:underline underline-offset-4 decoration-2 ${activeTab === 'drop' && 'underline'}`}>The Drop</button>
          <button onClick={() => setActiveTab('guestlist')} className={`hover:underline underline-offset-4 decoration-2 ${activeTab === 'guestlist' && 'underline'}`}>Circles</button>
          <button onClick={() => setActiveTab('vault')} className={`hover:underline underline-offset-4 decoration-2 ${activeTab === 'vault' && 'underline'}`}>Vault</button>
        </div>
        <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-bold uppercase">
          SNY
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-16 px-6">
        {/* Screenshot Header Integration */}
        <div className="mb-16 border-b-2 border-black pb-12">
          <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight mb-4">DropCircle UI</h1>
          <p className="font-serif text-2xl md:text-3xl mb-6">Private releases. Real feedback. Paid drops.</p>
          <div className="flex gap-3 font-sans">
            <span className="px-3 py-1 bg-zinc-200 text-sm rounded-full font-medium">Artist</span>
            <span className="px-3 py-1 bg-zinc-200 text-sm rounded-full font-medium">Fan</span>
          </div>
        </div>

        {/* --- TAB: THE DROP --- */}
        {activeTab === 'drop' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-serif text-4xl font-bold mb-6">Artist Dashboard</h2>
            <p className="font-serif text-xl mb-12">Upload &rarr; Choose Circle &rarr; Publish &rarr; Share.</p>
            
            <div className="space-y-0 border-t-2 border-black">
              {['No Check (Rough Draft)', 'No Check (Studio Mix)', 'Rain Screen Visuals'].map((track, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-black hover:bg-zinc-100 transition-colors cursor-pointer">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="font-bold text-xl uppercase tracking-tight text-red-600">{track}</h3>
                    <p className="text-sm font-mono text-zinc-500 mt-1">WAV • 44.1kHz • WATERMARKED</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 text-xs font-bold uppercase border border-black bg-black text-white">Boardroom</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: GUEST LIST (CIRCLES) --- */}
        {activeTab === 'guestlist' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-serif text-4xl font-bold mb-12">Distribution Circles</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Boardroom */}
              <div className="p-8 border-2 border-black bg-black text-white flex flex-col h-full">
                <h3 className="font-serif text-3xl font-bold mb-2">The Boardroom</h3>
                <p className="font-mono text-xs text-zinc-400 mb-8 uppercase">Industry & A&R</p>
                <ul className="space-y-4 text-sm flex-1 font-mono">
                  <li>+ Lossless WAVs</li>
                  <li>+ Voice Notes</li>
                </ul>
                <button className="mt-8 w-full py-3 border border-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-sm">Edit Access</button>
              </div>

              {/* Studio */}
              <div className="p-8 border-2 border-black bg-zinc-200 text-black flex flex-col h-full">
                <h3 className="font-serif text-3xl font-bold mb-2">The Studio</h3>
                <p className="font-mono text-xs text-zinc-500 mb-8 uppercase">Collaborators</p>
                <ul className="space-y-4 text-sm flex-1 font-mono">
                  <li>+ Stream Only</li>
                  <li>+ A/B Voting</li>
                </ul>
                <button className="mt-8 w-full py-3 border border-black hover:bg-black hover:text-white transition-colors font-bold uppercase text-sm">Edit Access</button>
              </div>

              {/* Front Row */}
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

        {/* --- TAB: VAULT --- */}
        {activeTab === 'vault' && (
          <div className="animate-in fade-in duration-300">
             <h2 className="font-serif text-4xl font-bold mb-12">The Vault</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance */}
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

              {/* Splits */}
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
                    <div className="flex justify-between border-b border-black pb-2">
                      <span>David Chen</span>
                      <span className="font-bold">$90</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action - Brutalist Box */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all flex items-center justify-center rounded-none z-50">
        <Plus size={32} strokeWidth={2} />
      </button>

      <footer className="fixed bottom-4 left-6 font-mono text-xs text-zinc-400 uppercase tracking-widest">
        E.I.G.H.T.
      </footer>
    </div>
  );
}
