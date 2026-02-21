"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Play, Pause, Music, Video, Globe, ArrowRight, ShieldAlert } from 'lucide-react';
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

export default function FanReceiver({ params }: { params: { circleId: string } }) {
  const [circle, setCircle] = useState<any>(null);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Squeeze Engine States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDropData();
  }, [params.circleId]);

  // 1. Fetch the Circle to see if it's Live and has Capacity
  const fetchDropData = async () => {
    setIsLoading(true);
    try {
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', params.circleId)
        .single();

      if (!circleError && circleData) {
        setCircle(circleData);
      }
    } catch (error) {
      console.error("Error fetching drop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. The Squeeze Action: Capture Email and Unlock
  const claimSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !circle) return;

    setJoinStatus('loading');
    setErrorMessage('');

    try {
      // Step A: Attempt to log the fan's email into the roster
      const { error: insertError } = await supabase
        .from('fan_roster')
        .insert([{ circle_id: circle.id, email: email.toLowerCase().trim() }]);

      // Error '23505' means this email already claimed a spot. We just let them back in!
      if (insertError && insertError.code !== '23505') {
        throw insertError;
      }

      // Step B: If it was a BRAND NEW email, tick the counter up by 1
      if (!insertError) {
        await supabase
          .from('circles')
          .update({ claimed_spots: circle.claimed_spots + 1 })
          .eq('id', circle.id);
      }

      // Step C: Unlock the vault and fetch the music!
      setIsUnlocked(true);
      fetchArtifacts();

    } catch (error: any) {
      setJoinStatus('error');
      setErrorMessage("TRANSMISSION FAILED. PLEASE RETRY.");
    }
  };

  // 3. Fetch the encrypted audio once they unlock the gate
  const fetchArtifacts = async () => {
    const { data: artifactData } = await supabase
      .from('artifacts')
      .select('*')
      .eq('circle_id', circle.id)
      .order('created_at', { ascending: true });

    if (artifactData) {
      const artifactsWithUrls = await Promise.all(artifactData.map(async (art) => {
        const { data } = await supabase.storage
          .from('vault')
          .createSignedUrl(art.file_path, 3600); // 1-Hour Self-Destruct
        return { ...art, stream_url: data?.signedUrl };
      }));
      setArtifacts(artifactsWithUrls);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-[10px] tracking-[0.3em] uppercase">
        Establishing Secure Connection...
      </div>
    );
  }

  // ==========================================
  // STATE 1: VAULT IS OFFLINE
  // ==========================================
  if (!circle || !circle.is_live) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
        <LinkedCirclesLogo className="w-16 h-10 text-white opacity-50 mb-12" />
        <Lock size={48} className="mb-8 text-zinc-600" />
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter mb-6">The Vault<br/>is Sealed.</h1>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 max-w-md leading-relaxed">
          THIS DROPCIRCLE IS CURRENTLY OFFLINE. THE ARTIST HAS NOT YET INITIATED THE TRANSMISSION.
        </p>
      </div>
    );
  }

  // ==========================================
  // STATE 2: THE SQUEEZE (Live, but locked)
  // ==========================================
  if (!isUnlocked) {
    const isFull = circle.claimed_spots >= circle.max_capacity;
    const spotsRemaining = circle.max_capacity - circle.claimed_spots;

    return (
      <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
        
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
          <LinkedCirclesLogo className="w-16 h-10 text-black" />
        </div>

        <div className="w-full max-w-lg bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
          
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">EXCLUSIVE ARTIFACT DROP</p>
            <h1 className="font-serif text-5xl font-bold tracking-tighter mb-2">{circle.title}</h1>
            
            {!isFull ? (
              <p className="font-mono text-xs uppercase tracking-widest font-bold text-[#ff3300] bg-[#ff3300]/10 py-2 mt-6 border-2 border-[#ff3300]">
                {spotsRemaining} / {circle.max_capacity} SPOTS REMAINING
              </p>
            ) : (
              <p className="font-mono text-xs uppercase tracking-widest font-bold text-zinc-500 bg-zinc-100 py-2 mt-6 border-2 border-zinc-300 flex items-center justify-center gap-2">
                <ShieldAlert size={14} /> CAPACITY REACHED
              </p>
            )}
          </div>

          {!isFull ? (
            <form onSubmit={claimSpot} className="space-y-6">
              <input 
                type="email" 
                placeholder="ENTER EMAIL TO UNLOCK" 
                required
                className="w-full bg-transparent border-b-4 border-black py-4 font-mono text-center text-sm uppercase tracking-[0.2em] focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                type="submit"
                disabled={joinStatus === 'loading'}
                className="w-full bg-black text-white py-5 font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#ff3300] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {joinStatus === 'loading' ? 'VERIFYING...' : 'CLAIM SPOT & UNLOCK VAULT'}
                {!joinStatus && <ArrowRight size={16} />}
              </button>
              {joinStatus === 'error' && (
                <p className="font-mono text-[10px] text-red-600 uppercase tracking-widest mt-2">{errorMessage}</p>
              )}
            </form>
          ) : (
            <div className="pt-6 border-t-2 border-zinc-100 mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 leading-relaxed">
                THE GUESTLIST FOR THIS CIRCLE IS CLOSED. NO FURTHER TRANSMISSIONS WILL BE GRANTED.
              </p>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 3: THE VAULT IS UNLOCKED (Play Music)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-1000">
      
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">AURA</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#4ade80]/20 text-black border-2 border-[#4ade80] font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <Globe size={12} /> ENCRYPTED CONNECTION
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-24 px-6">
        
        <div className="mb-20 text-center border-b-2 border-black pb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6">VAULT UNLOCKED FOR: {email.toUpperCase()}</p>
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter mb-6">{circle.title}</h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff3300] font-bold">
            THESE LINKS WILL SELF-DESTRUCT IN 60 MINUTES. DO NOT REFRESH.
          </p>
        </div>

        <div className="space-y-6">
          {artifacts.length === 0 ? (
            <p className="text-center font-mono text-xs uppercase tracking-widest text-zinc-500">NO ARTIFACTS FOUND IN THIS CIRCLE.</p>
          ) : (
            artifacts.map((artifact) => (
              <div key={artifact.id} className="border-4 border-black bg-white p-6 md:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3300] transition-colors">
                    {artifact.file_type?.includes('video') ? <Video size={24} /> : <Music size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl uppercase tracking-tight">{artifact.title}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-2">
                      {artifact.file_type?.includes('video') ? 'VISUAL FEED // ENCRYPTED' : 'LOSSLESS AUDIO // ENCRYPTED'}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex-shrink-0">
                  {artifact.file_type?.includes('video') ? (
                    <video 
                      src={artifact.stream_url} 
                      controls 
                      controlsList="nodownload"
                      className="w-full md:w-64 border-2 border-black bg-black"
                    />
                  ) : (
                    <audio 
                      src={artifact.stream_url} 
                      controls 
                      controlsList="nodownload"
                      className="w-full md:w-64 outline-none"
                    />
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
