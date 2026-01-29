'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { getDriveImage } from '@/app/utils/driveHelper';
import { 
  Layout, 
  LogIn, 
  PanelBottom, 
  Save, 
  ArrowLeft, 
  LogOut, 
  Loader2,
  Image as ImageIcon,
  Settings // 👈 SUDAH DITAMBAHKAN
} from 'lucide-react';

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
        if (response.data) {
             setContent((prev) => ({
                ...prev,
                hero_section: { ...prev.hero_section, ...response.data.hero_section },
                auth_section: { ...prev.auth_section, ...response.data.auth_section },
                footer_info: { ...prev.footer_info, ...response.data.footer_info },
             }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Gagal mengambil data konten.');
      } finally {
        setLoading(false);
      }
    };

    const token = Cookies.get('token');
    if (!token) {
        router.push('/login');
    } else {
        fetchData();
    }
  }, [router]);

  const handleInputChange = (section: string, field: string, value: string) => {
    setContent((prev: ContentData) => {
      const currentSection = prev[section];
      const updatedSection = {
        ...(currentSection as unknown as Record<string, string>),
        [field]: value
      };

      return {
        ...prev,
        [section]: updatedSection
      } as ContentData;
    });
  };

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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium">Memuat CMS...</p>
    </div>
  );

  const hero = content.hero_section as HeroSection;
  const auth = content.auth_section as AuthSection;
  const footer = content.footer_info as FooterInfo;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 flex flex-col">
      <Toaster position="top-right" />
      
      {/* NAVBAR ADMIN (Compact) */}
      <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                  <h1 className="font-bold text-base leading-none">CMS Content</h1>
                  <p className="text-[10px] text-slate-400 mt-0.5">Website Content Manager</p>
              </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              {/* Perbaikan w-[1px] jadi w-px */}
              <div className="h-4 w-px bg-slate-700"></div>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors">
                  <LogOut className="w-4 h-4" /> Keluar
              </button>
          </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
          
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-120px)]">
              
              {/* SIDEBAR TABS */}
              <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-2 shrink-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Navigasi Halaman</p>
                  
                  <button 
                    onClick={() => setActiveTab('hero')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'hero' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <Layout className="w-4 h-4" />
                      Hero (Beranda)
                  </button>
                  <button 
                    onClick={() => setActiveTab('auth')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'auth' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <LogIn className="w-4 h-4" />
                      Login & Register
                  </button>
                  <button 
                    onClick={() => setActiveTab('footer')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'footer' ? 'bg-white shadow-md text-emerald-600 border border-slate-100' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'}`}
                  >
                      <PanelBottom className="w-4 h-4" />
                      Footer & Info
                  </button>
              </div>

              {/* CONTENT AREA (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                  <div className="p-8 max-w-3xl mx-auto">
                  
                  {/* --- TAB HERO --- */}
                  {activeTab === 'hero' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4">
                              <h2 className="text-2xl font-black text-slate-800">Edit Halaman Depan</h2>
                              <p className="text-slate-500 text-sm">Sesuaikan teks dan gambar utama website.</p>
                          </div>
                          
                          <div className="space-y-6">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Judul Besar (Headline)</label>
                                  <input 
                                    type="text" 
                                    value={hero.title}
                                    onChange={(e) => handleInputChange('hero_section', 'title', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-lg transition-all"
                                  />
                              </div>

                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Sub-Judul (Deskripsi)</label>
                                  <textarea 
                                    value={hero.subtitle}
                                    onChange={(e) => handleInputChange('hero_section', 'subtitle', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none h-28 resize-none transition-all"
                                  />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Teks Tombol CTA</label>
                                      <input 
                                        type="text" 
                                        value={hero.cta_text}
                                        onChange={(e) => handleInputChange('hero_section', 'cta_text', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                      />
                                  </div>
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Link Gambar Hero</label>
                                      <div className="relative">
                                          <input 
                                            type="text" 
                                            value={hero.hero_image}
                                            onChange={(e) => handleInputChange('hero_section', 'hero_image', e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                            className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all truncate"
                                          />
                                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                      </div>
                                  </div>
                              </div>

                              {/* PREVIEW HERO IMAGE */}
                              {hero.hero_image && (
                                <div className="p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center relative group">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Preview Gambar</p>
                                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-slate-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={getDriveImage(hero.hero_image)}
                                            alt="Preview Hero"
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                              )}
                          </div>

                          <div className="pt-6 border-t flex justify-end">
                              <button 
                                onClick={() => handleSave('hero_section')} 
                                disabled={saving} 
                                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                          </div>
                      </div>
                  )}

                  {/* --- TAB AUTH --- */}
                  {activeTab === 'auth' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4">
                              <h2 className="text-2xl font-black text-slate-800">Edit Login & Register</h2>
                              <p className="text-slate-500 text-sm">Pengaturan tampilan halaman masuk dan daftar.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nama Project</label>
                                  <input 
                                    type="text" value={auth.project_name}
                                    onChange={(e) => handleInputChange('auth_section', 'project_name', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                  />
                              </div>
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Logo (Link Drive / Emoji)</label>
                                  <div className="flex gap-3">
                                      <input 
                                        type="text" value={auth.logo_emoji}
                                        onChange={(e) => handleInputChange('auth_section', 'logo_emoji', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                        placeholder="Paste Link / Emoji"
                                      />
                                      <div className="w-12 h-12 shrink-0 border rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                        {(auth.logo_emoji && (auth.logo_emoji.includes('http') || auth.logo_emoji.includes('/'))) ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={getDriveImage(auth.logo_emoji)} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <span className="text-2xl">{auth.logo_emoji || '🌱'}</span>
                                        )}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-slate-50 p-6 rounded-2xl space-y-5 border border-slate-200/60">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Halaman Login
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Awal</label>
                                    <input value={auth.login_title_start} onChange={(e) => handleInputChange('auth_section', 'login_title_start', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Akhir (Warna)</label>
                                    <input value={auth.login_title_end} onChange={(e) => handleInputChange('auth_section', 'login_title_end', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-emerald-600 font-bold" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi</label>
                                <textarea value={auth.login_desc} onChange={(e) => handleInputChange('auth_section', 'login_desc', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-16 resize-none text-sm" />
                             </div>
                          </div>

                          <div className="bg-slate-50 p-6 rounded-2xl space-y-5 border border-slate-200/60">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Halaman Register
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Awal</label>
                                    <input value={auth.register_title_start} onChange={(e) => handleInputChange('auth_section', 'register_title_start', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Judul Akhir (Warna)</label>
                                    <input value={auth.register_title_end} onChange={(e) => handleInputChange('auth_section', 'register_title_end', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-blue-600 font-bold" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi</label>
                                <textarea value={auth.register_desc} onChange={(e) => handleInputChange('auth_section', 'register_desc', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none h-16 resize-none text-sm" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Quote Motivasi</label>
                                <input value={auth.register_quote} onChange={(e) => handleInputChange('auth_section', 'register_quote', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none text-sm italic text-slate-600" />
                             </div>
                          </div>

                          <div className="pt-6 border-t flex justify-end">
                              <button 
                                onClick={() => handleSave('auth_section')} 
                                disabled={saving} 
                                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                          </div>
                      </div>
                  )}

                  {/* --- TAB FOOTER --- */}
                  {activeTab === 'footer' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="border-b pb-4">
                              <h2 className="text-2xl font-black text-slate-800">Edit Footer & Kontak</h2>
                              <p className="text-slate-500 text-sm">Informasi kontak dan media sosial di bagian bawah website.</p>
                          </div>
                          
                          <div className="space-y-5">
                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Tentang Singkat</label>
                                  <textarea 
                                    value={footer.about}
                                    onChange={(e) => handleInputChange('footer_info', 'about', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none h-28 resize-none transition-all"
                                  />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Email Kontak</label>
                                      <input 
                                        type="text" value={footer.contact}
                                        onChange={(e) => handleInputChange('footer_info', 'contact', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                      />
                                  </div>
                                  <div className="group">
                                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Instagram / Sosmed</label>
                                      <input 
                                        type="text" value={footer.social_ig}
                                        onChange={(e) => handleInputChange('footer_info', 'social_ig', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                                      />
                                  </div>
                              </div>

                              <div className="group">
                                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block group-focus-within:text-emerald-600 transition-colors">Alamat Lengkap</label>
                                  <textarea 
                                    value={footer.address}
                                    onChange={(e) => handleInputChange('footer_info', 'address', e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none h-20 resize-none transition-all"
                                  />
                              </div>
                          </div>

                          <div className="pt-6 border-t flex justify-end">
                              <button 
                                onClick={() => handleSave('footer_info')} 
                                disabled={saving} 
                                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                          </div>
                      </div>
                  )}

                  </div>
              </div>
          </div>
      </main>
    </div>
  );
}