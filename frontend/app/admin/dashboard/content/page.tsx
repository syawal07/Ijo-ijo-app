'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';

// 1. DEFINISI TIPE DATA (Interface)
interface HeroSection {
  title: string;
  subtitle: string;
  cta_text: string;
  hero_image: string;
}

interface AuthSection {
  logo_emoji: string;
  project_name: string;
  login_title_start: string;
  login_title_end: string;
  login_desc: string;
  register_title_start: string;
  register_title_end: string;
  register_desc: string;
  register_quote: string;
  feature_card_title: string;
  feature_card_desc: string;
}

interface FooterInfo {
  about: string;
  contact: string;
  address: string;
  social_ig: string;
}

// Tipe Data Utama untuk State
interface ContentData {
  hero_section: HeroSection;
  auth_section: AuthSection;
  footer_info: FooterInfo;
  // Index signature agar bisa diakses secara dinamis
  [key: string]: HeroSection | AuthSection | FooterInfo; 
}

export default function AdminContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState<ContentData>({
    hero_section: { title: '', subtitle: '', cta_text: '', hero_image: '' },
    auth_section: { logo_emoji: '', project_name: '', login_title_start: '', login_title_end: '', login_desc: '', register_title_start: '', register_title_end: '', register_desc: '', register_quote: '', feature_card_title: '', feature_card_desc: '' },
    footer_info: { about: '', contact: '', address: '', social_ig: '' },
  });

  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/content/public');
        // Type casting aman karena kita percaya data backend sesuai struktur
        setContent((prev: ContentData) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Gagal mengambil data konten.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- BAGIAN YANG DIPERBAIKI ---
  const handleInputChange = (section: string, field: string, value: string) => {
    setContent((prev: ContentData) => {
      // 1. Ambil bagian section yang mau diedit (misal: hero_section)
      const currentSection = prev[section];

      // 2. Buat salinan baru. 
      // Kita gunakan 'as unknown as Record<string, string>'
      // Ini trik aman untuk memuaskan TypeScript & ESLint saat mengedit object dinamis.
      const updatedSection = {
        ...(currentSection as unknown as Record<string, string>),
        [field]: value
      };

      // 3. Kembalikan state baru dengan type casting yang sesuai
      return {
        ...prev,
        [section]: updatedSection
      } as ContentData;
    });
  };
  // ------------------------------

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      await api.post('/content/update', {
        key: section,
        value: content[section]
      });
      toast.success('Perubahan berhasil disimpan! 💾');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
      Cookies.remove('token');
      router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat CMS...</div>;

  // Helper variables untuk akses JSX lebih mudah
  const hero = content.hero_section as HeroSection;
  const auth = content.auth_section as AuthSection;
  const footer = content.footer_info as FooterInfo;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Toaster position="top-right" />
      
      {/* NAVBAR ADMIN */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                  <h1 className="font-bold text-lg leading-none">CMS Content</h1>
                  <p className="text-xs text-slate-400">Edit Tampilan Website</p>
              </div>
          </div>
          <div className="flex gap-4 text-sm font-medium">
              <Link href="/admin/dashboard" className="text-slate-400 hover:text-white py-2">← Kembali ke Dashboard</Link>
              <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Keluar
              </button>
          </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex">
              
              {/* SIDEBAR TABS */}
              <div className="w-1/4 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
                  <button 
                    onClick={() => setActiveTab('hero')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'hero' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                      🏠 Hero (Beranda)
                  </button>
                  <button 
                    onClick={() => setActiveTab('auth')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'auth' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                      🔐 Login & Register
                  </button>
                  <button 
                    onClick={() => setActiveTab('footer')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'footer' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                      🦶 Footer & Info
                  </button>
              </div>

              {/* CONTENT AREA */}
              <div className="w-3/4 p-8">
                  
                  {/* --- TAB HERO --- */}
                  {activeTab === 'hero' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                          <h2 className="text-2xl font-black text-slate-800 border-b pb-4">Edit Halaman Depan</h2>
                          
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Judul Besar</label>
                              <input 
                                type="text" 
                                value={hero.title}
                                onChange={(e) => handleInputChange('hero_section', 'title', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none font-bold text-lg"
                              />
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Sub-Judul</label>
                              <textarea 
                                value={hero.subtitle}
                                onChange={(e) => handleInputChange('hero_section', 'subtitle', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-24 resize-none"
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Teks Tombol</label>
                                  <input 
                                    type="text" 
                                    value={hero.cta_text}
                                    onChange={(e) => handleInputChange('hero_section', 'cta_text', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                                  />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Link Gambar Hero</label>
                                  <input 
                                    type="text" 
                                    value={hero.hero_image}
                                    onChange={(e) => handleInputChange('hero_section', 'hero_image', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                                  />
                              </div>
                          </div>

                          <div className="pt-4 text-right">
                              <button onClick={() => handleSave('hero_section')} disabled={saving} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                                  {saving ? 'Menyimpan...' : 'Simpan Perubahan Hero'}
                              </button>
                          </div>
                      </div>
                  )}

                  {/* --- TAB AUTH --- */}
                  {activeTab === 'auth' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 h-[500px] overflow-y-auto pr-2">
                          <h2 className="text-2xl font-black text-slate-800 border-b pb-4">Edit Login & Register</h2>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Project</label>
                                  <input 
                                    type="text" value={auth.project_name}
                                    onChange={(e) => handleInputChange('auth_section', 'project_name', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg"
                                  />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Emoji Logo</label>
                                  <input 
                                    type="text" value={auth.logo_emoji}
                                    onChange={(e) => handleInputChange('auth_section', 'logo_emoji', e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg"
                                  />
                              </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                             <h3 className="font-bold text-slate-700">Halaman Login</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Judul Awal (Selamat Datang)" value={auth.login_title_start} onChange={(e) => handleInputChange('auth_section', 'login_title_start', e.target.value)} className="p-2 border rounded" />
                                <input placeholder="Judul Akhir (Kembali.)" value={auth.login_title_end} onChange={(e) => handleInputChange('auth_section', 'login_title_end', e.target.value)} className="p-2 border rounded" />
                             </div>
                             <textarea placeholder="Deskripsi Login" value={auth.login_desc} onChange={(e) => handleInputChange('auth_section', 'login_desc', e.target.value)} className="w-full p-2 border rounded h-20" />
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                             <h3 className="font-bold text-slate-700">Halaman Register</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Judul Awal (Mulai Perjalanan)" value={auth.register_title_start} onChange={(e) => handleInputChange('auth_section', 'register_title_start', e.target.value)} className="p-2 border rounded" />
                                <input placeholder="Judul Akhir (Hijau Kamu)" value={auth.register_title_end} onChange={(e) => handleInputChange('auth_section', 'register_title_end', e.target.value)} className="p-2 border rounded" />
                             </div>
                             <textarea placeholder="Deskripsi Register" value={auth.register_desc} onChange={(e) => handleInputChange('auth_section', 'register_desc', e.target.value)} className="w-full p-2 border rounded h-20" />
                             <input placeholder="Quote Register" value={auth.register_quote} onChange={(e) => handleInputChange('auth_section', 'register_quote', e.target.value)} className="w-full p-2 border rounded" />
                          </div>

                          <div className="pt-4 text-right">
                              <button onClick={() => handleSave('auth_section')} disabled={saving} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                                  {saving ? 'Menyimpan...' : 'Simpan Perubahan Auth'}
                              </button>
                          </div>
                      </div>
                  )}

                   {/* --- TAB FOOTER --- */}
                   {activeTab === 'footer' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                          <h2 className="text-2xl font-black text-slate-800 border-b pb-4">Edit Footer & Kontak</h2>
                          
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Tentang Singkat</label>
                              <textarea 
                                value={footer.about}
                                onChange={(e) => handleInputChange('footer_info', 'about', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-24"
                              />
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Email Kontak</label>
                              <input 
                                type="text" value={footer.contact}
                                onChange={(e) => handleInputChange('footer_info', 'contact', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg"
                              />
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Alamat</label>
                              <input 
                                type="text" value={footer.address}
                                onChange={(e) => handleInputChange('footer_info', 'address', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg"
                              />
                          </div>

                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Instagram / Sosmed</label>
                              <input 
                                type="text" value={footer.social_ig}
                                onChange={(e) => handleInputChange('footer_info', 'social_ig', e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg"
                              />
                          </div>

                          <div className="pt-4 text-right">
                              <button onClick={() => handleSave('footer_info')} disabled={saving} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                                  {saving ? 'Menyimpan...' : 'Simpan Footer'}
                              </button>
                          </div>
                      </div>
                  )}

              </div>
          </div>
      </main>
    </div>
  );
}