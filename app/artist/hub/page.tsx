"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Folder, LogOut, Lock, ArrowRight, Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Connect to Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const LinkedCirclesLogo = ({ className = "w-16 h-10", stroke = "currentColor" }) => (
  <svg viewBox="0 0 60 40" fill="none" stroke={stroke} strokeWidth="2" className={className}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="38" cy="20" r="14" />
  </svg>
);

export default function ArtistHub() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [circles, setCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [activeCircle, setActiveCircle] = useState<any>(null);
  const [newCircleTitle, setNewCircleTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    setIsLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      router.push('/artist'); // Kick out if not logged in
      return;
    }

    setUser(session.user);

    // Fetch ONLY this artist's circles
    const { data: circleData } = await supabase
      .from('circles')
      .select('*')
      .eq('artist_id', session.user.id)
      .order('created_at', { ascending: false });

    setCircles(circleData || []);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/artist');
  };

  const createCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleTitle || circles.length >= 3) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('circles')
        .insert([{ title: newCircleTitle, is_live: false, artist_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setCircles([data, ...circles]);
      setNewCircleTitle('');
      setActiveCircle(data); // Open it immediately
    } catch (error) {
      console.error("Error creating circle:", error);
      alert("FAILED TO CREATE CIRCLE.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center font-mono text-xs tracking-widest uppercase text-zinc-400">Verifying Identity...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-500">
      
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">AURA</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hidden md:block">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-black hover:text-red-600 transition-colors flex items-center gap-2">
            Logout <LogOut size={12} />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: The Circle Manager */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Your Circles</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {circles.length} OF 3 SLOTS USED
            </p>
          </div>

          <div className="space-y-4">
            {circles.map(circle => (
              <button 
                key={circle.id}
                onClick={() => setActiveCircle(circle)}
                className={`w-full text-left p-6 border-2 transition-all flex items-center justify-between group ${activeCircle?.id === circle.id ? 'border-black bg-black text-white' : 'border-black bg-white hover:bg-zinc-100 text-black'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder size={18} className={activeCircle?.id === circle.id ? 'text-white' : 'text-zinc-400 group-hover:text-black'} />
                  <span className="font-bold uppercase tracking-tight truncate max-w-[150px]">{circle.title}</span>
                </div>
                {circle.is_live ? (
                  <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                ) : (
                  <Lock size={14} className={activeCircle?.id === circle.id ? 'text-zinc-400' : 'text-zinc-300'} />
                )}
              </button>
            ))}

            {circles.length < 3 && (
              <form onSubmit={createCircle} className="border-2 border-dashed border-zinc-300 bg-transparent p-4 flex flex-col gap-4 focus-within:border-black transition-colors">
                <input 
                  type="text" 
                  placeholder="NEW CIRCLE NAME" 
                  required
                  className="w-full bg-transparent border-b-2 border-zinc-200 py-2 font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                  value={newCircleTitle}
                  onChange={(e) => setNewCircleTitle(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="w-full bg-zinc-100 text-black py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={14} /> Forge Circle
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: The Circle Interior (Vault) */}
        <div className="lg:col-span-2">
          {!activeCircle ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-center p-12">
              <Folder size={48} className="text-zinc-200 mb-6" />
              <h3 className="font-serif text-2xl font-bold mb-2 text-zinc-400">No Circle Selected</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Select a Circle from the left panel to manage artifacts.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 border-2 border-black bg-white p-8 md:p-12">
              <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ACTIVE DIRECTORY</p>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">{activeCircle.title}</h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-2 ${activeCircle.is_live ? 'border-[#4ade80] text-[#4ade80]' : 'border-zinc-300 text-zinc-500'}`}>
                    {activeCircle.is_live ? 'LIVE' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Artifact Upload Zone Placeholder */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Music size={14} /> Encrypted Artifacts (0/10)
                  </h3>
                  <button className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#ff3300] hover:text-black transition-colors">
                    + Upload Artifact
                  </button>
                </div>
                
                <div className="py-12 flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 text-zinc-400">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4">VAULT IS EMPTY</p>
                  <button className="bg-black text-white px-6 py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-[#ff3300] transition-colors flex items-center gap-2">
                    <Plus size={14} /> Add First Track
                  </button>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="mt-16 pt-8 border-t-2 border-zinc-100">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest mb-4">Delivery Protocol</h3>
                <button className="w-full bg-zinc-100 text-black py-4 font-bold text-xs uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3">
                  TRANSMIT CIRCLE TO FANS <ArrowRight size={16} />
                </button>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  );
}
