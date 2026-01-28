'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Pastikan ini di-import
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';

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
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Gagal load users:', error);
      toast.error('Gagal memuat data user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) router.push('/login');
    fetchUsers();
  }, [router]);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'rejected', userName: string) => {
      const confirmMsg = newStatus === 'active' 
        ? `Setujui akun ${userName}?` 
        : `Tolak akun ${userName}?`;
      
      if (!confirm(confirmMsg)) return;

      try {
          await api.patch(`/users/${userId}/status`, { status: newStatus });
          toast.success(`Berhasil: ${userName} sekarang ${newStatus === 'active' ? 'Aktif ✅' : 'Ditolak ❌'}`);
          fetchUsers(); 
      } catch (error) {
          toast.error('Gagal mengubah status.');
      }
  };

  const handleLogout = () => {
      Cookies.remove('token');
      router.push('/login');
  };

  const filteredUsers = users.filter(user => {
      if (filter === 'all') return true;
      return user.status === filter;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Toaster position="top-right" />
      
      {/* --- NAVBAR ADMIN --- */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                  <h1 className="font-bold text-lg leading-none">Admin Dashboard</h1>
                  <p className="text-xs text-slate-400">Panel Kontrol Sekolah</p>
              </div>
          </div>

          <div className="flex items-center gap-4">
            {/* TOMBOL MENU CMS (YANG TADINYA HILANG) */}
            {/* Link disesuaikan dengan folder tempat kamu simpan file CMS */}
            <Link 
              href="/admin/dashboard/content" 
              className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-all font-bold shadow-lg"
            >
                <span>⚙️</span> Edit Konten Web
            </Link>

            <button onClick={handleLogout} className="text-sm bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold shadow-lg">
                Keluar
            </button>
          </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-slate-400 text-sm font-bold uppercase">Total Siswa</p>
                  <p className="text-4xl font-black text-slate-800 mt-2">{users.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-yellow-600 text-sm font-bold uppercase">Menunggu Persetujuan</p>
                  <p className="text-4xl font-black text-yellow-500 mt-2">{users.filter(u => u.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-emerald-600 text-sm font-bold uppercase">Siswa Aktif</p>
                  <p className="text-4xl font-black text-emerald-500 mt-2">{users.filter(u => u.status === 'active').length}</p>
              </div>
          </div>

          {/* TABEL USER */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-bold text-xl">Daftar Pendaftaran</h2>
                  
                  {/* Filter Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                      {(['pending', 'active', 'all'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${filter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                              {f === 'pending' ? '⏳ Pending' : f === 'active' ? '✅ Aktif' : 'Semua'}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                          <tr>
                              <th className="p-4">Nama Lengkap</th>
                              <th className="p-4">Kelas</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-center">Aksi</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredUsers.length === 0 ? (
                              <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">Tidak ada data user.</td>
                              </tr>
                          ) : (
                              filteredUsers.map((user) => (
                                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-4 font-bold text-slate-800">{user.fullName}</td>
                                      <td className="p-4 text-slate-500">{user.schoolClass}</td>
                                      <td className="p-4 text-slate-500">{user.email}</td>
                                      <td className="p-4">
                                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                              user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                              'bg-red-100 text-red-700'
                                          }`}>
                                              {user.status.toUpperCase()}
                                          </span>
                                      </td>
                                      <td className="p-4 text-center">
                                          {user.status === 'pending' && (
                                              <div className="flex justify-center gap-2">
                                                  <button 
                                                    onClick={() => handleStatusChange(user._id, 'active', user.fullName)}
                                                    className="bg-emerald-100 text-emerald-600 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" 
                                                    title="Setujui"
                                                  >
                                                      ✅
                                                  </button>
                                                  <button 
                                                    onClick={() => handleStatusChange(user._id, 'rejected', user.fullName)}
                                                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all" 
                                                    title="Tolak"
                                                  >
                                                      ❌
                                                  </button>
                                              </div>
                                          )}
                                          {user.status === 'active' && (
                                               <button 
                                                 onClick={() => handleStatusChange(user._id, 'rejected', user.fullName)}
                                                 className="text-xs text-red-400 hover:text-red-600 underline"
                                               >
                                                  Blokir Akun
                                               </button>
                                          )}
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </main>
    </div>
  );
}