'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
// 👇 IMPORT ICONS (Agar Modern)
import { Trash2, PackageOpen, Droplets, Mail, MapPin, Instagram, ArrowRight, Lock, BarChart3, Leaf } from 'lucide-react';
// 👇 IMPORT HELPER
import { getDriveImage } from '@/app/utils/driveHelper';

// --- Interface Data ---
interface LandingData {
  auth_section?: {
    logo_emoji: string; 
  };
  hero_section: {
    title: string;
    subtitle: string;
    cta_text: string;
    hero_image: string;
  };
  tips_section: Array<{
    title: string;
    desc: string;
  }>;
  footer_info: {
    about: string;
    contact: string;
    address: string;
    social_ig: string;
  };
}

export default function LandingPage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/content/public');
        setData(response.data);
      } catch (error) {
        console.error("Gagal load konten landing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      // Background putih bersih, loading hijau
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="relative">
           <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse">🌱</div>
        </div>
      </div>
    );
  }

  // Fallback Logo
  const navbarLogo = data.auth_section?.logo_emoji || '🌱';

  return (
    // Base color hitam/hijau tua, BUKAN abu-abu
    <div className="min-h-screen font-sans text-emerald-950 bg-white selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* CUSTOM ANIMATION STYLE */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(#10b981 0.5px, transparent 0.5px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Logo Wrapper */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform overflow-hidden">
                {(navbarLogo.includes('http') || navbarLogo.includes('/')) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                        src={getDriveImage(navbarLogo)} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <span className="text-2xl">{navbarLogo}</span>
                )}
            </div>

            <span className="text-xl font-black tracking-tighter text-emerald-950 group-hover:text-emerald-600 transition-colors">
                IJO PROJECT
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-emerald-800/80">
             {['Beranda', 'Tips', 'Tentang'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="relative hover:text-emerald-600 transition-colors">
                    {item}
                </a>
             ))}
          </div>

          <div className="flex gap-3">
            <Link href="/login" className="rounded-full px-6 py-2.5 text-sm font-bold text-emerald-900 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200">
              Masuk
            </Link>
            <Link href="/register" className="rounded-full bg-emerald-950 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 hover:shadow-emerald-900/20 transition-all hover:-translate-y-0.5">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="beranda" className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-teal-100/40 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4"></div>

        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Text */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              Platform Lingkungan #1
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-emerald-950 leading-[1.1] tracking-tight">
              {data.hero_section.title.split(' ').slice(0, -1).join(' ')} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500"> {data.hero_section.title.split(' ').pop()}</span>
            </h1>
            
            {/* TEXT SUBTITLE: JANGAN ABU-ABU -> GANTI HIJAU GELAP */}
            <p className="text-xl text-emerald-800/90 font-medium leading-relaxed max-w-lg">
              {data.hero_section.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/30 transition-transform hover:scale-[1.02] active:scale-95">
                 <span>{data.hero_section.cta_text}</span>
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border-2 border-emerald-100 bg-white px-8 py-4 text-base font-bold text-emerald-900 shadow-sm hover:border-emerald-500 hover:text-emerald-700 transition-all">
                 <Lock className="w-4 h-4" /> Masuk Akun
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-4 text-sm font-medium text-emerald-800">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-emerald-200 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                    ))}
                </div>
                <p>Bergabung dengan <span className="font-bold text-emerald-950">500+ Siswa</span> lainnya.</p>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative animate-float">
             <div className="relative rounded-[3rem] p-3 bg-white/60 backdrop-blur-md border border-white/50 shadow-2xl shadow-emerald-900/5">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-inner aspect-[4/3] bg-emerald-50">
                    {/* HERO IMAGE */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={getDriveImage(data.hero_section.hero_image)} 
                      alt="Hero" 
                      className="w-full h-full object-cover transform transition-transform hover:scale-105 duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Stats Card */}
                    <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/95 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                                <Leaf className="w-6 h-6 fill-current" />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Impact Tracker</p>
                                <p className="text-xl font-black text-emerald-950">1,240 kg</p>
                             </div>
                          </div>
                          <div className="text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                                <BarChart3 className="w-3 h-3" /> 12%
                              </span>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- TIPS SECTION --- */}
      <section id="tips" className="py-24 bg-white relative">
         <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-20 max-w-2xl mx-auto">
               <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-2 block">Edukasi & Literasi</span>
               <h2 className="text-4xl lg:text-5xl font-black text-emerald-950 mb-6">Tips & Trik Hijau 💡</h2>
               <p className="text-lg text-emerald-800">Langkah kecil yang bisa kamu lakukan hari ini untuk dampak besar.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {data.tips_section.map((tip, idx) => (
                  <div key={idx} className="group relative bg-emerald-50/50 border border-emerald-100/50 rounded-[2.5rem] p-10 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
                      <div className="absolute top-10 right-10 opacity-10 text-9xl font-black group-hover:opacity-20 transition-opacity select-none text-emerald-900 group-hover:text-white">
                         {idx + 1}
                      </div>
                      <div className="relative z-10">
                          <div className="h-20 w-20 rounded-3xl bg-white text-emerald-600 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                             {/* ICONS MODERN DARI LUCIDE */}
                             {idx === 0 ? <Trash2 className="w-10 h-10" /> : 
                              idx === 1 ? <PackageOpen className="w-10 h-10" /> : 
                              <Droplets className="w-10 h-10" />}
                          </div>
                          <h3 className="text-2xl font-black mb-4 text-emerald-950 group-hover:text-white">{tip.title}</h3>
                          <p className="text-emerald-800 font-medium leading-relaxed group-hover:text-emerald-50">
                             {tip.desc}
                          </p>
                      </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-24 px-6 bg-white">
         <div className="mx-auto max-w-6xl rounded-[3.5rem] bg-emerald-950 p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-10 left-10 h-64 w-64 bg-emerald-500 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-10 right-10 h-64 w-64 bg-teal-500 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Siap Menjadi Pahlawan Lingkungan?
               </h2>
               <p className="text-emerald-100 text-xl font-medium">
                  Kumpulkan poin, tukarkan tiket, dan mainkan gamenya.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                   <Link href="/register" className="w-full sm:w-auto rounded-full bg-emerald-500 px-10 py-5 text-lg font-bold text-white shadow-lg shadow-emerald-500/40 transition-all hover:bg-emerald-400 hover:scale-105">
                      Gabung Sekarang
                   </Link>
                   <Link href="/login" className="w-full sm:w-auto rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/20">
                      Lihat Demo
                   </Link>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="tentang" className="bg-white border-t border-emerald-100 pt-20 pb-10">
         <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl overflow-hidden">
                     {(navbarLogo.includes('http') || navbarLogo.includes('/')) ? (
                           /* eslint-disable-next-line @next/next/no-img-element */
                           <img src={getDriveImage(navbarLogo)} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                           <span>{navbarLogo}</span>
                        )}
                  </div>
                  <span className="text-2xl font-black text-emerald-950 tracking-tight">IJO PROJECT</span>
               </div>
               <p className="text-emerald-800 leading-relaxed max-w-sm text-lg">
                  {data.footer_info.about}
               </p>
               <div className="flex gap-4">
                   {['twitter', 'facebook', 'instagram'].map((social) => (
                       <div key={social} className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
                           <span className="sr-only">{social}</span>
                           <div className="w-4 h-4 bg-current rounded-sm"></div>
                       </div>
                   ))}
               </div>
            </div>
            
            <div>
               <h4 className="font-bold text-emerald-950 text-lg mb-6">Hubungi Kami</h4>
               <ul className="space-y-4 text-emerald-800">
                  <li className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                      <Mail className="w-5 h-5 text-emerald-500" /> {data.footer_info.contact}
                  </li>
                  <li className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                      <MapPin className="w-5 h-5 text-emerald-500" /> {data.footer_info.address}
                  </li>
                  <li className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                      <Instagram className="w-5 h-5 text-emerald-500" /> {data.footer_info.social_ig}
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-emerald-950 text-lg mb-6">Menu</h4>
               <ul className="space-y-3 font-medium text-emerald-800">
                  <li><Link href="/login" className="hover:text-emerald-600 hover:translate-x-1 inline-block transition-transform">🔐 Login Siswa</Link></li>
                  <li><Link href="/register" className="hover:text-emerald-600 hover:translate-x-1 inline-block transition-transform">🚀 Daftar Baru</Link></li>
                  <li><Link href="/dashboard" className="hover:text-emerald-600 hover:translate-x-1 inline-block transition-transform">📊 Dashboard</Link></li>
               </ul>
            </div>
         </div>
         
         <div className="mx-auto max-w-7xl px-6 border-t border-emerald-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-emerald-700 font-medium">
               &copy; 2026 Ijo Project. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-emerald-700 font-medium">
                <a href="#" className="hover:text-emerald-500">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-500">Terms of Service</a>
            </div>
         </div>
      </footer>

    </div>
  );
}