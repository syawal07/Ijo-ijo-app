'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { ArrowLeft, Trophy, Crown, Sparkles, Zap, Leaf, Brain, Activity } from 'lucide-react';

// --- TIPE DATA (DISESUAIKAN DENGAN BACKEND BARU) ---
interface LeaderboardUser {
  _id: string;
  fullName: string;
  schoolClass: string;
  totalScore: number;       // Data dari Backend
  gameScores: {             // Data 3 Dompet
    catcher: number;
    snake: number;
    quiz: number;
  };
  activeItem?: {
    name: string;
  };
}

// --- CONFIG TABS ---
const GAME_TABS = [
  { id: 'all', label: 'Global Rank', icon: Trophy, color: 'from-yellow-400 to-orange-500' },
  { id: 'catcher', label: 'Ijo Catcher', icon: Leaf, color: 'from-emerald-400 to-teal-500' },
  { id: 'snake', label: 'Neuro Snake', icon: Activity, color: 'from-cyan-400 to-blue-500' },
  { id: 'quiz', label: 'Eco Quiz', icon: Brain, color: 'from-purple-400 to-indigo-500' },
];

// --- SKELETON LOADING ---
const LeaderboardSkeleton = () => (
  <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse">
    <div className="h-12 w-full bg-white/10 rounded-xl mb-8"></div>
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
  const [activeTab, setActiveTab] = useState('all');

  // Fetch data setiap kali tab berubah
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Kirim param ?game=snake ke backend
        const response = await api.get('/games/leaderboard', {
          params: { game: activeTab }
        });
        setLeaders(response.data);
      } catch (error) {
        console.error("Gagal ambil leaderboard:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const getAvatar = (name: string) => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=bbf7d0`;

  // --- LOGIC BARU: AMBIL SKOR SESUAI TAB ---
  const getDisplayScore = (user: LeaderboardUser) => {
    if (activeTab === 'all') return user.totalScore;
    
    // Ambil skor spesifik dari object gameScores
    // Menggunakan syntax `as keyof` untuk TypeScript safety
    const key = activeTab as keyof typeof user.gameScores;
    return user.gameScores ? user.gameScores[key] || 0 : 0;
  };

  const topThree = leaders.slice(0, 3);
  const restOfList = leaders.slice(3);

  const activeTheme = GAME_TABS.find(t => t.id === activeTab)?.color || 'from-emerald-500 to-teal-700';

  return (
    <main className={`min-h-screen bg-slate-900 relative font-sans text-slate-800 overflow-x-hidden selection:bg-emerald-200`}>
      
      {/* === BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700">
        <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${activeTheme}`}></div>
        <div className="absolute inset-0 bg-slate-900/90"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 pb-24">
        
        {/* === HEADER === */}
        <div className="flex items-center justify-between mb-8">
            <Link 
                href="/dashboard" 
                className="group flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-100 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Season 2026
            </div>
        </div>

        {/* === TITLE === */}
        <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                Klasemen <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeTheme}`}>Pahlawan</span>
            </h1>
            <p className="text-slate-400 text-sm">Bersaing secara sehat, selamatkan bumi dengan aksi nyata.</p>
        </div>

        {/* === TABS === */}
        <div className="flex p-1 mb-12 overflow-x-auto no-scrollbar gap-2 sm:justify-center">
            {GAME_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap
                            ${isActive 
                                ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105 z-10' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}
                        `}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : ''}`} />
                        {tab.label}
                    </button>
                )
            })}
        </div>

        {/* === CONTENT === */}
        {loading ? (
             <LeaderboardSkeleton />
        ) : (
            <>
                {/* === PODIUM (TOP 3) === */}
                {leaders.length > 0 ? (
                    <div className="flex flex-col-reverse items-end justify-center gap-4 sm:flex-row sm:items-end mb-16 px-4 animate-in slide-in-from-bottom-10 duration-700">
                        
                        {/* RANK 2 */}
                        {topThree[1] && (
                            <div className="w-full sm:w-1/3 flex flex-col items-center group">
                                <div className="relative mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="h-20 w-20 rounded-full border-4 border-slate-300 bg-slate-800 shadow-2xl p-0.5 relative z-10">
                                        <img src={getAvatar(topThree[1].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-200 font-black px-3 py-1 rounded-full text-xs shadow-lg border border-slate-600 z-20">#2</div>
                                </div>
                                <div className="w-full rounded-t-3xl bg-gradient-to-b from-slate-800/90 to-slate-800/50 backdrop-blur-md p-6 pt-8 text-center border-t border-l border-r border-white/10 shadow-lg min-h-[160px] flex flex-col justify-start">
                                    <p className="truncate font-bold text-slate-200 mb-1">{topThree[1].fullName}</p>
                                    <div className="inline-flex items-center justify-center gap-1 bg-slate-700/50 px-3 py-1 rounded-lg">
                                        {/* FIX: Pakai getDisplayScore */}
                                        <span className="font-black text-white">{getDisplayScore(topThree[1])}</span>
                                        <span className="text-[10px] font-bold text-slate-400">PTS</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RANK 1 */}
                        {topThree[0] && (
                            <div className="w-full sm:w-1/3 flex flex-col items-center z-20 -mx-2 sm:mx-0 order-first sm:order-none group">
                                <div className="relative mb-4 transform group-hover:-translate-y-3 transition-transform duration-500">
                                    <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce" />
                                    <div className={`h-28 w-28 rounded-full border-4 bg-slate-800 shadow-[0_0_40px_rgba(250,204,21,0.2)] p-1 relative z-10 ring-4 ring-offset-4 ring-offset-slate-900 ${activeTab === 'all' ? 'border-yellow-400 ring-yellow-400/30' : 'border-emerald-400 ring-emerald-400/30'}`}>
                                        <img src={getAvatar(topThree[0].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-4 py-1.5 rounded-full text-sm shadow-xl border border-yellow-200 z-20 whitespace-nowrap">
                                        JUARA 1 👑
                                    </div>
                                </div>
                                <div className={`w-full rounded-t-[2.5rem] bg-gradient-to-b backdrop-blur-xl p-6 pt-10 text-center border-t shadow-[0_0_30px_rgba(255,255,255,0.05)] min-h-[200px] flex flex-col justify-start relative overflow-hidden ${activeTab === 'all' ? 'from-yellow-500/20 via-yellow-500/10 border-yellow-500/30' : 'from-emerald-500/20 via-emerald-500/10 border-emerald-500/30'}`}>
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                    <p className="truncate font-black text-lg text-white mb-1">{topThree[0].fullName}</p>
                                    <p className="text-xs font-bold text-white/50 mb-3">{topThree[0].schoolClass}</p>
                                    <div className="inline-flex items-center justify-center gap-1 bg-white text-slate-900 px-4 py-1.5 rounded-xl shadow-lg shadow-white/10 mx-auto">
                                        <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        {/* FIX: Pakai getDisplayScore */}
                                        <span className="font-black text-xl">{getDisplayScore(topThree[0])}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RANK 3 */}
                        {topThree[2] && (
                            <div className="w-full sm:w-1/3 flex flex-col items-center group">
                                <div className="relative mb-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="h-20 w-20 rounded-full border-4 border-orange-700 bg-slate-800 shadow-2xl p-0.5 relative z-10">
                                        <img src={getAvatar(topThree[2].fullName)} alt="Avatar" className="h-full w-full rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-900 text-orange-200 font-black px-3 py-1 rounded-full text-xs shadow-lg border border-orange-800 z-20">#3</div>
                                </div>
                                <div className="w-full rounded-t-3xl bg-gradient-to-b from-orange-900/40 to-slate-800/50 backdrop-blur-md p-6 pt-8 text-center border-t border-l border-r border-white/10 shadow-lg min-h-[140px] flex flex-col justify-start">
                                    <p className="truncate font-bold text-slate-200 mb-1">{topThree[2].fullName}</p>
                                    <div className="inline-flex items-center justify-center gap-1 bg-slate-700/50 px-3 py-1 rounded-lg">
                                        {/* FIX: Pakai getDisplayScore */}
                                        <span className="font-black text-white">{getDisplayScore(topThree[2])}</span>
                                        <span className="text-[10px] font-bold text-slate-400">PTS</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-20 text-center text-white/40 bg-white/5 rounded-3xl backdrop-blur-md border border-white/5 mx-4">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Belum ada data kompetisi untuk kategori ini.</p>
                        <p className="text-sm mt-2">Jadilah yang pertama bermain!</p>
                    </div>
                )}

                {/* === LIST SISA === */}
                <div className="space-y-3 px-1 animate-in slide-in-from-bottom-20 duration-1000 delay-100">
                    {restOfList.map((user, index) => {
                        const rank = index + 4;
                        return (
                            <div key={user._id} className="group flex items-center justify-between rounded-2xl bg-slate-800/50 backdrop-blur-md p-4 shadow-sm hover:shadow-xl hover:bg-slate-800 hover:border-emerald-500/30 transition-all duration-300 border border-white/5">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 font-black text-slate-400 text-sm group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                        {rank}
                                    </div>
                                    <div className="relative">
                                        <img src={getAvatar(user.fullName)} alt="Avatar" className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 group-hover:border-emerald-500/50 transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-bold text-slate-200 text-base">{user.fullName}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                            <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-400">{user.schoolClass}</span>
                                            {user.activeItem && (
                                                <span className="truncate flex items-center gap-1 text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                                                    {user.activeItem.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                     <div className="flex flex-col items-end">
                                        {/* FIX: Pakai getDisplayScore */}
                                        <span className="font-black text-white text-lg tabular-nums group-hover:text-emerald-400 transition-colors">
                                            {getDisplayScore(user)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Points</span>
                                     </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
      </div>
    </main>
  );
}