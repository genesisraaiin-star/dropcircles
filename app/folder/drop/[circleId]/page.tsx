"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Play, Pause, Music, Video, Globe } from 'lucide-react';
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
  const [activeAudio, setActiveAudio] = useState<string | null>(null);

  useEffect(() => {
    fetchDropData();
  }, [params.circleId]);

  const fetchDropData = async () => {
    setIsLoading(true);

    try {
      // 1. Check if the Circle exists and if it is LIVE
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', params.circleId)
        .single();

      if (circleError || !circleData) {
        setIsLoading(false);
        return;
      }

      setCircle(circleData);

      // 2. If it's live, fetch the artifacts and generate 1-hour secure stream links
      if (circleData.is_live) {
        const { data: artifactData } = await supabase
          .from('artifacts')
          .select('*')
          .eq('circle_id', circleData.id)
          .order('created_at', { ascending: true });

        if (artifactData) {
          // Generate Signed URLs so fans can't steal the raw files
          const artifactsWithUrls = await Promise.all(artifactData.map(async (art) => {
            const { data } = await supabase.storage
              .from('vault')
              .createSignedUrl(art.file_path, 3600); // URL self-destructs in 1 hour
            
            return { ...art, stream_url: data?.signedUrl };
          }));
          
          setArtifacts(artifactsWithUrls);
        }
      }
    } catch (error) {
      console.error("Error fetching drop:", error);
    } finally {
      setIsLoading(false);
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
  // STATE 1: VAULT IS OFFLINE / NOT FOUND
  // ==========================================
  if (!circle || !circle.is_live) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
        <LinkedCirclesLogo className="w-16 h-10 text-white opacity-50 mb-12" />
        <Lock size={48} className="mb-8 text-zinc-600" />
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          The Vault<br/>is Sealed.
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 max-w-md leading-relaxed">
          THIS DROPCIRCLE IS CURRENTLY OFFLINE. THE ARTIST HAS NOT YET INITIATED THE TRANSMISSION, OR THE WINDOW HAS CLOSED.
        </p>
      </div>
    );
  }

  // ==========================================
  // STATE 2: VAULT IS LIVE (THE DROP)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-1000">
      
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">AURA</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-black text-white font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <Globe size={12} /> SECURE TRANSMISSION
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-24 px-6">
        
        <div className="mb-20 text-center border-b-2 border-black pb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6">EXCLUSIVE ARTIFACT DROP</p>
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter mb-6">{circle.title}</h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff3300] font-bold">
            THESE LINKS WILL SELF-DESTRUCT. DO NOT REFRESH.
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
