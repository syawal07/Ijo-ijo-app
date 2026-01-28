'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';

// --- TIPE DATA ---
interface ItemData {
  _id: string;
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  type: string;
  lastCheckIn?: string;
}

interface UserData {
  fullName: string;
  ijoCoins: number;
  gameTickets: number;
  activeItem?: ItemData;
}

interface ApiError {
  response?: {
    data?: {
      message?: string | string[]; // Backend kadang kirim array string
    };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  
  // Modal State
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);

  // 1. Fetch Data Profil
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error("Gagal ambil data profile:", error);
      Cookies.remove('token');
      router.push('/login');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserProfile();
  }, [router]);

  // Cek Absen Harian
  const hasCheckedInToday = () => {
    if (!user?.activeItem?.lastCheckIn) return false;
    const lastDate = new Date(user.activeItem.lastCheckIn);
    const today = new Date();
    return (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    );
  };

  // 2. FUNGSI CHECK-IN
  const handleCheckIn = async () => {
    if (!user?.activeItem) return;
    if (hasCheckedInToday()) {
        toast('Sudah rawat hari ini. Besok lagi ya! 🕒', { icon: '📅' });
        return;
    }
    setCheckInLoading(true);
    try {
      const response = await api.post('/items/checkin');
      const { gainedXp, levelUp } = response.data;
      if (levelUp) {
        toast.success(`LEVEL UP! ${user.activeItem.name} naik level! 🎉`, { duration: 4000 });
      } else {
        toast.success(`+${gainedXp} XP! Partner makin setia. 💖`);
      }
      fetchUserProfile();
    } catch (error) {
      const err = error as ApiError;
      const msg = err.response?.data?.message || 'Gagal check-in';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCheckInLoading(false);
    }
  };

  // 3. FUNGSI PILIH PARTNER (FIXED)
  const handleSelectItem = async (selection: 'Tumbler' | 'ToteBag') => {
    setSelectLoading(true);
    try {
        // PERBAIKAN: Sesuaikan data dengan validasi Backend
        const isTumbler = selection === 'Tumbler';
        
        const payload = {
            name: isTumbler ? 'Si Botol Sakti' : 'Tas Ajaib',
            // Backend minta "Tote Bag" (pakai spasi), bukan "ToteBag"
            type: isTumbler ? 'Tumbler' : 'Tote Bag', 
            // Backend mewajibkan field personality
            personality: isTumbler ? 'Ceria & Energik' : 'Ramah & Setia' 
        };

        await api.post('/items/choose', payload);

        toast.success(`Selamat! Kamu memilih ${payload.name}`);
        setShowSelectModal(false);
        fetchUserProfile(); 

    } catch (error) {
        const err = error as ApiError;
        const msg = err.response?.data?.message || 'Gagal memilih item';
        // Backend class-validator mengirim array pesan error
        toast.error(Array.isArray(msg) ? msg[0] : msg); 
    } finally {
        setSelectLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const getItemIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('botol') || lower.includes('tumbler')) return '🥤';
    if (lower.includes('tas') || lower.includes('bag')) return '🎒';
    return '🌟';
  };

  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-emerald-50">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
    );
  }

  if (!user) return null;
  const isDoneToday = hasCheckedInToday();

  return (
    <main className="min-h-screen bg-[#F0FDF4] pb-24 font-sans text-slate-800">
      <Toaster position="top-center" />
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl -z-10"></div>
      <div className="fixed bottom-0 right-0 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl -z-10"></div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur-xl border border-white md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-950">Halo, {user.fullName.split(' ')[0]}! 👋</h1>
            <p className="text-emerald-600/80 font-medium">Siap membuat bumi lebih hijau?</p>
          </div>
          <button onClick={handleLogout} className="group relative overflow-hidden rounded-full bg-red-50 px-6 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg">
            <span className="relative z-10">Keluar</span>
          </button>
        </div>

        {/* SECTION 1: MAIN STATS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            
            {/* KARTU PARTNER SETIA */}
            <div className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white shadow-2xl shadow-emerald-900/20 transition-transform hover:scale-[1.01]">
                <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-400/20 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 w-fit backdrop-blur-md border border-white/10">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Partner Setia</span>
                        </div>
                        
                        <h3 className="text-4xl font-black tracking-tight mb-1">
                          {user.activeItem ? user.activeItem.name : "Belum Ada Partner"}
                        </h3>
                        
                        {user.activeItem ? (
                          <div className="mt-4 max-w-sm">
                             <div className="flex justify-between text-xs font-bold text-emerald-100 mb-2">
                                <span>LEVEL {user.activeItem.level}</span>
                                <span>{user.activeItem.currentXp} / {user.activeItem.nextLevelXp} XP</span>
                             </div>
                             <div className="h-4 w-full overflow-hidden rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
                                <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 relative transition-all duration-700" style={{ width: `${Math.min(100, (user.activeItem.currentXp / user.activeItem.nextLevelXp) * 100)}%` }}></div>
                             </div>
                             
                             <button onClick={handleCheckIn} disabled={checkInLoading || isDoneToday} className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${isDoneToday ? 'bg-emerald-900/40 text-emerald-200 cursor-not-allowed border border-white/10' : 'bg-white/20 text-white hover:bg-white hover:text-emerald-800 hover:shadow-lg'}`}>
                                {checkInLoading ? <span className="animate-spin">⏳</span> : isDoneToday ? <span>✅</span> : <span>💖</span>}
                                {checkInLoading ? 'Memproses...' : isDoneToday ? 'Sudah Dirawat Hari Ini' : 'Rawat & Dapat XP'}
                             </button>
                          </div>
                        ) : (
                          <div className="mt-4">
                              <p className="text-emerald-100 mb-4 text-sm">Pilih tumbler atau tas belanjamu!</p>
                              {/* TOMBOL BUKA MODAL */}
                              <button onClick={() => setShowSelectModal(true)} className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-emerald-800 shadow-lg hover:bg-emerald-50 transition-transform active:scale-95">
                                Pilih Partner Sekarang
                              </button>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="relative h-32 w-32 md:h-40 md:w-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm animate-float">
                            <span className="text-7xl md:text-8xl filter drop-shadow-lg">
                                {user.activeItem ? getItemIcon(user.activeItem.name) : '🌱'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATISTIK KECIL */}
            <div className="md:col-span-4 flex flex-col gap-6">
                <div className="flex-1 rounded-[2rem] bg-white p-6 shadow-sm border border-emerald-50 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-yellow-50 transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-2xl shadow-sm">💰</div>
                            <span className="font-bold text-slate-600">Ijo Coins</span>
                        </div>
                        <span className="text-5xl font-black text-slate-800 tracking-tight">{user.ijoCoins}</span>
                    </div>
                </div>
                <div className="flex-1 rounded-[2rem] bg-white p-6 shadow-sm border border-emerald-50 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-50 transition-transform group-hover:scale-150"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl shadow-sm">🎟️</div>
                            <span className="font-bold text-slate-600">Tiket Game</span>
                        </div>
                        <span className="text-5xl font-black text-slate-800 tracking-tight">{user.gameTickets}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* MENU AKTIVITAS */}
        <div>
            <h2 className="mb-6 text-xl font-bold text-slate-800 flex items-center gap-2"><span>🚀</span> Mulai Misi</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Link href="/dashboard/scan" className="group rounded-[2rem] bg-white p-6 shadow-sm border border-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="h-14 w-14 mb-4 flex items-center justify-center rounded-2xl bg-emerald-100 text-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">📷</div>
                    <h3 className="font-bold text-slate-800">Scan Sampah</h3>
                    <p className="text-sm text-slate-500 mt-1">Gunakan AI untuk memilah sampah.</p>
                </Link>
                <Link href="/dashboard/game" className="group rounded-[2rem] bg-white p-6 shadow-sm border border-purple-50 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="h-14 w-14 mb-4 flex items-center justify-center rounded-2xl bg-purple-100 text-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">🕹️</div>
                    <h3 className="font-bold text-slate-800">Ijo Dash</h3>
                    <p className="text-sm text-slate-500 mt-1">Mainkan game tangkap sampah.</p>
                </Link>
                 <Link href="/dashboard/leaderboard" className="group rounded-[2rem] bg-white p-6 shadow-sm border border-yellow-50 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="h-14 w-14 mb-4 flex items-center justify-center rounded-2xl bg-yellow-100 text-2xl group-hover:bg-yellow-500 group-hover:text-white transition-colors">📊</div>
                    <h3 className="font-bold text-slate-800">Klasemen</h3>
                    <p className="text-sm text-slate-500 mt-1">Lihat peringkat siswa terbaik.</p>
                </Link>
            </div>
        </div>

        {/* MODAL PILIH PARTNER */}
        {showSelectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
                    <h2 className="text-2xl font-black text-center text-emerald-900 mb-2">Pilih Partner Kamu</h2>
                    <p className="text-center text-slate-500 mb-6 text-sm">Teman setia yang akan menemanimu menjaga bumi.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleSelectItem('Tumbler')}
                            disabled={selectLoading}
                            className="flex flex-col items-center p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🥤</div>
                            <span className="font-bold text-slate-800">Si Botol Sakti</span>
                            <span className="text-xs text-slate-400 mt-1">Hemat plastik!</span>
                        </button>

                        <button 
                            onClick={() => handleSelectItem('ToteBag')} // ID frontend
                            disabled={selectLoading}
                            className="flex flex-col items-center p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                        >
                            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🎒</div>
                            <span className="font-bold text-slate-800">Tas Ajaib</span>
                            <span className="text-xs text-slate-400 mt-1">Anti kantong kresek!</span>
                        </button>
                    </div>
                    <button onClick={() => setShowSelectModal(false)} className="mt-6 w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600">Nanti Saja</button>
                </div>
            </div>
        )}

      </div>
    </main>
  );
}