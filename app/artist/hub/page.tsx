"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Folder, LogOut, Lock, Globe, Upload, Link as LinkIcon, Edit2, Music, Video, Users, Download, DollarSign, Trash2, Settings, User, Camera, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function VisionaryHub() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [circles, setCircles] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [fans, setFans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [activeCircle, setActiveCircle] = useState<any>(null);
  const [newCircleTitle, setNewCircleTitle] = useState('');
  const [newCircleCapacity, setNewCircleCapacity] = useState('100');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'artifacts' | 'guestlist' | 'capital'>('artifacts');

  // Profile states
  const [profile, setProfile] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { checkUserAndFetchCircles(); }, []);

  const checkUserAndFetchCircles = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) { router.push('/artist'); return; }
      setUser(session.user);

      const [circleRes, profileRes] = await Promise.all([
        supabase.from('circles').select('*').eq('artist_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('artist_profiles').select('*').eq('artist_id', session.user.id).single(),
      ]);

      if (circleRes.data) {
        setCircles(circleRes.data);
        if (circleRes.data.length > 0) handleSelectCircle(circleRes.data[0]);
      }

      if (profileRes.data) {
        setProfile(profileRes.data);
        setProfileName(profileRes.data.name || '');
        setProfileBio(profileRes.data.bio || '');
      }

    } catch (err: any) {
      console.error("Hub Initialization Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCircle = async (circle: any) => {
    setActiveCircle(circle);
    setActiveTab('artifacts');
    try {
      const { data: artifactData } = await supabase.from('artifacts').select('*').eq('circle_id', circle.id).order('created_at', { ascending: true });
      setArtifacts(artifactData || []);
      const { data: fanData } = await supabase.from('fan_roster').select('*').eq('circle_id', circle.id).order('created_at', { ascending: false });
      setFans(fanData || []);
    } catch (error) { console.error("Error fetching circle data:", error); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/artist'); };

  // ── Profile ────────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .upsert({ artist_id: user.id, name: profileName.trim(), bio: profileBio.trim(), updated_at: new Date().toISOString() }, { onConflict: 'artist_id' })
        .select().single();
      if (error) throw error;
      setProfile(data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: any) {
      alert("FAILED TO SAVE PROFILE: " + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('artist_profiles')
        .upsert({ artist_id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'artist_id' })
        .select().single();
      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      alert("AVATAR UPLOAD FAILED: " + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Circles ────────────────────────────────────────────────────────────────
  const createCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleTitle || circles.length >= 3 || !user) return;
    const capacity = parseInt(newCircleCapacity);
    if (isNaN(capacity) || capacity < 1) { alert("CAPACITY MUST BE AT LEAST 1."); return; }
    try {
      const { data, error } = await supabase.from('circles').insert([{ title: newCircleTitle, max_capacity: capacity, is_live: false, artist_id: user.id }]).select().single();
      if (error) throw error;
      if (data) { setCircles([data, ...circles]); setNewCircleTitle(''); setNewCircleCapacity('100'); handleSelectCircle(data); }
    } catch (error: any) { alert("FAILED TO FORGE CIRCLE: " + error.message); }
  };

  const renameCircle = async () => {
    const newName = window.prompt("ENTER NEW CIRCLE DESIGNATION:", activeCircle.title);
    if (!newName || newName === activeCircle.title) return;
    const { error } = await supabase.from('circles').update({ title: newName }).eq('id', activeCircle.id);
    if (!error) { setActiveCircle({ ...activeCircle, title: newName }); setCircles(circles.map(c => c.id === activeCircle.id ? { ...c, title: newName } : c)); }
  };

  const editCapacity = async () => {
    const newCapStr = window.prompt("ENTER NEW MAX CAPACITY:", activeCircle.max_capacity?.toString() || "100");
    if (!newCapStr) return;
    const newCap = parseInt(newCapStr);
    if (isNaN(newCap) || newCap < 1) { alert("CAPACITY MUST BE A NUMBER GREATER THAN 0."); return; }
    const { error } = await supabase.from('circles').update({ max_capacity: newCap }).eq('id', activeCircle.id);
    if (!error) { setActiveCircle({ ...activeCircle, max_capacity: newCap }); setCircles(circles.map(c => c.id === activeCircle.id ? { ...c, max_capacity: newCap } : c)); }
    else alert("FAILED TO UPDATE CAPACITY.");
  };

  const deleteCircle = async () => {
    if (!window.confirm(`DELETE "${activeCircle.title}"? This is permanent.`)) return;
    const { error } = await supabase.from('circles').delete().eq('id', activeCircle.id);
    if (!error) {
      const updated = circles.filter(c => c.id !== activeCircle.id);
      setCircles(updated);
      updated.length > 0 ? handleSelectCircle(updated[0]) : setActiveCircle(null);
    } else alert("FAILED TO DELETE CIRCLE.");
  };

  const toggleLiveStatus = async () => {
    const newStatus = !activeCircle.is_live;
    if (!window.confirm(newStatus ? "OPEN THE VAULT? Fans with the link can access this Circle." : "SEAL THE VAULT? This takes the link offline immediately.")) return;
    const { error } = await supabase.from('circles').update({ is_live: newStatus }).eq('id', activeCircle.id);
    if (!error) { setActiveCircle({ ...activeCircle, is_live: newStatus }); setCircles(circles.map(c => c.id === activeCircle.id ? { ...c, is_live: newStatus } : c)); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCircle) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `artifacts/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data, error: dbError } = await supabase.from('artifacts').insert([{ circle_id: activeCircle.id, title: file.name.replace(`.${fileExt}`, ''), file_path: filePath, file_type: file.type }]).select().single();
      if (dbError) throw dbError;
      setArtifacts([...artifacts, data]);
    } catch (err: any) { alert("UPLOAD FAILED: " + err.message); }
    finally { setIsUploading(false); }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/drop/${activeCircle.id}`);
    alert("INVITE LINK COPIED.");
  };

  const exportToCSV = () => {
    if (fans.length === 0) return;
    const csv = [['Email', 'Device', 'Date'].join(','), ...fans.map(f => `${f.email},${f.device || ''},${new Date(f.created_at).toLocaleDateString()}`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `${activeCircle.title.replace(/\s+/g, '_')}_GUESTLIST.csv`;
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) return <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-500">Initializing Workspace...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-500">
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">DropCircles</span>
        </div>
        <div className="flex gap-4 items-center">
          {/* Profile toggle */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center gap-2 px-3 py-2 border-2 font-mono text-[10px] uppercase tracking-widest transition-all ${showProfile ? 'border-black bg-black text-white' : 'border-zinc-300 text-zinc-500 hover:border-black hover:text-black'}`}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
              : <User size={12} />}
            {profile?.name || 'Profile'}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 hidden md:block">{user?.email}</span>
          <button onClick={handleLogout} className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-black hover:text-red-600 transition-colors flex items-center gap-2">
            Logout <LogOut size={12} />
          </button>
        </div>
      </nav>

      {/* ── Profile Panel ────────────────────────────────────────────────── */}
      {showProfile && (
        <div className="bg-white border-b-2 border-black animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div
                  className="w-24 h-24 border-4 border-black bg-zinc-100 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    : <User size={32} className="text-zinc-400" />}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors disabled:opacity-50"
                >
                  {avatarUploading ? 'UPLOADING...' : 'CHANGE PHOTO'}
                </button>
              </div>

              {/* Name + Bio */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 block mb-2">Artist Name</label>
                  <input
                    type="text"
                    placeholder="YOUR NAME"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-zinc-300 py-2 font-bold text-2xl tracking-tighter focus:outline-none focus:border-black transition-colors placeholder:text-zinc-300"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 block mb-2">
                    Bio <span className="text-zinc-300">({profileBio.length}/50)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="50 CHARACTERS MAX"
                    value={profileBio}
                    maxLength={50}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-zinc-300 py-2 font-mono text-sm uppercase tracking-widest focus:outline-none focus:border-black transition-colors placeholder:text-zinc-300"
                  />
                </div>
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {profileSaved ? <><Check size={12} /> SAVED</> : profileSaving ? 'SAVING...' : 'SAVE PROFILE'}
                </button>
              </div>

              {/* Preview */}
              {(profile?.name || profile?.avatar_url) && (
                <div className="border-2 border-dashed border-zinc-200 p-6 min-w-[180px] flex flex-col items-center text-center gap-3">
                  <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-400">Fan View Preview</p>
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full border-2 border-black object-cover" />
                    : <div className="w-16 h-16 rounded-full border-2 border-zinc-200 bg-zinc-100 flex items-center justify-center"><User size={20} className="text-zinc-400" /></div>
                  }
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">{profile.name || '—'}</p>
                    {profile.bio && <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">{profile.bio}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto pt-16 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Left: Circles ───────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">DropCircles</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{circles.length} OF 3 SLOTS ALLOCATED</p>
          </div>

          <div className="space-y-3">
            {circles.map(circle => (
              <button
                key={circle.id}
                onClick={() => handleSelectCircle(circle)}
                className={`w-full text-left p-4 border-2 transition-all flex items-center justify-between group ${activeCircle?.id === circle.id ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-black bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <Folder size={16} className={activeCircle?.id === circle.id ? 'text-white flex-shrink-0' : 'text-zinc-400 group-hover:text-black flex-shrink-0'} />
                  <span className="font-bold text-sm uppercase tracking-tight truncate">{circle.title}</span>
                </div>
                {circle.is_live ? <Globe size={14} className="text-[#4ade80] flex-shrink-0" /> : <Lock size={14} className={activeCircle?.id === circle.id ? 'text-zinc-400 flex-shrink-0' : 'text-zinc-300 flex-shrink-0'} />}
              </button>
            ))}

            {circles.length < 3 && (
              <form onSubmit={createCircle} className="border-2 border-dashed border-zinc-400 bg-transparent p-4 flex flex-col gap-4 focus-within:border-black transition-colors mt-6">
                <div className="flex gap-4">
                  <input type="text" placeholder="CIRCLE NAME" required className="w-full bg-transparent border-b-2 border-zinc-300 py-2 font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-black transition-colors" value={newCircleTitle} onChange={(e) => setNewCircleTitle(e.target.value)} />
                  <input type="number" placeholder="SPOTS" required min="1" className="w-20 flex-shrink-0 bg-transparent border-b-2 border-zinc-300 py-2 font-mono text-xs text-center uppercase tracking-widest focus:outline-none focus:border-black transition-colors" value={newCircleCapacity} onChange={(e) => setNewCircleCapacity(e.target.value)} />
                  <div className="relative w-16 flex-shrink-0">
                    <input type="text" placeholder="$0.00" disabled className="w-full bg-zinc-100 border-b-2 border-zinc-200 py-2 font-mono text-xs text-center uppercase tracking-widest text-zinc-400 cursor-not-allowed" />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] px-1 font-bold tracking-widest z-10">V2</span>
                  </div>
                </div>
                <button type="submit" className="w-full bg-zinc-200 text-black py-3 font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Plus size={14} /> Forge Circle
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Right: Active Circle ─────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          {!activeCircle ? (
            <div className="h-full min-h-[500px] border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-center p-12 bg-white/50">
              <Folder size={48} className="text-zinc-300 mb-6" />
              <h3 className="font-serif text-2xl font-bold mb-2 text-zinc-400">No Circle Selected</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Select or create a Circle to manage your artifacts.</p>
            </div>
          ) : (
            <div className="border-2 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[600px]">

              <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ACTIVE DIRECTORY</p>
                  <div className="flex items-center gap-3">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">{activeCircle.title}</h1>
                    <div className="flex items-center gap-1 mt-1">
                      <button onClick={renameCircle} className="text-zinc-300 hover:text-black transition-colors p-2" title="Rename"><Edit2 size={16} /></button>
                      <button onClick={editCapacity} className="text-zinc-300 hover:text-black transition-colors p-2" title="Edit Capacity"><Settings size={16} /></button>
                      <button onClick={deleteCircle} className="text-zinc-300 hover:text-red-600 transition-colors p-2" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button onClick={toggleLiveStatus} className={`w-full py-4 px-6 font-bold text-xs uppercase tracking-widest border-2 flex items-center justify-center gap-2 transition-colors ${activeCircle.is_live ? 'border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80] hover:text-black' : 'border-zinc-300 bg-transparent text-zinc-500 hover:bg-black hover:text-white hover:border-black'}`}>
                    {activeCircle.is_live ? <><Globe size={16} /> LIVE</> : <><Lock size={16} /> OFFLINE</>}
                  </button>
                  <button onClick={copyInviteLink} className="w-full py-3 px-6 font-bold text-[10px] uppercase tracking-widest border-2 border-black bg-black text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                    <LinkIcon size={14} /> Copy Fan Invite Link
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 border-b-2 border-zinc-200 mb-8 mt-4 overflow-x-auto">
                {(['artifacts', 'guestlist', 'capital'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`font-mono text-xs font-bold uppercase tracking-widest pb-3 transition-colors flex-shrink-0 flex items-center gap-2 ${activeTab === tab ? 'text-black border-b-4 border-black -mb-[2px]' : 'text-zinc-400 hover:text-black'}`}>
                    {tab === 'artifacts' && `Artifacts (${artifacts.length})`}
                    {tab === 'guestlist' && `Guestlist (${fans.length}/${activeCircle.max_capacity || 100})`}
                    {tab === 'capital' && <><span>Capital</span><Lock size={12} /></>}
                  </button>
                ))}
              </div>

              {/* Artifacts Tab */}
              {activeTab === 'artifacts' && (
                <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Encrypted Artifacts</h3>
                    <div className="relative">
                      <input type="file" accept="audio/*, video/*" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                      <button className="text-[10px] font-bold font-mono uppercase tracking-widest text-white bg-black px-4 py-2 flex items-center gap-2 hover:bg-[#ff3300] transition-colors">
                        {isUploading ? 'ENCRYPTING...' : <><Upload size={14} /> Upload Audio/Video</>}
                      </button>
                    </div>
                  </div>
                  {artifacts.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 text-zinc-400">
                      <Music size={32} className="mb-4 opacity-50" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em]">VAULT IS CURRENTLY EMPTY</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {artifacts.map((artifact) => (
                        <div key={artifact.id} className="flex items-center justify-between p-4 border-2 border-black hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-4 truncate">
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0">
                              {artifact.file_type?.includes('video') ? <Video size={16} /> : <Music size={16} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm uppercase tracking-tight truncate">{artifact.title}</p>
                              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mt-1">{artifact.file_type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Guestlist Tab */}
              {activeTab === 'guestlist' && (
                <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Captured Assets</h3>
                    <button onClick={exportToCSV} disabled={fans.length === 0} className="text-[10px] font-bold font-mono uppercase tracking-widest text-white bg-black px-4 py-2 flex items-center gap-2 hover:bg-[#ff3300] transition-colors disabled:opacity-50">
                      <Download size={14} /> Export to CSV
                    </button>
                  </div>
                  {fans.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-200 text-zinc-400">
                      <Users size={32} className="mb-4 opacity-50" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em]">THE GUESTLIST IS EMPTY</p>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-white max-h-[400px] overflow-y-auto">
                      {fans.map((fan) => (
                        <div key={fan.id} className="flex items-center justify-between p-4 border-b-2 border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition-colors">
                          <span className="font-mono text-xs uppercase tracking-widest font-bold">{fan.email}</span>
                          <div className="flex items-center gap-4">
                            {fan.device && <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300">{fan.device}</span>}
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">{new Date(fan.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Capital Tab */}
              {activeTab === 'capital' && (
                <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                  <div className="py-24 flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-300 text-center relative overflow-hidden group">
                    <div className="absolute top-6 right-6 bg-black text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase">BETA V2</div>
                    <DollarSign size={48} className="text-zinc-300 mb-6 group-hover:text-black transition-colors duration-500" />
                    <h3 className="font-serif text-3xl font-bold tracking-tight mb-4 text-zinc-400 group-hover:text-black transition-colors duration-500">Direct-to-Vault Routing</h3>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 max-w-md leading-relaxed px-6">
                      MONETIZATION IS CURRENTLY IN CLOSED BETA.<br /><br />SOON YOU'LL BE ABLE TO SET AN ENTRY FEE AND ROUTE CAPITAL DIRECTLY TO YOUR STRIPE ACCOUNT. ZERO MIDDLEMEN.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
