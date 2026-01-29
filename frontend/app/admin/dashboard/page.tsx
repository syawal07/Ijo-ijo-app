'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Settings, 
  Search, 
  Filter,
  ShieldAlert,
  Ban,
  RefreshCw,
  MoreVertical,
  LayoutDashboard
} from 'lucide-react';
// 👇 IMPORT HELPER
import { getDriveImage } from '@/app/utils/driveHelper';

interface User {
  _id: string;
  fullName: string;
  email: string;
  schoolClass: string;
  role: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [logoEmoji, setLogoEmoji] = useState('🛡️');

  // Fetch Data
  const fetchUsersAndContent = async () => {
    try {
      const userRes = await api.get('/users');
      setUsers(userRes.data);

      const contentRes = await api.get('/content/public');
      if (contentRes.data?.auth_section?.logo_emoji) {
          setLogoEmoji(contentRes.data.auth_section.logo_emoji);
      }
    } catch (error) {
      console.error('Gagal load data:', error);
      toast.error('Gagal memuat data.');
    } finally {
      // Delay sedikit biar animasi loading kerasa
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) router.push('/login');
    fetchUsersAndContent();
  }, [router]);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'rejected', userName: string) => {
      // Custom toast confirm bisa ditambahkan disini, tapi kita pakai confirm standar dulu biar cepat
      const confirmMsg = newStatus === 'active' 
        ? `Setujui akun ${userName}?` 
        : `Tolak/Blokir akun ${userName}?`;
      
      if (!confirm(confirmMsg)) return;

      const toastId = toast.loading('Memproses...');
      try {
          await api.patch(`/users/${userId}/status`, { status: newStatus });
          toast.success(`${newStatus === 'active' ? 'Akun Aktif ✅' : 'Akun Ditolak 🚫'}`, { id: toastId });
          
          // Optimistic update atau refetch
          const response = await api.get('/users');
          setUsers(response.data);
      } catch (error) {
          toast.error('Gagal mengubah status.', { id: toastId });
      }
  };

  const handleLogout = () => {
      Cookies.remove('token');
      router.push('/login');
  };

  // Logic Filter
  const filteredUsers = users.filter(user => {
      const matchesFilter = filter === 'all' ? true : user.status === filter;
      const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.schoolClass.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="font-mono text-emerald-400 animate-pulse">MEMUAT DATA ADMIN...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-x-hidden selection:bg-indigo-100">
      <Toaster position="top-right" />
      
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 w-full h-[300px] bg-gradient-to-b from-slate-900 to-slate-800"></div>
          <div className="absolute top-[200px] left-0 w-full h-[200px] bg-gradient-to-b from-slate-800 to-slate-50"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 px-6 py-4 shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                     {(logoEmoji.includes('http') || logoEmoji.includes('/')) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={getDriveImage(logoEmoji)} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     ) : (
                        <span className="text-2xl">{logoEmoji}</span>
                     )}
                  </div>
                  <div>
                      <h1 className="font-bold text-white text-lg tracking-tight">Admin Console</h1>
                      <p className="text-xs text-emerald-400 font-medium tracking-wide">Administrator Access</p>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                <Link 
                  href="/admin/dashboard/content" 
                  className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-lg transition-all border border-white/5"
                >
                    <Settings className="w-4 h-4" />
                    <span>CMS Settings</span>
                </Link>

                <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5">
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                </button>
              </div>
          </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8 -mt-2 space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          {/* --- STATS CARDS (Floating Style) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total User */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                  <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Siswa</p>
                      <p className="text-4xl font-black text-slate-800">{users.length}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7" />
                  </div>
              </div>

              {/* Pending */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                  <div className="relative z-10">
                      <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                          Menunggu <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      </p>
                      <p className="text-4xl font-black text-slate-800">{users.filter(u => u.status === 'pending').length}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform relative z-10">
                      <Clock className="w-7 h-7" />
                  </div>
                  {/* Decorative Blob */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-yellow-100 rounded-full blur-2xl opacity-50"></div>
              </div>

              {/* Active */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300">
                  <div>
                      <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">Siswa Aktif</p>
                      <p className="text-4xl font-black text-slate-800">{users.filter(u => u.status === 'active').length}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-7 h-7" />
                  </div>
              </div>
          </div>

          {/* --- CONTROL BAR (Search & Filter) --- */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1">
                  {(['pending', 'active', 'all'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap ${
                            filter === f 
                            ? f === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm' 
                            : f === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                            : 'bg-slate-800 text-white border-slate-800 shadow-sm'
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-50'
                        }`}
                      >
                          {f === 'pending' ? '⏳ Perlu Persetujuan' : f === 'active' ? '✅ Siswa Aktif' : '📋 Semua Data'}
                      </button>
                  ))}
              </div>

              <div className="relative w-full md:w-72 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                      type="text" 
                      placeholder="Cari siswa, email, atau kelas..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all hover:bg-white"
                  />
              </div>
          </div>

          {/* --- DATA TABLE --- */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                          <tr>
                              <th className="p-6 pl-8">Identitas Siswa</th>
                              <th className="p-6">Info Kelas</th>
                              <th className="p-6">Status Akun</th>
                              <th className="p-6">Waktu Daftar</th>
                              <th className="p-6 text-center">Aksi / Kontrol</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredUsers.length === 0 ? (
                              <tr>
                                  <td colSpan={5} className="p-16 text-center">
                                      <div className="flex flex-col items-center justify-center text-slate-300">
                                          <Filter className="w-16 h-16 mb-4 opacity-20" />
                                          <p className="font-bold text-lg text-slate-500">Data Tidak Ditemukan</p>
                                          <p className="text-xs mt-1">Coba ubah filter atau kata kunci pencarian.</p>
                                      </div>
                                  </td>
                              </tr>
                          ) : (
                              filteredUsers.map((user) => (
                                  <tr key={user._id} className="group hover:bg-slate-50/50 transition-colors">
                                      <td className="p-5 pl-8">
                                          <div className="flex items-center gap-4">
                                              {/* Avatar Dinamis */}
                                              <div className="h-11 w-11 rounded-full bg-indigo-50 p-0.5 border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors">
                                                  <img 
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}&backgroundColor=e0e7ff`} 
                                                    alt="Avatar" 
                                                    className="h-full w-full rounded-full" 
                                                  />
                                              </div>
                                              <div>
                                                  <p className="font-bold text-slate-800 text-base">{user.fullName}</p>
                                                  <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                              </div>
                                          </div>
                                      </td>
                                      
                                      <td className="p-5">
                                          <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                                              {user.schoolClass}
                                          </span>
                                      </td>
                                      
                                      <td className="p-5">
                                          {user.status === 'pending' && (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending
                                              </span>
                                          )}
                                          {user.status === 'active' && (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                  <CheckCircle className="w-3 h-3" /> Aktif
                                              </span>
                                          )}
                                          {user.status === 'rejected' && (
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                  <Ban className="w-3 h-3" /> Ditolak
                                              </span>
                                          )}
                                      </td>
                                      
                                      <td className="p-5 text-slate-500 text-xs font-medium">
                                          {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          <span className="block text-[10px] text-slate-300 mt-0.5">
                                              {new Date(user.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}
                                          </span>
                                      </td>
                                      
                                      <td className="p-5 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                              
                                              {/* ACTION FOR PENDING */}
                                              {user.status === 'pending' && (
                                                  <>
                                                      <button 
                                                        onClick={() => handleStatusChange(user._id, 'active', user.fullName)}
                                                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:scale-110" 
                                                        title="Setujui Masuk"
                                                      >
                                                          <CheckCircle className="w-5 h-5" />
                                                      </button>
                                                      <button 
                                                        onClick={() => handleStatusChange(user._id, 'rejected', user.fullName)}
                                                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-110" 
                                                        title="Tolak Pendaftaran"
                                                      >
                                                          <XCircle className="w-5 h-5" />
                                                      </button>
                                                  </>
                                              )}

                                              {/* ACTION FOR ACTIVE (CARD BLOKIR) */}
                                              {user.status === 'active' && (
                                                  <button 
                                                    onClick={() => handleStatusChange(user._id, 'rejected', user.fullName)}
                                                    className="group/btn flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-red-600/30"
                                                    title="Blokir Akses Siswa Ini"
                                                  >
                                                     <ShieldAlert className="w-4 h-4 text-red-500 group-hover/btn:text-white transition-colors" />
                                                     <span className="text-xs font-bold text-red-600 group-hover/btn:text-white transition-colors">BLOKIR</span>
                                                  </button>
                                              )}

                                              {/* ACTION FOR REJECTED */}
                                              {user.status === 'rejected' && (
                                                   <button 
                                                     onClick={() => handleStatusChange(user._id, 'active', user.fullName)}
                                                     className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-200"
                                                   >
                                                      <RefreshCw className="w-3 h-3" /> Pulihkan
                                                   </button>
                                              )}
                                          </div>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Database System v1.0 • {users.length} Total Data
                  </p>
              </div>
          </div>
      </main>
    </div>
  );
}