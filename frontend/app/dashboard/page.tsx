'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LogOut, 
  Trophy, 
  Gamepad2, 
  ScanLine, 
  ChevronRight, 
  Sparkles,
  Leaf,
  Clock
} from 'lucide-react';

// --- TIPE DATA (LOGIC TETAP SAMA) ---
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
      message?: string | string[];
    };
  };
}

// --- LOADING SKELETON (Modern) ---
const DashboardSkeleton = () => (
  <div className="mx-auto max-w-6xl px-6 py-8 space-y-8 animate-pulse relative z-10">
    <div className="flex justify-between items-center">
        <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20"></div>
            <div className="space-y-2">
                <div className="h-4 w-24 rounded-full bg-white/20"></div>
                <div className="h-8 w-48 rounded-full bg-white/30"></div>
            </div>
        </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 h-96 rounded-[2.5rem] bg-white/20 backdrop-blur-sm"></div>
      <div className="md:col-span-4 flex flex-col gap-6">
        <div className="h-44 rounded-[2rem] bg-white/30 backdrop-blur-sm"></div>
        <div className="h-44 rounded-[2rem] bg-white/30 backdrop-blur-sm"></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [greeting, setGreeting] = useState('Halo');
  
  // Modal State
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);

  // 1. Logic Sapaan Waktu
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 11) setGreeting('Selamat Pagi ☀️');
    else if (hours < 15) setGreeting('Selamat Siang 🌤️');
    else if (hours < 18) setGreeting('Selamat Sore 🌆');
    else setGreeting('Selamat Malam 🌙');
  }, []);

  // 2. Fetch Data Profil
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error("Gagal ambil data profile:", error);
      Cookies.remove('token');
      router.push('/login');
    } finally {
      setTimeout(() => setLoading(false), 800);
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

  // 3. FUNGSI CHECK-IN
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
        toast.success(`LEVEL UP! ${user.activeItem.name} naik level! 🎉`, { 
            duration: 5000,
            icon: '🆙'
        });
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

  // 4. FUNGSI PILIH PARTNER
  const handleSelectItem = async (selection: 'Tumbler' | 'ToteBag') => {
    setSelectLoading(true);
    try {
        const isTumbler = selection === 'Tumbler';
        const payload = {
            name: isTumbler ? 'Si Botol Sakti' : 'Tas Ajaib',
            type: isTumbler ? 'Tumbler' : 'Tote Bag', 
            personality: isTumbler ? 'Ceria & Energik' : 'Ramah & Setia' 
        };

        await api.post('/items/choose', payload);
        toast.success(`Selamat! Kamu memilih ${payload.name}`);
        setShowSelectModal(false);
        fetchUserProfile(); 
    } catch (error) {
        const err = error as ApiError;
        const msg = err.response?.data?.message || 'Gagal memilih item';
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

  // Hitung persentase XP (Safe calculation)
  const xpPercentage = user?.activeItem 
    ? Math.min(100, (user.activeItem.currentXp / user.activeItem.nextLevelXp) * 100)
    : 0;

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F0F5F3] relative overflow-hidden">
             {/* Background Loading */}
             <div className="absolute top-[-20%] left-[-20%] h-[800px] w-[800px] rounded-full bg-emerald-300/20 blur-[120px]"></div>
             <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-teal-300/20 blur-[120px]"></div>
             <div className="relative z-10 pt-10">
                 <DashboardSkeleton />
             </div>
        </div>
    );
  }

  if (!user) return null;
  const isDoneToday = hasCheckedInToday();

  return (
    <main className="min-h-screen bg-[#F4F7F6] pb-24 font-sans text-slate-800 selection:bg-emerald-200 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* === BACKGROUND PREMIUM (Wayground Style: Mesh Gradient) === */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
          {/* Base color lembut */}
          <div className="absolute inset-0 bg-[#F4F7F6]"></div>
          
          {/* Orbs Warna yang 'Bernafas' */}
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-200/40 blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[-10%] w-[700px] h-[700px] rounded-full bg-teal-100/60 blur-[120px]"></div>
          <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-yellow-100/40 blur-[100px]"></div>
          
          {/* Noise Texture (Optional: Memberi kesan kertas/natural) */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* === HEADER === */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
             <div className="relative group cursor-pointer">
                {/* Glow Avatar */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative h-16 w-16 rounded-full p-0.5 bg-white shadow-lg border border-white/50">
                    <div className="h-full w-full rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}&backgroundColor=ecfdf5`} alt="Avatar" />
                    </div>
                </div>
             </div>
             <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-0.5 flex items-center gap-1">
                    {greeting} <Leaf className="w-3 h-3 fill-emerald-600" />
                </p>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 truncate max-w-[200px] md:max-w-md tracking-tight">
                    {user.fullName}
                </h1>
             </div>
          </div>
          
          <button onClick={handleLogout} className="group flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-500 shadow-sm border border-red-50 transition-all hover:bg-red-500 hover:text-white hover:shadow-xl hover:-translate-y-0.5">
               <LogOut className="w-4 h-4" />
               <span>Keluar</span>
          </button>
        </div>

        {/* === SECTION 1: HERO BOARD (Bento Grid) === */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            
            {/* KARTU PARTNER UTAMA */}
            <div className="md:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-[#0F3930] text-white shadow-2xl shadow-emerald-900/20 group transition-transform hover:scale-[1.01] duration-500">
                {/* Abstract Background Shapes inside Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F3930] to-[#064e3b]"></div>
                <div className="absolute top-0 right-0 h-full w-3/4 bg-white/5 -skew-x-12 blur-3xl rounded-full translate-x-10"></div>
                <div className="absolute bottom-0 left-0 h-64 w-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 h-full">
                    
                    {/* Kiri: Info & Stats */}
                    <div className="flex-1 w-full flex flex-col justify-between h-full min-h-[260px]">
                        <div>
                            {/* Chip Status */}
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/10 mb-5 shadow-inner">
                                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Partner Setia</span>
                            </div>
                            
                            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-3 drop-shadow-md text-white">
                                {user.activeItem ? user.activeItem.name : "Pilih Partner"}
                            </h3>
                            
                            {user.activeItem ? (
                                <p className="text-emerald-200/90 text-base font-medium flex items-center gap-2">
                                    <span className={`h-3 w-3 rounded-full ${isDoneToday ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-red-400 animate-pulse'}`}></span>
                                    Mood: <span className="text-white font-bold">{isDoneToday ? "Senang & Bersih ✨" : "Butuh Perhatian! ⚠️"}</span>
                                </p>
                            ) : (
                                <p className="text-emerald-200 text-base">Mulai perjalananmu dengan memilih partner.</p>
                            )}
                        </div>

                        {/* Progress Bar & Tombol */}
                        {user.activeItem ? (
                            <div className="mt-auto pt-6 w-full max-w-sm">
                                <div className="flex justify-between items-end text-sm font-bold text-emerald-100 mb-2">
                                    <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-md">LVL {user.activeItem.level}</span>
                                    <span className="text-emerald-300">{user.activeItem.currentXp} <span className="text-white/40">/ {user.activeItem.nextLevelXp} XP</span></span>
                                </div>
                                
                                {/* Bar XP */}
                                <div className="h-5 w-full overflow-hidden rounded-full bg-slate-900/40 backdrop-blur-sm border border-white/10 relative shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-green-300 relative transition-all duration-1000 ease-out flex items-center justify-end pr-1" 
                                        style={{ width: `${xpPercentage}%` }}
                                    >
                                        <div className="h-full w-full absolute top-0 left-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleCheckIn} 
                                    disabled={checkInLoading || isDoneToday} 
                                    className={`mt-6 w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold transition-all shadow-xl active:scale-95 group/btn
                                        ${isDoneToday 
                                            ? 'bg-emerald-950/40 text-emerald-500/50 cursor-not-allowed border border-white/5' 
                                            : 'bg-white text-emerald-950 hover:bg-emerald-50 hover:shadow-emerald-500/20'
                                        }`}
                                >
                                    {checkInLoading ? <span className="animate-spin">⏳</span> : isDoneToday ? <span>✅</span> : <span className="group-hover/btn:scale-125 transition-transform">💖</span>}
                                    {checkInLoading ? 'Menyimpan...' : isDoneToday ? 'Selesai Hari Ini' : 'Rawat & Tambah XP'}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-8">
                                <button 
                                    onClick={() => setShowSelectModal(true)} 
                                    className="w-full md:w-auto rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-900 shadow-xl hover:bg-emerald-50 hover:scale-105 transition-all animate-bounce"
                                >
                                    + Pilih Partner Sekarang
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Kanan: Visual Icon Besar */}
                    <div className="flex items-center justify-center relative mt-6 md:mt-0">
                        {/* Glow Circle */}
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl transform scale-150 animate-pulse"></div>
                        <div className="relative h-48 w-48 md:h-56 md:w-56 flex items-center justify-center rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-2xl backdrop-blur-md animate-float hover:scale-105 transition-transform duration-500">
                            <span className="text-8xl md:text-9xl filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] select-none transform hover:rotate-6 transition-transform cursor-pointer">
                                {user.activeItem ? getItemIcon(user.activeItem.name) : '🌱'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* KARTU STATISTIK (Vertical Stack) */}
            <div className="md:col-span-4 flex flex-col gap-6">
                
                {/* Coin Card */}
                <div className="flex-1 rounded-[2.5rem] bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-white hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-50 transition-transform group-hover:scale-150 duration-700"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-300">💰</div>
                            <div>
                                <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block">Dompet Saya</span>
                                <span className="font-bold text-slate-800 text-lg">Ijo Coins</span>
                            </div>
                        </div>
                        <div className="border-t border-slate-50 pt-4">
                             <span className="text-5xl font-black text-slate-800 tracking-tighter">{user.ijoCoins}</span>
                        </div>
                    </div>
                </div>

                {/* Ticket Card */}
                <div className="flex-1 rounded-[2.5rem] bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-white hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-50 transition-transform group-hover:scale-150 duration-700"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl shadow-inner group-hover:-rotate-12 transition-transform duration-300">🎟️</div>
                            <div>
                                <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block">Tiket Main</span>
                                <span className="font-bold text-slate-800 text-lg">Game Ticket</span>
                            </div>
                        </div>
                        <div className="border-t border-slate-50 pt-4">
                             <span className="text-5xl font-black text-slate-800 tracking-tighter">{user.gameTickets}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* === SECTION 2: MENU AKTIVITAS === */}
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="bg-emerald-100 p-2 rounded-xl text-xl">🚀</span> 
                    Misi Hari Ini
                </h2>
                <Link href="/dashboard/game" className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-all">
                    Lihat Semua <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* SCAN CARD */}
                <Link href="/dashboard/scan" className="group relative overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 p-8 flex flex-col h-full">
                        <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-3xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm duration-300">
                            <ScanLine className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">Scan Sampah AI</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">Gunakan kamera untuk memilah jenis sampah secara otomatis.</p>
                        <div className="mt-auto pt-6 flex items-center text-sm font-bold text-blue-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Mulai Scan Sekarang <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

                {/* GAME CARD */}
                <Link href="/dashboard/game" className="group relative overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-fuchsia-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 p-8 flex flex-col h-full">
                        <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-3xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm duration-300">
                            <Gamepad2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-700 transition-colors">Ijo Dash Game</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">Mainkan game tangkap sampah, kumpulkan poin, dan raih tiket!</p>
                        <div className="mt-auto pt-6 flex items-center text-sm font-bold text-purple-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Main Game <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>

                {/* LEADERBOARD CARD */}
                <Link href="/dashboard/leaderboard" className="group relative overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 p-8 flex flex-col h-full">
                        <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-3xl bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors shadow-sm duration-300">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-yellow-700 transition-colors">Klasemen Juara</h3>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">Lihat siapa pahlawan lingkungan terbaik minggu ini!</p>
                        <div className="mt-auto pt-6 flex items-center text-sm font-bold text-yellow-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Cek Peringkat <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>

        {/* MODAL PILIH PARTNER (Visual Upgrade) */}
        {showSelectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border-[6px] border-white/50 bg-clip-padding ring-1 ring-black/5">
                    <div className="text-center mb-10">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner border-4 border-white">
                            🎁
                        </div>
                        <h2 className="text-3xl font-black text-slate-800">Pilih Partner Kamu</h2>
                        <p className="text-slate-500 mt-2 font-medium">Pilih teman setia yang akan menemanimu menjaga bumi.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                        <button 
                            onClick={() => handleSelectItem('Tumbler')}
                            disabled={selectLoading}
                            className="group relative flex flex-col items-center p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
                                <div className="h-6 w-6 rounded-full border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                            </div>
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform filter drop-shadow-md">🥤</div>
                            <span className="font-bold text-lg text-slate-800 group-hover:text-blue-700">Si Botol Sakti</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 bg-white px-2 py-1 rounded-lg border border-slate-200">Type: Tumbler</span>
                        </button>

                        <button 
                            onClick={() => handleSelectItem('ToteBag')}
                            disabled={selectLoading}
                            className="group relative flex flex-col items-center p-6 rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-purple-500 hover:bg-purple-50 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-purple-500 transition-opacity">
                                <div className="h-6 w-6 rounded-full border-2 border-purple-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                            </div>
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform filter drop-shadow-md">🎒</div>
                            <span className="font-bold text-lg text-slate-800 group-hover:text-purple-700">Tas Ajaib</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 bg-white px-2 py-1 rounded-lg border border-slate-200">Type: Tote Bag</span>
                        </button>
                    </div>
                    
                    <button onClick={() => setShowSelectModal(false)} className="mt-8 w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                        Saya mau pikir-pikir dulu...
                    </button>
                </div>
            </div>
        )}

      </div>
    </main>
  );
}