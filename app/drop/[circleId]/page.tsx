"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Play, Pause, Music, Video, Globe, ArrowRight, ShieldAlert, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── EmailJS notification to artist when a fan joins ─────────────────────────
const EMAILJS_SERVICE_ID  = 'service_xowlhf8';
const EMAILJS_TEMPLATE_ID = 'template_5tg1x8o';
const EMAILJS_PUBLIC_KEY  = '8AZcPyaE3LqYBe1o6';

const notifyArtist = async (fanEmail: string, circleTitle: string, spotsRemaining: number) => {
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          fan_email:       fanEmail,
          circle_name:     circleTitle,
          spots_remaining: spotsRemaining,
          timestamp:       new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
        },
      }),
    });
  } catch {
    // notification failure should never block the fan experience
  }
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
const LinkedCirclesLogo = ({ className = "w-16 h-10", stroke = "currentColor" }) => (
  <svg viewBox="0 0 60 40" fill="none" stroke={stroke} strokeWidth="2" className={className}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="38" cy="20" r="14" />
  </svg>
);

// ─── Watermark overlay ────────────────────────────────────────────────────────
const Watermark = ({ email }: { email: string }) => (
  <div
    className="absolute inset-0 pointer-events-none select-none z-10 flex items-end justify-end p-3"
    style={{ userSelect: 'none' }}
  >
    <span
      className="font-mono text-[9px] uppercase tracking-widest opacity-25 text-black bg-white/60 px-2 py-1"
      style={{ userSelect: 'none', letterSpacing: '0.15em' }}
    >
      {email}
    </span>
  </div>
);

