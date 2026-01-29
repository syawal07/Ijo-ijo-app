'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { ArrowLeft, Trophy, Crown, Sparkles, Medal, Zap, Info } from 'lucide-react';

// --- TIPE DATA ---
interface LeaderboardUser {
  _id: string;
  fullName: string;
  schoolClass: string;
  highScore: number;
  activeItem?: {
    name: string;
  };
}

// --- SKELETON LOADING (Modern) ---
const LeaderboardSkeleton = () => (
  <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse">
    <div className="h-32 w-full bg-white/20 rounded-3xl backdrop-blur-md"></div>
    <div className="flex items-end justify-center gap-4 h-64">
      <div className="w-1/3 h-40 bg-white/30 rounded-t-3xl"></div>
      <div className="w-1/3 h-56 bg-white/40 rounded-t-3xl"></div>
      <div className="w-1/3 h-32 bg-white/30 rounded-t-3xl"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 w-full bg-white/40 rounded-2xl"></div>
      ))}
    </div>
  </div>
);

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/games/leaderboard');
        setLeaders(response.data);
      } catch (error) {
        console.error("Gagal ambil leaderboard:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchLeaderboard();
  }, []);

  // Helper Avatar
  const getAvatar = (name: string) => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=bbf7d0`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-700 flex flex-col items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <LeaderboardSkeleton />
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const restOfList = leaders.slice(3);

  return (
    <main className="min-h-screen bg-slate-50 relative font-sans text-slate-800 overflow-x-hidden selection:bg-emerald-200">
      
      {/* === BACKGROUND PREMIUM (Tidak Polosan) === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradient Mesh Dasar */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#115e59]"></div>
        
        {/* Orbs/Glow Effect bergerak */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-[80px]"></div>
        
        {/* Pattern Grid Halus */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 pb-24">
        
        {/* === HEADER & NAVIGASI === */}
        <div className="flex items-center justify-between mb-8">
            <Link 
                href="/dashboard" 
                className="group flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/20 hover:scale-105"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/50 backdrop-blur-md border border-emerald-500/30 text-emerald-100 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Season 2026
            </div>
        </div>

        {/* === HERO EXPLANATION (Penjelasan) === */}
        <div className="mb-12 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                Klasemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-emerald-200">Pahlawan Bumi</span>
            </h1>
            
            <div className="mx-auto max-w-2xl rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10 p-5 shadow-xl">
                <div className="flex items-start gap-4 text-left">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">Jadilah Nomor #1! 🚀</h3>
                        <p className="text-sm text-emerald-100 leading-relaxed opacity-90">
                            Setiap sampah yang kamu scan dan game yang kamu menangkan akan menambah poin XP. 
                            Bersainglah secara sehat untuk menjadi siswa paling peduli lingkungan di sekolahmu!
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* === PODIUM SECTION (TOP 3) === */}
        {leaders.length > 0 ? (
            <div className="flex flex-col-reverse items-end justify-center gap-4 sm:flex-row sm:items-end mb-16 px-4">
                
                {/* RANK 2 */}
                {topThree[1] && (
                    <div className="w-full sm:w-1/3 flex flex-col items-center group">
                        <div className="relative mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <div className="h-20 w-20 rounded-full border-4 border-slate-300 bg-white shadow-2xl p-0.5 relative z-10">
                                <img src={getAvatar(topThree[1].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 font-black px-3 py-1 rounded-full text-xs shadow-lg border border-slate-300 z-20">
                                #2
                            </div>
                            <div className="absolute inset-0 bg-slate-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10"></div>
                        </div>
                        <div className="w-full rounded-t-3xl bg-gradient-to-b from-slate-200/90 to-slate-100/50 backdrop-blur-md p-6 pt-8 text-center border-t border-l border-r border-white/20 shadow-lg min-h-[160px] flex flex-col justify-start">
                            <p className="truncate font-bold text-slate-800 mb-1">{topThree[1].fullName}</p>
                            <div className="inline-flex items-center justify-center gap-1 bg-slate-300/50 px-3 py-1 rounded-lg">
                                <span className="font-black text-slate-800">{topThree[1].highScore}</span>
                                <span className="text-[10px] font-bold text-slate-600">PTS</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* RANK 1 (Champion) */}
                {topThree[0] && (
                    <div className="w-full sm:w-1/3 flex flex-col items-center z-20 -mx-2 sm:mx-0 order-first sm:order-none group">
                        <div className="relative mb-4 transform group-hover:-translate-y-3 transition-transform duration-500">
                            <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 text-yellow-300 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                            <div className="h-28 w-28 rounded-full border-4 border-yellow-400 bg-white shadow-[0_0_40px_rgba(250,204,21,0.4)] p-1 relative z-10 ring-4 ring-yellow-400/30">
                                <img src={getAvatar(topThree[0].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black px-4 py-1.5 rounded-full text-sm shadow-xl border border-yellow-200 z-20 whitespace-nowrap">
                                JUARA 1 👑
                            </div>
                        </div>
                        <div className="w-full rounded-t-[2.5rem] bg-gradient-to-b from-yellow-300/90 via-yellow-100/80 to-white/10 backdrop-blur-xl p-6 pt-10 text-center border-t border-yellow-200 shadow-[0_0_30px_rgba(234,179,8,0.2)] min-h-[200px] flex flex-col justify-start relative overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                            
                            <p className="truncate font-black text-lg text-yellow-950 mb-1">{topThree[0].fullName}</p>
                            <p className="text-xs font-bold text-yellow-800/70 mb-3">{topThree[0].schoolClass}</p>
                            <div className="inline-flex items-center justify-center gap-1 bg-yellow-400 px-4 py-1.5 rounded-xl shadow-sm mx-auto">
                                <Zap className="w-4 h-4 text-yellow-900 fill-yellow-900" />
                                <span className="font-black text-xl text-yellow-900">{topThree[0].highScore}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* RANK 3 */}
                {topThree[2] && (
                    <div className="w-full sm:w-1/3 flex flex-col items-center group">
                        <div className="relative mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                            <div className="h-20 w-20 rounded-full border-4 border-orange-400 bg-white shadow-2xl p-0.5 relative z-10">
                                <img src={getAvatar(topThree[2].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-800 font-black px-3 py-1 rounded-full text-xs shadow-lg border border-orange-300 z-20">
                                #3
                            </div>
                            <div className="absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10"></div>
                        </div>
                        <div className="w-full rounded-t-3xl bg-gradient-to-b from-orange-100/90 to-orange-50/50 backdrop-blur-md p-6 pt-8 text-center border-t border-l border-r border-white/20 shadow-lg min-h-[140px] flex flex-col justify-start">
                            <p className="truncate font-bold text-slate-800 mb-1">{topThree[2].fullName}</p>
                            <div className="inline-flex items-center justify-center gap-1 bg-orange-200/50 px-3 py-1 rounded-lg">
                                <span className="font-black text-slate-800">{topThree[2].highScore}</span>
                                <span className="text-[10px] font-bold text-slate-600">PTS</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : (
             <div className="py-20 text-center text-white/60 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Belum ada data kompetisi. Jadilah yang pertama!</p>
             </div>
        )}

        {/* === DAFTAR PERINGKAT SISANYA === */}
        <div className="space-y-3">
            {restOfList.map((user, index) => {
                const rank = index + 4;
                return (
                    <div 
                        key={user._id} 
                        className="group flex items-center justify-between rounded-2xl bg-white/90 backdrop-blur-md p-4 shadow-sm hover:shadow-xl hover:bg-white hover:scale-[1.02] transition-all duration-300 border border-white/50"
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            {/* Rank Number */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-500 text-sm group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                                {rank}
                            </div>
                            
                            {/* Avatar & Info */}
                            <div className="relative">
                                <img src={getAvatar(user.fullName)} alt="Avatar" className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 group-hover:border-emerald-200" />
                            </div>
                            
                            <div className="min-w-0">
                                <p className="truncate font-bold text-slate-800 text-base">{user.fullName}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{user.schoolClass}</span>
                                    {user.activeItem && (
                                        <span className="truncate flex items-center gap-1 text-emerald-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                                            {user.activeItem.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="text-right pl-4">
                             <div className="flex flex-col items-end">
                                <span className="font-black text-emerald-700 text-lg tabular-nums">{user.highScore}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points</span>
                             </div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {leaders.length > 0 && (
            <div className="mt-8 text-center">
                <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-100/60 px-4 py-2 rounded-full bg-emerald-900/30 backdrop-blur-sm border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Update Real-time
                </p>
            </div>
        )}

      </div>
    </main>
  );
}