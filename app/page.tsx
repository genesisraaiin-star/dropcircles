"use client";
import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, Radio } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Connect to the Supabase Database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LinkedCirclesLogo = ({ className = "w-16 h-10", stroke = "currentColor" }) => (
  <svg viewBox="0 0 60 40" fill="none" stroke={stroke} strokeWidth="2" className={className}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="38" cy="20" r="14" />
  </svg>
);

export default function AuraApp() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [formMode, setFormMode] = useState<'unlock' | 'request'>('unlock');
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied' | 'success'>('idle');
  const [serverError, setServerError] = useState('');
  
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('drop');

  const [vaultTracks, setVaultTracks] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isUnlocked && activeTab === 'drop') {
      fetchVaultTracks();
    }
  }, [isUnlocked, activeTab]);

  const fetchVaultTracks = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVaultTracks(data || []);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const triggerDrop = async (circleId: string, trackTitle: string) => {
    const confirmDrop = window.confirm(`ARE YOU SURE YOU WANT TO MAKE "${trackTitle}" LIVE?`);
    if (!confirmDrop) return;

    try {
      const { error } = await supabase
        .from('circles')
        .update({ is_live: true })
        .eq('id', circleId);

      if (error) throw error;
      
      alert(`"${trackTitle}" IS NOW LIVE.`);
      fetchVaultTracks(); 
      
    } catch (error) {
      console.error("Failed to make live:", error);
      alert("FAILED TO TRIGGER DROP. TRY AGAIN.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (formMode === 'unlock' && key.trim().toUpperCase() === 'EIGHT') {
      setIsUnlocked(true);
      return;
    }

    if (formMode === 'unlock') {
      if (!key) return;
      setStatus('loading');
      const enteredKey = key.trim().toUpperCase();

      try {
        const { data: keyData, error: keyError } = await supabase
          .from('access_keys')
          .select('*')
          .eq('code', enteredKey)
          .single();

        if (keyError || !keyData) {
          setStatus('denied');
          setServerError('ACCESS DENIED. INVALID KEY.');
          return;
        }

        if (keyData.current_uses >= keyData.max_uses) {
          setStatus('denied');
          setServerError('CAPACITY REACHED. THE VAULT IS SEALED.');
          return;
        }

        await supabase
          .from('access_keys')
          .update({ current_uses: keyData.current_uses + 1 })
          .eq('code', enteredKey);

        setIsUnlocked(true);

      } catch (error) {
        setStatus('denied');
        setServerError('NETWORK ERROR. PLEASE RETRY.');
      }
    } else {
      if (!email) return;
      setStatus('loading');
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: 'service_xowlhf8',
            template_id: 'template_v1eu7an',
            user_id: '8AZcPyaE3LqYBe1o6',
            template_params: { fan_email: email }
          }),
        });
        
        if (response.ok) {
          setStatus('success');
          setEmail('');
        } else {
          setStatus('denied');
          setServerError('API REJECTED. PLEASE RETRY.');
        }
      } catch (error) {
        setStatus('denied');
        setServerError('NETWORK ERROR. PLEASE RETRY.');
      }
    }
  };

  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-1000">
        <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
          <div className="flex items-center gap-3">
            <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
            <span className="text-2xl font-serif tracking-tighter mt-1">AURA</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em] hidden md:flex">
            <button onClick={() => setActiveTab('drop')} className={`hover:text-red-600 transition-colors ${activeTab === 'drop' && 'text-red-600 border-b-2 border-red-600'}`}>Control Room</button>
            <button onClick={() => setActiveTab('guestlist')} className={`hover:text-red-600 transition-colors ${activeTab === 'guestlist' && 'text-red-600 border-b-2 border-red-600'}`}>Guestlist</button>
            <button onClick={() => setActiveTab('vault')} className={`hover:text-red-600 transition-colors ${activeTab === 'vault' && 'text-red-600 border-b-2 border-red-600'}`}>Capital</button>
          </div>
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-xs font-bold uppercase tracking-widest">
            ART
          </div>
        </nav>

        <main className="max-w-4xl mx-auto pt-16 px-6">
          <div className="mb-16 border-b-2 border-black pb-12">
            <h1 className="font-serif text-6xl md:text-7xl font-bold tracking-tight mb-4">Launch Console</h1>
            <p className="font-mono text-sm uppercase tracking-widest text-zinc-500 mb-6">[ Secure Release Environment ]</p>
          </div>

          {activeTab === 'drop' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="font-serif text-4xl font-bold mb-6 flex items-center gap-4">
                The Artifacts 
                {isFetching && <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 animate-pulse">Syncing...</span>}
              </h2>
              
              <div className="space-y-0 border-t-2 border-black bg-white">
                {vaultTracks.length === 0 && !isFetching && (
                  <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-zinc-500">
                    THE VAULT IS EMPTY. UPLOAD AN ARTIFACT.
                  </div>
                )}

                {vaultTracks.map((track) => (
                  <div key={track.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-black hover:bg-zinc-50 transition-colors group">
                    <div className="mb-4 sm:mb-0">
                      <h3 className={`font-bold text-xl uppercase tracking-tight ${track.is_live ? 'text-[#4ade80]' : 'text-black'}`}>
                        {track.title}
                      </h3>
                      <p className="text-xs font-mono text-zinc-500 mt-2 uppercase tracking-widest">
                        STATUS: {track.is_live ? 'LIVE (TRANSMITTING)' : 'STANDBY (LOCKED)'}
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      {!track.is_live ? (
                        <button 
                          onClick={() => triggerDrop(track.id, track.title)}
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-2 border-black bg-black text-white hover:bg-[#ff3300] hover:border-[#ff3300] transition-colors flex items-center gap-2"
                        >
                          <Radio size={14} /> Trigger Drop
                        </button>
                      ) : (
                        <span className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-2 border-zinc-200 text-zinc-400 bg-zinc-50">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guestlist' && (
             <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-zinc-500">GUESTLIST DATA MIGRATING...</div>
          )}
          {activeTab === 'vault' && (
             <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-zinc-500">CAPITAL DATA MIGRATING...</div>
          )}
        </main>

        <Link 
          href="/vault" 
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#ff3300] text-white hover:bg-black hover:scale-105 transition-all flex items-center justify-center rounded-none z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
        >
          <Plus size={32} strokeWidth={2} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-1000">
        <LinkedCirclesLogo className="w-16 h-10 text-white opacity-90" />
      </div>

      <main className="w-full max-w-3xl mx-auto flex flex-col items-center mt-8 animate-in fade-in duration-1000 delay-300 fill-mode-both">
        <div className="text-center mb-24 space-y-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1]">
            <span className="text-zinc-600 block hover:text-zinc-400 transition-colors duration-500">No platform.</span>
            <span className="text-zinc-600 block hover:text-zinc-400 transition-colors duration-500">No permission.</span>
            <span className="text-zinc-600 block hover:text-zinc-400 transition-colors duration-500">No performance.</span>
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1]">
            <span className="text-white block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">You create.</span>
            <span className="text-white block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">You invite.</span>
            <span className="text-white block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">You collect.</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6 relative">
          <div className="relative overflow-hidden">
            {formMode === 'unlock' ? (
              <input 
                type="text" 
                placeholder="ENTER ACCESS KEY" 
                className="w-full bg-transparent border-b-2 border-zinc-800 py-4 font-mono text-center text-sm uppercase tracking-[0.3em] focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 text-white animate-in fade-in slide-in-from-bottom-2 duration-300"
                value={key}
                onChange={(e) => { setKey(e.target.value); setStatus('idle'); setServerError(''); }}
              />
            ) : (
              <input 
                type="email" 
                placeholder="ENTER EMAIL ADDRESS" 
                className="w-full bg-transparent border-b-2 border-zinc-800 py-4 font-mono text-center text-sm uppercase tracking-[0.3em] focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 text-white animate-in fade-in slide-in-from-bottom-2 duration-300"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setServerError(''); }}
                required
              />
            )}
          </div>
          
          <button 
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-white text-black py-4 font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {status === 'loading' ? 'PROCESSING...' : status === 'success' ? 'REQUEST RECEIVED' : formMode === 'unlock' ? 'UNLOCK' : 'SUBMIT REQUEST'}
          </button>

          <div className="h-10 flex flex-col items-center justify-start text-center">
            {status === 'denied' && (
              <p className="font-mono text-[10px] text-red-600 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{serverError}</p>
            )}
            {status === 'success' && formMode === 'request' && (
              <p className="font-mono text-[10px] text-[#4ade80] uppercase tracking-widest animate-pulse">POSITION SECURED. WE WILL BE IN TOUCH.</p>
            )}
          </div>
        </form>

        <button 
          onClick={() => { setFormMode(formMode === 'unlock' ? 'request' : 'unlock'); setStatus('idle'); setServerError(''); setKey(''); setEmail(''); }}
          className="mt-12 font-mono text-[10px] text-zinc-400 hover:text-white transition-colors uppercase tracking-[0.2em] pb-1 flex items-center gap-2 group"
        >
          {formMode === 'unlock' ? (
            <><span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">BETA VERSION:</span> REQUEST EARLY ACCESS</>
          ) : (
            <><span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">HAVE A KEY?</span> UNLOCK DROPCIRCLES</>
          )}
        </button>
      </main>
    </div>
  );
}
