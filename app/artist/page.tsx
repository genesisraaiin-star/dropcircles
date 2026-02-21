"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Folder, LogOut, Lock, Globe, Upload, Link as LinkIcon, Edit2, Music, Video, Users, Download, DollarSign, Trash2, Settings } from 'lucide-react';
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

  useEffect(() => {
    checkUserAndFetchCircles();
  }, []);

  const checkUserAndFetchCircles = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        router.push('/artist');
        return;
      }
      setUser(session.user);

      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('artist_id', session.user.id)
        .order('created_at', { ascending: false });

      if (circleError) throw circleError;

      setCircles(circleData || []);
      if (circleData && circleData.length > 0) {
        handleSelectCircle(circleData[0]);
      }
    } catch (err: any) {
      console.error("Hub Initialization Error:", err);
      alert("WORKSPACE ERROR: " + err.message + "\nCheck your Supabase connection.");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleSelectCircle = async (circle: any) => {
    setActiveCircle(circle);
    setActiveTab('artifacts');
    
    try {
      const { data: artifactData } = await supabase
        .from('artifacts')
        .select('*')
        .eq('circle_id', circle.id)
        .order('created_at', { ascending: true });
      setArtifacts(artifactData || []);

      const { data: fanData } = await supabase
        .from('fan_roster')
        .select('*')
        .eq('circle_id', circle.id)
        .order('created_at', { ascending: false });
      setFans(fanData || []);
    } catch (error) {
      console.error("Error fetching circle data:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/artist');
  };

  const createCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleTitle || circles.length >= 3) return;

    const capacity = parseInt(newCircleCapacity);
    if (isNaN(capacity) || capacity < 1) {
      alert("CAPACITY MUST BE AT LEAST 1.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('circles')
        .insert([{ title: newCircleTitle, max_capacity: capacity, is_live: false, artist_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCircles([data, ...circles]);
        setNewCircleTitle('');
        setNewCircleCapacity('100');
        handleSelectCircle(data);
      }
    } catch (error: any) {
      alert("FAILED TO FORGE CIRCLE: " + error.message);
    }
  };

  const renameCircle = async () => {
    const newName = window.prompt("ENTER NEW CIRCLE DESIGNATION:", activeCircle.title);
    if (!newName || newName === activeCircle.title) return;

    const { error } = await supabase
      .from('circles')
      .update({ title: newName })
      .eq('id', activeCircle.id);

    if (!error) {
      setActiveCircle({ ...activeCircle, title: newName });
      setCircles(circles.map(c => c.id === activeCircle.id ? { ...c, title: newName } : c));
    }
  };

  // --- NEW: EDIT CAPACITY FUNCTION ---
  const editCapacity = async () => {
    const newCapStr = window.prompt("ENTER NEW MAX CAPACITY (Spots):", activeCircle.max_capacity?.toString() || "100");
    if (!newCapStr) return;
    
    const newCap = parseInt(newCapStr);
    if (isNaN(newCap) || newCap < 1) {
      alert("CAPACITY MUST BE A NUMBER GREATER THAN 0.");
      return;
    }

    const { error } = await supabase
      .from('circles')
      .update({ max_capacity: newCap })
      .eq('id', activeCircle.id);

    if (!error) {
      setActiveCircle({ ...activeCircle, max_capacity: newCap });
      setCircles(circles.map(c => c.id === activeCircle.id ? { ...c, max_capacity: newCap } : c));
    } else {
      alert("FAILED TO UPDATE CAPACITY.");
    }
  };

  // --- NEW: DELETE CIRCLE FUNCTION ---
  const deleteCircle = async () => {
    const confirmDelete = window.confirm(`WARNING: ARE YOU SURE YOU WANT TO PERMANENTLY DELETE "${activeCircle.title}"?\n\nThis will destroy the vault, clear the guestlist, and free up 1 slot.`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('circles')
      .delete()
      .eq('id', activeCircle.id);

    if (!error) {
      const updatedCircles = circles.filter(c => c.id !== activeCircle.id);
      setCircles(updatedCircles);
      if (updatedCircles.length > 0) {
        handleSelectCircle(updatedCircles[0]);
      } else {
        setActiveCircle(null);
      }
    } else {
      alert("FAILED TO DELETE CIRCLE. CHECK PERMISSIONS.");
    }
  };

  const toggleLiveStatus = async () => {
    const newStatus = !activeCircle.is_live;
    const confirmMsg = newStatus 
      ? "OPEN THE VAULT? Fans with the link will be able to access this Circle." 
      : "SEAL THE VAULT? This will immediately take the link offline.";
      
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('circles')
      .update({ is_live: newStatus })
      .eq('id', activeCircle.id);

    if (!error) {
      setActiveCircle({ ...activeCircle, is_live: newStatus });
      setCircles(circles.map(c => c.id === activeCircle.id ? { ...c, is_live: newStatus } : c));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCircle) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `artifacts/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('artifacts')
        .insert([{
          circle_id: activeCircle.id,
          title: file.name.replace(`.${fileExt}`, ''),
          file_path: filePath,
          file_type: file.type
        }])
        .select()
        .single();

      if (dbError) throw dbError;
      setArtifacts([...artifacts, data]);

    } catch (err: any) {
      alert("UPLOAD FAILED: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/drop/${activeCircle.id}`;
    navigator.clipboard.writeText(link);
    alert("INVITE LINK COPIED TO CLIPBOARD.");
  };

  const exportToCSV = () => {
    if (fans.length === 0) return;
    const headers = ['Email', 'Date Unlocked'];
    const csvContent = [
      headers.join(','),
      ...fans.map(f => `${f.email},${new Date(f.created_at).toLocaleDateString()}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeCircle.title.replace(/\s+/g, '_')}_GUESTLIST.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-500">Initializing Workspace...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0] pb-32 animate-in fade-in duration-500">
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">DropCircles</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hidden md:block">
            VISIONARY: {user?.email}
          </span>
          <button onClick={handleLogout} className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-black hover:text-red-600 transition-colors flex items-center gap-2">
            Logout <LogOut size={12} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-16 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">DropCircles</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {circles.length} OF 3 SLOTS ALLOCATED
            </p>
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
                {circle.is_live ? (
                  <Globe size={14} className="text-[#4ade80] flex-shrink-0" />
                ) : (
                  <Lock size={14} className={activeCircle?.id === circle.id ? 'text-zinc-400 flex-shrink-0' : 'text-zinc-300 flex-shrink-0'} />
                )}
              </button>
            ))}

            {circles.length < 3 && (
              <form onSubmit={createCircle} className="border-2 border-dashed border-zinc-400 bg-transparent p-4 flex flex-col gap-4 focus-within:border-black transition-colors mt-6 relative">
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    placeholder="CIRCLE NAME" 
                    required
                    className="flex-1 bg-transparent border-b-2 border-zinc-300 py-2 font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-black transition-colors min-w-0"
                    value={newCircleTitle}
                    onChange={(e) => setNewCircleTitle(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="SPOTS" 
                    required
                    min="1"
                    title="Max Capacity"
                    className="w-16 flex-shrink-0 bg-transparent border-b-2 border-zinc-300 py-2 font-mono text-xs text-center uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                    value={newCircleCapacity}
                    onChange={(e) => setNewCircleCapacity(e.target.value)}
                  />
                  
                  <div className="relative w-16 flex-shrink-0 group cursor-not-allowed">
                    <input 
                      type="text" 
                      placeholder="$0.00" 
                      disabled
                      title="Monetization coming in V2"
                      className="w-full bg-zinc-100 border-b-2 border-zinc-200 py-2 font-mono text-xs text-center uppercase tracking-widest text-zinc-400 cursor-not-allowed"
                    />
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
                <div className="group relative">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ACTIVE DIRECTORY</p>
                  <div className="flex items-center gap-4">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">{activeCircle.title}</h1>
                    
                    {/* NEW: THE COMMAND ICONS (Rename, Edit Scarcity, Delete) */}
                    <div className="flex items-center gap-1 mt-1">
                      <button onClick={renameCircle} className="text-zinc-300 hover:text-black transition-colors p-2" title="Rename Circle">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={editCapacity} className="text-zinc-300 hover:text-black transition-colors p-2" title="Edit Scarcity/Capacity">
                        <Settings size={18} />
                      </button>
                      <button onClick={deleteCircle} className="text-zinc-300 hover:text-red-600 transition-colors p-2" title="Delete Circle">
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button 
                    onClick={toggleLiveStatus}
                    className={`w-full py-4 px-6 font-bold text-xs uppercase tracking-widest border-2 flex items-center justify-center gap-2 transition-colors ${activeCircle.is_live ? 'border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80] hover:text-black' : 'border-zinc-300 bg-transparent text-zinc-500 hover:bg-black hover:text-white hover:border-black'}`}
                  >
                    {activeCircle.is_live ? <><Globe size={16}/> LIVE (BRING OFFLINE)</> : <><Lock size={16}/> OFFLINE (MAKE LIVE)</>}
                  </button>
                  
                  <button 
                    onClick={copyInviteLink}
                    className="w-full py-3 px-6 font-bold text-[10px] uppercase tracking-widest border-2 border-black bg-black text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    <LinkIcon size={14}/> Copy Fan Invite Link
                  </button>
                </div>
              </div>

              <div className="flex gap-8 border-b-2 border-zinc-200 mb-8 mt-4 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab('artifacts')} 
                  className={`font-mono text-xs font-bold uppercase tracking-widest pb-3 transition-colors flex-shrink-0 ${activeTab === 'artifacts' ? 'text-black border-b-4 border-black -mb-[2px]' : 'text-zinc-400 hover:text-black'}`}
                >
                  Artifacts ({artifacts.length})
                </button>
                <button 
                  onClick={() => setActiveTab('guestlist')} 
                  className={`font-mono text-xs font-bold uppercase tracking-widest pb-3 transition-colors flex items-center gap-2 flex-shrink-0 ${activeTab === 'guestlist' ? 'text-black border-b-4 border-black -mb-[2px]' : 'text-zinc-400 hover:text-black'}`}
                >
                  Guestlist ({fans.length}/{activeCircle.max_capacity || 100})
                </button>
                <button 
                  onClick={() => setActiveTab('capital')} 
                  className={`font-mono text-xs font-bold uppercase tracking-widest pb-3 transition-colors flex items-center gap-2 flex-shrink-0 ${activeTab === 'capital' ? 'text-black border-b-4 border-black -mb-[2px]' : 'text-zinc-400 hover:text-black'}`}
                >
                  Capital <Lock size={12} className="mb-[2px]" />
                </button>
              </div>

              {activeTab === 'artifacts' && (
                <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Encrypted Artifacts</h3>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="audio/*, video/*" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
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
                        <div key={artifact.id} className="flex items-center justify-between p-4 border-2 border-black hover:bg-zinc-50 transition-colors group">
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

              {activeTab === 'guestlist' && (
                <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Captured Assets</h3>
                    <button 
                      onClick={exportToCSV} 
                      disabled={fans.length === 0}
                      className="text-[10px] font-bold font-mono uppercase tracking-widest text-white bg-black px-4 py-2 flex items-center gap-2 hover:bg-[#ff3300] transition-colors disabled:opacity-50"
                    >
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
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                            {new Date(fan.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'capital' && (
                <div className="flex-1 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Vault Economics</h3>
                  </div>
                  
                  <div className="py-24 flex flex-col items-center justify-center bg-zinc-50 border-2 border-dashed border-zinc-300 text-center relative overflow-hidden group">
                    <div className="absolute top-6 right-6 bg-black text-white px-3 py-1 text-[10px] font-bold tracking-widest uppercase">BETA V2</div>
                    
                    <DollarSign size={48} className="text-zinc-300 mb-6 group-hover:text-black transition-colors duration-500" />
                    
                    <h3 className="font-serif text-3xl font-bold tracking-tight mb-4 text-zinc-400 group-hover:text-black transition-colors duration-500">
                      Direct-to-Vault Routing
                    </h3>
                    
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 max-w-md leading-relaxed px-6">
                      MONETIZATION IS CURRENTLY IN CLOSED BETA. <br/><br/>SOON, YOU WILL BE ABLE TO SET A SECURE ENTRY FEE FOR YOUR DROPCIRCLES AND ROUTE CAPITAL DIRECTLY TO YOUR STRIPE ACCOUNT. ZERO MIDDLEMEN.
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
