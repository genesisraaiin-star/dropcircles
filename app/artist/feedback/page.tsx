"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Download, LogOut, ThumbsUp, ThumbsDown, Star, MessageSquare, TrendingUp } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LinkedCirclesLogo = ({ className = "w-10 h-6", stroke = "currentColor" }) => (
  <svg viewBox="0 0 60 40" fill="none" stroke={stroke} strokeWidth="2" className={className}>
    <circle cx="22" cy="20" r="14" />
    <circle cx="38" cy="20" r="14" />
  </svg>
);

type Feedback = {
  id: string;
  created_at: string;
  song_id: string;
  song_title: string;
  thumbs: "up" | "down" | null;
  star_rating: number | null;
  comment: string | null;
  fan_name: string | null;
  fan_email: string | null;
};

export default function FeedbackDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<Feedback[]>([]);
  const [filtered, setFiltered] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSong, setFilterSong] = useState("");
  const [filterThumb, setFilterThumb] = useState("");
  const [filterStars, setFilterStars] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/artist"); return; }
    setUser(session.user);
    const { data: rows } = await supabase
      .from("fan_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    setData(rows || []);
    setFiltered(rows || []);
    setLoading(false);
  };

  useEffect(() => {
    let f = data;
    if (filterSong) f = f.filter(d => d.song_id === filterSong);
    if (filterThumb) f = f.filter(d => d.thumbs === filterThumb);
    if (filterStars) f = f.filter(d => d.star_rating && d.star_rating >= parseInt(filterStars));
    setFiltered(f);
    setPage(0);
  }, [filterSong, filterThumb, filterStars, data]);

  const songs = [...new Set(data.map(d => d.song_id))];
  const totalResponses = filtered.length;
  const thumbsUp = filtered.filter(d => d.thumbs === "up").length;
  const thumbsDown = filtered.filter(d => d.thumbs === "down").length;
  const thumbsTotal = thumbsUp + thumbsDown;
  const starRows = filtered.filter(d => d.star_rating);
  const avgStars = starRows.length
    ? (starRows.reduce((s, d) => s + d.star_rating!, 0) / starRows.length)
    : 0;
  const withComments = filtered.filter(d => d.comment?.trim()).length;

  // Star distribution
  const starDist = [1, 2, 3, 4, 5].map(n => ({
    n,
    count: filtered.filter(d => d.star_rating === n).length,
  }));
  const maxStarCount = Math.max(...starDist.map(s => s.count), 1);

  const exportCSV = () => {
    const headers = ["id", "created_at", "song_id", "song_title", "thumbs", "star_rating", "comment", "fan_name", "fan_email"];
    const rows = [
      headers.join(","),
      ...filtered.map(row =>
        headers.map(h => {
          const val = (row as any)[h] ?? "";
          const s = String(val).replace(/"/g, '""');
          return s.includes(",") || s.includes("\n") ? `"${s}"` : s;
        }).join(",")
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    a.download = `fan-feedback-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-500">
      Loading feedback...
    </div>
  );

  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black font-sans selection:bg-black selection:text-[#f4f4f0]">

      {/* NAV */}
      <nav className="flex justify-between items-center px-6 py-4 border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <LinkedCirclesLogo className="w-10 h-6" stroke="black" />
          <span className="text-2xl font-serif tracking-tighter mt-1">DropCircles</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-200 px-2 py-1 ml-2">
            Fan Feedback
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 hidden md:block">{user?.email}</span>
          <button
            onClick={() => router.push("/artist/hub")}
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
          >
            ← Hub
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/artist"); }}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:text-red-600 transition-colors flex items-center gap-2"
          >
            Logout <LogOut size={12} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-32 space-y-10">

        {/* PAGE TITLE */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2">Analytics</p>
          <h1 className="font-serif text-5xl font-bold tracking-tight">Fan Feedback</h1>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Responses", value: totalResponses, icon: <TrendingUp size={16} /> },
            { label: "Avg Star Rating", value: avgStars ? `${avgStars.toFixed(1)} ★` : "—", icon: <Star size={16} /> },
            { label: "Fire Reactions", value: thumbsTotal ? `${Math.round((thumbsUp / thumbsTotal) * 100)}%` : "—", icon: <ThumbsUp size={16} /> },
            { label: "With Comments", value: withComments, icon: <MessageSquare size={16} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 mb-3">
                {icon} {label}
              </div>
              <div className="font-serif text-4xl font-bold tracking-tight">{value}</div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Star Distribution */}
          <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-6">Rating Breakdown</p>
            {starRows.length === 0 ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 py-8 text-center">No star ratings yet</p>
            ) : (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(n => {
                  const count = starDist.find(s => s.n === n)?.count || 0;
                  const pct = Math.round((count / maxStarCount) * 100);
                  const totalPct = starRows.length ? Math.round((count / starRows.length) * 100) : 0;
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-zinc-500 w-4 text-right">{n}</span>
                      <span className="text-sm">★</span>
                      <div className="flex-1 h-5 bg-zinc-100 border border-zinc-200 relative overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 w-12 text-right">{count} ({totalPct}%)</span>
                    </div>
                  );
                })}
                <div className="pt-4 border-t-2 border-zinc-100 flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold">{avgStars.toFixed(2)}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ color: n <= Math.round(avgStars) ? "#000" : "#d4d4d8" }} className="text-lg">★</span>
                      ))}
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Average from {starRows.length} ratings</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbs Split */}
          <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-6">Reaction Split</p>
            {thumbsTotal === 0 ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 py-8 text-center">No reactions yet</p>
            ) : (
              <div className="space-y-6">
                {/* Visual bar */}
                <div className="h-8 w-full flex border-2 border-black overflow-hidden">
                  <div
                    className="bg-black flex items-center justify-center transition-all duration-700"
                    style={{ width: `${(thumbsUp / thumbsTotal) * 100}%` }}
                  >
                    {thumbsUp > 0 && <ThumbsUp size={14} className="text-white" />}
                  </div>
                  <div
                    className="bg-zinc-200 flex items-center justify-center transition-all duration-700"
                    style={{ width: `${(thumbsDown / thumbsTotal) * 100}%` }}
                  >
                    {thumbsDown > 0 && <ThumbsDown size={14} className="text-zinc-500" />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-black p-4">
                    <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">
                      <ThumbsUp size={12} /> Fire
                    </div>
                    <div className="font-serif text-3xl font-bold">{thumbsUp}</div>
                    <div className="font-mono text-[9px] text-zinc-400 mt-1">
                      {Math.round((thumbsUp / thumbsTotal) * 100)}%
                    </div>
                  </div>
                  <div className="border-2 border-zinc-200 p-4">
                    <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">
                      <ThumbsDown size={12} /> Not for me
                    </div>
                    <div className="font-serif text-3xl font-bold text-zinc-400">{thumbsDown}</div>
                    <div className="font-mono text-[9px] text-zinc-400 mt-1">
                      {Math.round((thumbsDown / thumbsTotal) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Per-song breakdown */}
                {songs.length > 1 && (
                  <div className="pt-4 border-t-2 border-zinc-100 space-y-2">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 mb-3">By Song</p>
                    {songs.map(songId => {
                      const songRows = data.filter(d => d.song_id === songId);
                      const up = songRows.filter(d => d.thumbs === "up").length;
                      const down = songRows.filter(d => d.thumbs === "down").length;
                      const total = up + down;
                      const title = songRows[0]?.song_title || songId;
                      const songStars = songRows.filter(d => d.star_rating);
                      const avg = songStars.length ? (songStars.reduce((s, d) => s + d.star_rating!, 0) / songStars.length).toFixed(1) : null;
                      return (
                        <div key={songId} className="flex items-center gap-3">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 w-28 truncate">{title}</span>
                          <div className="flex-1 h-3 bg-zinc-100 border border-zinc-200 overflow-hidden">
                            {total > 0 && (
                              <div className="h-full bg-black" style={{ width: `${(up / total) * 100}%` }} />
                            )}
                          </div>
                          <span className="font-mono text-[9px] text-zinc-400 w-20 text-right">
                            {total > 0 ? `${Math.round((up / total) * 100)}% 👍` : "no data"}
                            {avg && ` · ${avg}★`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── FILTERS + TABLE ── */}
        <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">

          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b-2 border-black">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 mr-2">Filter:</p>
            <select
              value={filterSong}
              onChange={e => setFilterSong(e.target.value)}
              className="border-2 border-zinc-200 bg-transparent font-mono text-[10px] uppercase tracking-widest px-3 py-2 focus:outline-none focus:border-black transition-colors"
            >
              <option value="">All Songs</option>
              {songs.map(s => (
                <option key={s} value={s}>{data.find(d => d.song_id === s)?.song_title || s}</option>
              ))}
            </select>
            <select
              value={filterThumb}
              onChange={e => setFilterThumb(e.target.value)}
              className="border-2 border-zinc-200 bg-transparent font-mono text-[10px] uppercase tracking-widest px-3 py-2 focus:outline-none focus:border-black transition-colors"
            >
              <option value="">All Reactions</option>
              <option value="up">👍 Fire</option>
              <option value="down">👎 Not for me</option>
            </select>
            <select
              value={filterStars}
              onChange={e => setFilterStars(e.target.value)}
              className="border-2 border-zinc-200 bg-transparent font-mono text-[10px] uppercase tracking-widest px-3 py-2 focus:outline-none focus:border-black transition-colors"
            >
              <option value="">All Ratings</option>
              <option value="5">5★ only</option>
              <option value="4">4★ +</option>
              <option value="3">3★ +</option>
            </select>
            <div className="ml-auto">
              <button
                onClick={exportCSV}
                disabled={filtered.length === 0}
                className="font-bold font-mono text-[10px] uppercase tracking-widest text-white bg-black px-4 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-400">
              <MessageSquare size={32} className="mb-4 opacity-30" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">No feedback matches your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-zinc-100">
                    <tr>
                      {["Date", "Song", "Reaction", "Stars", "Comment", "Fan"].map(h => (
                        <th key={h} className="px-6 py-3 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-normal whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, i) => (
                      <tr key={row.id} className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors ${i % 2 === 0 ? "" : "bg-zinc-50/30"}`}>
                        <td className="px-6 py-4 font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                          {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[9px] uppercase tracking-widest border border-zinc-200 px-2 py-1 text-zinc-600">
                            {row.song_title || row.song_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {row.thumbs === "up" && (
                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-black font-bold">
                              <ThumbsUp size={12} /> Fire
                            </span>
                          )}
                          {row.thumbs === "down" && (
                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                              <ThumbsDown size={12} /> Nah
                            </span>
                          )}
                          {!row.thumbs && <span className="text-zinc-300">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          {row.star_rating ? (
                            <span className="font-mono text-xs tracking-widest">
                              {"★".repeat(row.star_rating)}
                              <span className="text-zinc-200">{"★".repeat(5 - row.star_rating)}</span>
                            </span>
                          ) : <span className="text-zinc-300">—</span>}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          {row.comment ? (
                            <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 line-clamp-2" title={row.comment}>
                              {row.comment}
                            </span>
                          ) : <span className="text-zinc-300">—</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                          {row.fan_name || row.fan_email || "anon"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-4 border-t-2 border-zinc-100">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                      className="border-2 border-zinc-200 px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-black hover:text-black text-zinc-400 transition-colors disabled:opacity-30"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={(page + 1) * PAGE_SIZE >= filtered.length}
                      onClick={() => setPage(p => p + 1)}
                      className="border-2 border-zinc-200 px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-black hover:text-black text-zinc-400 transition-colors disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
