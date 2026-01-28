'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

// Tipe Data User
interface LeaderboardUser {
  _id: string;
  fullName: string;
  schoolClass: string;
  highScore: number;
  activeItem?: {
    name: string;
  };
}

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
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Fungsi untuk mendapatkan inisial nama
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-20 font-sans">
      
      {/* HEADER ALA LIGA */}
      <div className="sticky top-0 z-20 bg-emerald-900 text-white shadow-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold hover:bg-white/20">
            ⬅ KEMBALI
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-tighter italic">IJO SUPER LEAGUE</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-300">Season 2026</p>
          </div>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* PODIUM JUARA (TOP 3) */}
      {leaders.length > 0 && (
        <div className="bg-emerald-800 pb-12 pt-6 px-4 rounded-b-[3rem] shadow-lg mb-6">
            <div className="mx-auto flex max-w-lg items-end justify-center gap-2">
                
                {/* RANK 2 */}
                {leaders[1] && (
                    <div className="flex flex-col items-center w-1/3">
                        <div className="relative mb-2">
                            <div className="h-14 w-14 rounded-full border-2 border-slate-300 bg-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-lg">
                                {getInitials(leaders[1].fullName)}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-[10px] font-bold px-2 rounded-full text-slate-800">#2</div>
                        </div>
                        <p className="w-full truncate text-center text-xs font-bold text-emerald-100">{leaders[1].fullName}</p>
                        <p className="text-sm font-black text-white">{leaders[1].highScore}</p>
                    </div>
                )}

                {/* RANK 1 (Big Boss) */}
                {leaders[0] && (
                    <div className="flex flex-col items-center w-1/3 -mt-6 z-10">
                        <div className="relative mb-2">
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>
                            <div className="h-20 w-20 rounded-full border-4 border-yellow-400 bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-2xl shadow-xl ring-4 ring-emerald-700/50">
                                {getInitials(leaders[0].fullName)}
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-xs font-black px-3 py-0.5 rounded-full text-yellow-900 border border-yellow-200">JUARA</div>
                        </div>
                        <p className="w-full truncate text-center text-sm font-bold text-white mt-1">{leaders[0].fullName}</p>
                        <p className="text-xl font-black text-yellow-300">{leaders[0].highScore}</p>
                    </div>
                )}

                {/* RANK 3 */}
                {leaders[2] && (
                    <div className="flex flex-col items-center w-1/3">
                        <div className="relative mb-2">
                            <div className="h-14 w-14 rounded-full border-2 border-orange-300 bg-orange-100 flex items-center justify-center text-orange-800 font-bold shadow-lg">
                                {getInitials(leaders[2].fullName)}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-300 text-[10px] font-bold px-2 rounded-full text-orange-900">#3</div>
                        </div>
                        <p className="w-full truncate text-center text-xs font-bold text-emerald-100">{leaders[2].fullName}</p>
                        <p className="text-sm font-black text-white">{leaders[2].highScore}</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* TABEL KLASEMEN LENGKAP */}
      <div className="mx-auto max-w-2xl px-4 -mt-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-xl border border-slate-200">
            
            {/* Table Header */}
            <div className="flex bg-slate-100 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <div className="w-8 text-center">Pos</div>
                <div className="flex-1 pl-2">Klub (Siswa)</div>
                <div className="w-16 text-center">Main</div> 
                <div className="w-16 text-right">Poin</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
                {leaders.map((user, index) => {
                    // PERBAIKAN: Variabel 'rankColor' dihapus karena tidak dipakai
                    let rowBg = "bg-white hover:bg-slate-50";
                    let posBg = "bg-transparent";

                    if (index === 0) { 
                        rowBg = "bg-yellow-50/50 hover:bg-yellow-50"; 
                        posBg = "bg-yellow-100 text-yellow-700";
                    } else if (index === 1) {
                         rowBg = "bg-slate-50/50 hover:bg-slate-100";
                         posBg = "bg-slate-200 text-slate-700";
                    } else if (index === 2) {
                        rowBg = "bg-orange-50/50 hover:bg-orange-50";
                        posBg = "bg-orange-100 text-orange-700";
                    }

                    return (
                        <div key={user._id} className={`flex items-center px-4 py-3 transition-colors ${rowBg}`}>
                            
                            {/* Kolom 1: POSISI */}
                            <div className="w-8 flex justify-center">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${posBg} ${index > 2 ? 'text-slate-500' : ''}`}>
                                    {index + 1}
                                </span>
                            </div>

                            {/* Kolom 2: NAMA & ITEM */}
                            <div className="flex-1 pl-2 min-w-0">
                                <div className="flex items-center gap-3">
                                    {/* Avatar Inisial */}
                                    <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 sm:flex">
                                        {getInitials(user.fullName)}
                                    </div>
                                    
                                    <div className="truncate">
                                        <p className="truncate text-sm font-bold text-slate-800">
                                            {user.fullName}
                                            {index === 0 && <span className="ml-1 text-[10px]">🏆</span>}
                                        </p>
                                        <p className="flex items-center text-[10px] text-slate-400 truncate">
                                            {user.activeItem ? (
                                                <>
                                                 <span className="mr-1">🎒</span> {user.activeItem.name}
                                                </>
                                            ) : (
                                                <span className="italic">Tanpa Sponsor</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom 3: KELAS */}
                            <div className="w-16 text-center">
                                <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                    {user.schoolClass}
                                </span>
                            </div>

                            {/* Kolom 4: POIN */}
                            <div className="w-16 text-right">
                                <span className="text-lg font-black text-emerald-600 tabular-nums">
                                    {user.highScore}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* EMPTY STATE */}
                {leaders.length === 0 && (
                    <div className="py-10 text-center text-slate-400">
                        <p className="text-sm">Belum ada pertandingan.</p>
                    </div>
                )}
            </div>
        </div>
        
        <p className="mt-4 text-center text-[10px] text-slate-400">
            *Update Real-time setiap game berakhir
        </p>

      </div>
    </main>
  );
}