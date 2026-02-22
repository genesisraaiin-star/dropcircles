"use client";
import React, { useState } from 'react';
import { ArrowRight, Lock as LockIcon } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LinkedCirclesLogo = ({ className = "w-16 h-10", stroke = "currentColor" }) => (
  <svg viewBox="0 0 60 40" fill="none" stroke={stroke} strokeWidth="2" className={className}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="38" cy="20" r="14" />
  </svg>
);

export default function DropCirclesApp() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [formMode, setFormMode] = useState<'unlock' | 'request'>('unlock');
  const [status, setStatus] = useState<'idle' | 'loading' | 'denied' | 'success'>('idle');
  const [serverError, setServerError] = useState('');
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

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

      } catch {
        setStatus('denied');
        setServerError('NETWORK ERROR. PLEASE RETRY.');
      }

    } else {
      // WAITLIST — actually save to Supabase, not just a fake success
      if (!email) return;
      setStatus('loading');
      const cleanEmail = email.toLowerCase().trim();

      try {
        const { error } = await supabase
          .from('waitlist')
          .insert([{
            email: cleanEmail,
            source: 'landing_page',
            created_at: new Date().toISOString(),
          }]);

        // Ignore duplicate error — already on the list is fine
        if (error && error.code !== '23505') throw error;

        setStatus('success');
        setEmail('');
      } catch {
        setStatus('denied');
        setServerError('SUBMISSION FAILED. PLEASE RETRY.');
      }
    }
  };

  if (isUnlocked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs tracking-widest uppercase">
        ACCESS GRANTED. INITIALIZING TERMINAL...
        <meta httpEquiv="refresh" content="2;url=/artist" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col items-center py-24 px-6 relative overflow-x-hidden">

      <div className="absolute top-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-1000 flex flex-col items-center gap-2">
        <LinkedCirclesLogo className="w-16 h-10 text-white opacity-90" />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">DropCircles</span>
      </div>

      <main className="w-full max-w-4xl mx-auto flex flex-col items-center mt-16 animate-in fade-in duration-1000 delay-300 fill-mode-both">

        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-6xl md:text-[8rem] font-serif font-bold tracking-tighter mb-12">
            INVITE ONLY
          </h1>

          <div className="flex flex-col items-center text-center space-y-10 mb-16 w-full">
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400">
              THE ECOSYSTEM IS CURRENTLY LOCKED.
            </p>

            <div className="border-l border-zinc-700 pl-6 text-left space-y-4 py-2 mx-auto">
              <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-300 leading-relaxed">
                [01] A CLOSED-CIRCUIT<br />INFRASTRUCTURE.
              </p>
              <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-300">
                [02] ZERO LEAKS. ZERO ALGORITHMS.
              </p>
              <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-300">
                [03] DIRECT-TO-VAULT DROPS.
              </p>
            </div>

            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-500 max-w-sm mx-auto leading-relaxed pt-6">
              BETA ACCESS IS STRICTLY LIMITED TO 100 VISIONARIES.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-8 relative mt-4">
            <div className="relative overflow-hidden">
              {formMode === 'unlock' ? (
                <input
                  type="text"
                  placeholder="ENTER ACCESS KEY"
                  className="w-full bg-transparent border-b border-zinc-700 py-4 font-mono text-center text-xs md:text-sm uppercase tracking-[0.3em] focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600 text-white"
                  value={key}
                  onChange={(e) => { setKey(e.target.value); setStatus('idle'); setServerError(''); }}
                />
              ) : (
                <input
                  type="email"
                  placeholder="ENTER EMAIL ADDRESS"
                  className="w-full bg-transparent border-b border-zinc-700 py-4 font-mono text-center text-xs md:text-sm uppercase tracking-[0.3em] focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600 text-white"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setServerError(''); }}
                  required
                />
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-black text-white border border-white py-5 font-bold text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {status === 'loading' ? 'PROCESSING...' : status === 'success' ? 'POSITION SECURED' : formMode === 'unlock' ? 'UNLOCK' : 'REQUEST ACCESS'}
              {status === 'idle' && <ArrowRight size={16} />}
            </button>

            <div className="h-4 flex flex-col items-center justify-start text-center">
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
            className="mt-16 font-mono text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em] border-b border-zinc-700 hover:border-white pb-1"
          >
            {formMode === 'unlock' ? "REQUEST A BETA KEY" : "HAVE A KEY? UNLOCK"}
          </button>
        </div>

        <div className="text-center mt-32 space-y-8 opacity-40 hover:opacity-100 transition-opacity duration-700 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            <span className="text-zinc-600 block">No platform.</span>
            <span className="text-zinc-600 block">No permission.</span>
            <span className="text-zinc-600 block">No performance.</span>
          </h2>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            <span className="text-zinc-400 block">You create.</span>
            <span className="text-zinc-400 block">You invite.</span>
            <span className="text-zinc-400 block">You collect.</span>
          </h2>
        </div>

      </main>

      {/* Hidden backdoor for artist access */}
      <Link href="/artist" className="absolute bottom-4 right-4 w-8 h-8 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
        <LockIcon size={12} className="text-zinc-600" />
      </Link>
    </div>
  );
}