// ─── Custom Audio Player ──────────────────────────────────────────────────────
const CustomAudioPlayer = ({ src, email, onPlay, onPause, onEnded }: {
  src: string;
  email: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (audioRef.current.duration / 100) * val;
      setProgress(val);
    }
  };

  const formatTime = (t: number) => {
    if (isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="relative w-full md:w-80 flex flex-col gap-2 bg-zinc-100 p-4 border-2 border-black select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Watermark email={email} />
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => { setIsPlaying(false); onPause?.(); onEnded?.(); }}
      />
      <div className="flex items-center gap-4 relative z-20">
        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-[#ff3300] transition-colors flex-shrink-0"
        >
          {isPlaying
            ? <Pause size={20} fill="currentColor" />
            : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-zinc-300 appearance-none cursor-pointer accent-black"
          />
          <div className="flex justify-between font-mono text-[9px] text-zinc-500 font-bold tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FanReceiver({ params }: { params: { circleId: string } }) {
  const [circle, setCircle]       = useState<any>(null);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [email, setEmail]         = useState('');
  const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'error' | 'expired'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalListenTime, setTotalListenTime] = useState(0);
  const [completedTracks, setCompletedTracks] = useState(0);
  const listenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listenSecondsRef = useRef(0);

  useEffect(() => { fetchDropData(); }, [params.circleId]);

  // Block right-click globally on this page once unlocked
  useEffect(() => {
    if (!isUnlocked) return;
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, [isUnlocked]);

  const fetchDropData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .eq('id', params.circleId)
        .single();
      if (!error && data) setCircle(data);
    } catch { /* noop */ } finally {
      setIsLoading(false);
    }
  };

  const claimSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !circle) return;
    setJoinStatus('loading');
    setErrorMessage('');

    const cleanEmail = email.toLowerCase().trim();

    try {
      // Check if this email already claimed a spot — if so, session is expired, deny re-entry
      const { data: existing } = await supabase
        .from('fan_roster')
        .select('id')
        .eq('circle_id', circle.id)
        .eq('email', cleanEmail)
        .single();

      if (existing) {
        setJoinStatus('expired');
        setErrorMessage('SESSION EXPIRED. THIS VAULT DOES NOT REOPEN.');
        return;
      }

      const { error: insertError } = await supabase
        .from('fan_roster')
        .insert([{ circle_id: circle.id, email: cleanEmail }]);

      if (insertError) throw insertError;

      await supabase
        .from('circles')
        .update({ claimed_spots: circle.claimed_spots + 1 })
        .eq('id', circle.id);

      // Fire EmailJS notification to artist (non-blocking)
      const spotsLeft = circle.max_capacity - (circle.claimed_spots + 1);
      notifyArtist(cleanEmail, circle.title, Math.max(0, spotsLeft));

      setIsUnlocked(true);
      fetchArtifacts();

    } catch {
      setJoinStatus('error');
      setErrorMessage('TRANSMISSION FAILED. PLEASE RETRY.');
    }
  };

  // ─── Lockout logic ───────────────────────────────────────────────────────────
  // Timer is a PAUSE PENALTY clock — only runs while paused.
  // If they pause for 30s without resuming, vault seals permanently.
  // Playing freely / finishing tracks is allowed with no penalty.

  const triggerLockout = () => {
    if (listenTimerRef.current) clearInterval(listenTimerRef.current);
    listenTimerRef.current = null;
    setIsLockedOut(true);
  };

  // Track completed — no lockout, let them finish
  const onTrackCompleted = () => {
    pauseListenTimer(); // clear any pause timer if somehow running
  };

  // Called on pause — starts the 30s penalty countdown
  const startListenTimer = () => {
    if (listenTimerRef.current) return; // already counting
    listenSecondsRef.current = 0;
    listenTimerRef.current = setInterval(() => {
      listenSecondsRef.current += 1;
      setTotalListenTime(listenSecondsRef.current);
      if (listenSecondsRef.current >= 30) triggerLockout();
    }, 1000);
  };

  // Called on play/resume — cancels the pause penalty
  const pauseListenTimer = () => {
    if (listenTimerRef.current) {
      clearInterval(listenTimerRef.current);
      listenTimerRef.current = null;
    }
    listenSecondsRef.current = 0;
    setTotalListenTime(0);
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchArtifacts = async () => {
    const { data } = await supabase
      .from('artifacts')
      .select('*')
      .eq('circle_id', circle.id)
      .order('created_at', { ascending: true });

    if (data) {
      // 15-minute signed URLs — tighter window, harder to share
      const withUrls = await Promise.all(data.map(async (art) => {
        const { data: urlData } = await supabase.storage
          .from('vault')
          .createSignedUrl(art.file_path, 900); // 900s = 15 minutes
        return { ...art, stream_url: urlData?.signedUrl };
      }));
      setArtifacts(withUrls);
    }
  };

  // ── Locked out (transmission ended) ──────────────────────────────────────
  if (isLockedOut) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <LinkedCirclesLogo className="w-16 h-10 text-white opacity-20 mb-16" />
        <div className="space-y-6 max-w-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-600">TRANSMISSION ENDED</p>
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter text-white">
            The Vault<br/>is Dark.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 leading-relaxed pt-4">
            This session has been permanently sealed.<br/>No further access will be granted.
          </p>
        </div>
        <p className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-800">DropCircles</p>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-[10px] tracking-[0.3em] uppercase">
        Establishing Secure Connection...
      </div>
    );
  }

  // ── Circle offline / not found ─────────────────────────────────────────────
  if (!circle || !circle.is_live) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
        <LinkedCirclesLogo className="w-16 h-10 text-white opacity-50 mb-12" />
        <Lock size={48} className="mb-8 text-zinc-600" />
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter mb-6">The Vault<br />is Sealed.</h1>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 max-w-md leading-relaxed">
          THIS DROPCIRCLE IS CURRENTLY OFFLINE. THE ARTIST HAS NOT YET INITIATED THE TRANSMISSION.
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700 mt-8">DropCircles</p>
      </div>
    );
  }

  // ── Claim spot gate ────────────────────────────────────────────────────────
  if (!isUnlocked) {
    const isFull        = circle.claimed_spots >= circle.max_capacity;
    const spotsRemaining = Math.max(0, circle.max_capacity - circle.claimed_spots);

    return (
      <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <LinkedCirclesLogo className="w-16 h-10 text-black" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400">DropCircles</span>
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
                {joinStatus === 'idle' && <ArrowRight size={16} />}
              </button>
              {(joinStatus === 'error' || joinStatus === 'expired') && (
                <p className={`font-mono text-[10px] uppercase tracking-widest mt-2 ${joinStatus === 'expired' ? 'text-zinc-500' : 'text-red-600'}`}>
                  {errorMessage}
                </p>
              )}
            </form>
          ) : (
            <div className="pt-6 border-t-2 border-zinc-100 mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 leading-relaxed">
                THE GUESTLIST FOR THIS CIRCLE IS CLOSED. NO FURTHER TRANSMISSIONS WILL BE GRANTED.
              </p>
            </div>
          )}

          {/* Download protection notice */}
          <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-center gap-2 text-zinc-400">
            <Shield size={12} />
            <span className="font-mono text-[9px] uppercase tracking-widest">VAULT-PROTECTED CONTENT</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Unlocked vault ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-1000"
      onContextMenu={(e) => e.preventDefault()}
    >
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">DropCircles</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#4ade80]/20 text-black border-2 border-[#4ade80] font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">
          <Globe size={12} /> ENCRYPTED CONNECTION
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-24 px-6">
        <div className="mb-20 text-center border-b-2 border-black pb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6">
            VAULT UNLOCKED FOR: {email.toUpperCase()}
          </p>
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tighter mb-6">{circle.title}</h1>

          {/* Scarcity warning — intentional, links expire in 15 min */}
          <div className="inline-flex flex-col items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff3300] font-bold">
              THESE LINKS EXPIRE IN 15 MINUTES. DO NOT REFRESH.
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1">
              <Shield size={10} /> WATERMARKED · VAULT-PROTECTED · NON-TRANSFERABLE
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {artifacts.length === 0 ? (
            <p className="text-center font-mono text-xs uppercase tracking-widest text-zinc-500">
              NO ARTIFACTS FOUND IN THIS CIRCLE.
            </p>
          ) : (
            artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="border-4 border-black bg-white p-6 md:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3300] transition-colors">
                    {artifact.file_type?.includes('video') ? <Video size={24} /> : <Music size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl uppercase tracking-tight">{artifact.title}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-2">
                      {artifact.file_type?.includes('video') ? 'VISUAL FEED // ENCRYPTED' : 'LOSSLESS AUDIO // ENCRYPTED'}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 mt-1 flex items-center gap-1">
                      <Shield size={9} /> {email.toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Media player — protected */}
                <div className="w-full md:w-auto flex-shrink-0 relative" onContextMenu={(e) => e.preventDefault()}>
                  {artifact.file_type?.includes('video') ? (
                    <div className="relative w-full md:w-72">
                      <video
                        src={artifact.stream_url}
                        controls
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        onPlay={pauseListenTimer}
                        onPause={startListenTimer}
                        onEnded={onTrackCompleted}
                        className="w-full border-2 border-black bg-black"
                        style={{ userSelect: 'none' }}
                      />
                      <Watermark email={email} />
                    </div>
                  ) : (
                    <CustomAudioPlayer
                      src={artifact.stream_url}
                      email={email}
                      onPlay={pauseListenTimer}
                      onPause={startListenTimer}
                      onEnded={onTrackCompleted}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t-2 border-zinc-200 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 flex items-center justify-center gap-2">
            <Shield size={10} /> This session is watermarked to {email.toLowerCase()} · Unauthorized distribution violates access terms
          </p>
        </div>
      </main>
    </div>
  );
}
