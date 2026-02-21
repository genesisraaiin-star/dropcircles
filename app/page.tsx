"use client";
import React, { useState } from 'react';
import { Upload, ArrowRight, Lock } from 'lucide-react';
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

export default function ArtistVault() {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [visualFile, setVisualFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile) {
      alert("PLEASE ATTACH A MASTER AUDIO FILE.");
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. UPLOAD THE FILE TO STORAGE
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `artifacts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, audioFile);

      if (uploadError) throw uploadError;

      // 2. CREATE THE DROPCIRCLE EVENT (SET TO 'STANDBY / NOT LIVE')
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .insert([{ 
          title: title, 
          is_live: false 
        }])
        .select()
        .single();

      if (circleError) throw circleError;

      // 3. LINK THE AUDIO FILE TO THE EVENT
      const { error: artifactError } = await supabase
        .from('artifacts')
        .insert([{
          circle_id: circleData.id,
          title: title,
          file_path: filePath,
          file_type: audioFile.type || 'audio/mpeg'
        }]);

      if (artifactError) throw artifactError;

      // SUCCESS! RESET THE FORM.
      setAudioFile(null);
      setVisualFile(null);
      setTitle('');
      
      alert("ARTIFACT SECURED ON STANDBY. AWAITING MANUAL DROP.");
      
    } catch (error: any) {
      console.error("Upload Failed:", error);
      alert(`UPLOAD FAILED: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-1000">
      
      {/* UPDATED NAVIGATION WITH LINKS */}
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <Link href="/" className="flex items-center gap-3 hover:opacity-50 transition-opacity">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">AURA</span>
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-[10px] font-mono uppercase tracking-[0.2em] text-black hover:text-[#ff3300] transition-colors hidden md:block font-bold">
            ← Return to Control Room
          </Link>
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-xs font-bold uppercase tracking-widest">
            ART
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto pt-24 px-6">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6">
            Forge the<br />DropCircle.
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            <Lock size={14} /> White-Glove Upload Protocol
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-12">
          
          <div className="space-y-4">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 block">
              [01] Artifact Designation
            </label>
            <input 
              type="text" 
              placeholder="TRACK TITLE" 
              required
              className="w-full bg-transparent border-b-4 border-black py-4 font-bold text-3xl md:text-4xl tracking-tighter focus:outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            
            <div className="border-4 border-black bg-white p-8 hover:bg-black hover:text-white transition-colors group cursor-pointer relative">
              <input 
                type="file" 
                accept="audio/wav, audio/mpeg" 
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center justify-center text-center h-40">
                <Upload size={32} className="mb-4 group-hover:-translate-y-2 transition-transform" />
                <h3 className="font-bold text-xl uppercase tracking-tighter mb-2">Master Audio</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">
                  {audioFile ? audioFile.name : "WAV // MP3 (DROP HERE)"}
                </p>
              </div>
            </div>

            <div className="border-4 border-black bg-white p-8 hover:bg-black hover:text-white transition-colors group cursor-pointer relative">
              <input 
                type="file" 
                accept="video/mp4" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setVisualFile(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center justify-center text-center h-40">
                <Upload size={32} className="mb-4 group-hover:-translate-y-2 transition-transform" />
                <h3 className="font-bold text-xl uppercase tracking-tighter mb-2">Visual Loop</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">
                  {visualFile ? visualFile.name : "MP4 // OPTIONAL (DROP HERE)"}
                </p>
              </div>
            </div>

          </div>

          <button 
            type="submit"
            disabled={isUploading}
            className="w-full bg-black text-white py-6 font-bold text-sm uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-12"
          >
            {isUploading ? 'ENCRYPTING ARTIFACTS...' : 'LOCK VAULT IN STANDBY MODE'}
            {!isUploading && <ArrowRight size={18} strokeWidth={2} />}
          </button>

        </form>

      </main>
    </div>
  );
}
