"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, Lock } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ArtistLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("SYSTEM HALTED: Vercel is missing Supabase Environment Variables.");
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        router.push('/artist/hub');
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Auth check failed:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push('/artist/hub');
    } catch (err: any) {
      setError("AUTHORIZATION DENIED: " + err.message);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em]">
        INITIALIZING WORKSPACE...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in duration-500">
        <Lock size={32} className="mx-auto mb-6 text-black" />
        <h1 className="font-serif text-4xl font-bold tracking-tighter mb-2">DropCircles</h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-8">SECURE VISIONARY TERMINAL</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" 
            placeholder="EMAIL DESIGNATION" 
            required
            className="w-full bg-transparent border-b-2 border-zinc-300 py-3 font-mono text-center text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-black transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="PASSPHRASE" 
            required
            className="w-full bg-transparent border-b-2 border-zinc-300 py-3 font-mono text-center text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-black transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="submit"
            className="w-full bg-black text-white py-4 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#ff3300] transition-colors flex items-center justify-center gap-3"
          >
            AUTHORIZE <ArrowRight size={14} />
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 border-2 border-red-200 bg-red-50 text-red-600 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
