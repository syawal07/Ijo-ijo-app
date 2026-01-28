'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

// --- Interface Data ---
interface LandingData {
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">🌱</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 selection:bg-emerald-300 selection:text-emerald-900 bg-slate-50">
      
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

      {/* --- NAVBAR (Glassmorphism) --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <span className="text-xl">🌱</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-800 group-hover:text-emerald-600 transition-colors">
                IJO PROJECT
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
             {['Beranda', 'Tips', 'Tentang'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="relative hover:text-emerald-600 transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all hover:after:w-full">
                    {item}
                </a>
             ))}
          </div>

          <div className="flex gap-3">
            <Link href="/login" className="rounded-full px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="beranda" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-[800px] w-[800px] rounded-full bg-emerald-400/20 blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-[600px] w-[600px] rounded-full bg-teal-400/20 blur-[100px] -z-10"></div>

        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Text */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Platform Lingkungan #1
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              {data.hero_section.title.split(' ').slice(0, -1).join(' ')} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500"> {data.hero_section.title.split(' ').pop()}</span>
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              {data.hero_section.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/30 transition-transform hover:scale-[1.02] active:scale-95">
                 <span>{data.hero_section.cta_text}</span>
                 <span className="group-hover:translate-x-1 transition-transform">→</span>
                 <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                 <span className="text-xl">🔐</span> Masuk Akun
              </Link>
            </div>

            {/* Social Proof Mini */}
            <div className="pt-8 flex items-center gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                    ))}
                </div>
                <p>Bergabung dengan <span className="font-bold text-slate-900">500+ Siswa</span> lainnya.</p>
            </div>
          </div>
          
          {/* Hero Image (Floating Animation) */}
          <div className="relative animate-float">
             {/* Decorative Blobs */}
             <div className="absolute -top-10 -right-10 h-32 w-32 bg-yellow-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
             <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-purple-400 rounded-full blur-2xl opacity-40 animate-pulse delay-700"></div>

             <div className="relative rounded-[3rem] p-3 bg-white/50 backdrop-blur-sm border border-white/50 shadow-2xl">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-inner">
                    <img 
                      src={data.hero_section.hero_image} 
                      alt="Hero" 
                      className="w-full h-auto object-cover transform transition-transform hover:scale-105 duration-700"
                    />
                    
                    {/* Floating Stats Card */}
                    <div className="absolute bottom-8 left-8 right-8 rounded-3xl bg-white/95 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-2xl shadow-inner">♻️</div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impact Tracker</p>
                                <p className="text-xl font-black text-slate-800">1,240 kg</p>
                             </div>
                          </div>
                          <div className="text-right">
                              <span className="inline-block px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">▲ 12%</span>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- TIPS SECTION (Bento Grid Style) --- */}
      <section id="tips" className="py-24 bg-white relative">
         <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-20 max-w-2xl mx-auto">
               <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-2 block">Edukasi</span>
               <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Tips & Trik Hijau 💡</h2>
               <p className="text-lg text-slate-500">Langkah kecil yang bisa kamu lakukan hari ini untuk dampak besar di masa depan.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {data.tips_section.map((tip, idx) => (
                  <div key={idx} className="group relative bg-slate-50 rounded-[2.5rem] p-10 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20">
                     <div className="absolute top-10 right-10 opacity-10 text-9xl font-black group-hover:opacity-20 transition-opacity select-none">
                        {idx + 1}
                     </div>
                     <div className="relative z-10">
                         <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center text-4xl mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            {idx === 0 ? '🥤' : idx === 1 ? '📦' : '🛢️'}
                         </div>
                         <h3 className="text-2xl font-black mb-4 group-hover:text-white">{tip.title}</h3>
                         <p className="text-slate-500 font-medium leading-relaxed group-hover:text-emerald-100">
                            {tip.desc}
                         </p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-24 px-6 bg-slate-50">
         <div className="mx-auto max-w-6xl rounded-[3.5rem] bg-slate-900 p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-900/30">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-10 left-10 h-64 w-64 bg-emerald-500 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-10 right-10 h-64 w-64 bg-purple-500 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Siap Menjadi Pahlawan Lingkungan?
               </h2>
               <p className="text-slate-300 text-xl font-medium">
                  Kumpulkan poin, tukarkan tiket, dan mainkan gamenya. Kompetisi dimulai dari sekarang!
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                   <Link href="/register" className="w-full sm:w-auto rounded-full bg-emerald-500 px-10 py-5 text-lg font-bold text-white shadow-lg shadow-emerald-500/40 transition-all hover:bg-emerald-400 hover:scale-105">
                      Gabung Sekarang Gratis
                   </Link>
                   <Link href="/login" className="w-full sm:w-auto rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/20">
                      Lihat Demo
                   </Link>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="tentang" className="bg-white border-t border-slate-100 pt-20 pb-10">
         <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">🌱</div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">IJO PROJECT</span>
               </div>
               <p className="text-slate-500 leading-relaxed max-w-sm text-lg">
                  {data.footer_info.about}
               </p>
               <div className="flex gap-4">
                   {['twitter', 'facebook', 'instagram'].map((social) => (
                       <div key={social} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
                           <span className="sr-only">{social}</span>
                           <div className="w-4 h-4 bg-current rounded-sm"></div>
                       </div>
                   ))}
               </div>
            </div>
            
            <div>
               <h4 className="font-bold text-slate-900 text-lg mb-6">Hubungi Kami</h4>
               <ul className="space-y-4 text-slate-500">
                  <li className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                      <span className="bg-emerald-50 p-2 rounded-lg">📧</span> {data.footer_info.contact}
                  </li>
                  <li className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                      <span className="bg-emerald-50 p-2 rounded-lg">📍</span> {data.footer_info.address}
                  </li>
                  <li className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                      <span className="bg-emerald-50 p-2 rounded-lg">📸</span> {data.footer_info.social_ig}
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-slate-900 text-lg mb-6">Menu</h4>
               <ul className="space-y-3 font-medium text-slate-500">
                  <li><Link href="/login" className="hover:text-emerald-600 hover:translate-x-1 inline-block transition-transform">🔐 Login Siswa</Link></li>
                  <li><Link href="/register" className="hover:text-emerald-600 hover:translate-x-1 inline-block transition-transform">🚀 Daftar Baru</Link></li>
                  <li><Link href="/dashboard" className="hover:text-emerald-600 hover:translate-x-1 inline-block transition-transform">📊 Dashboard</Link></li>
               </ul>
            </div>
         </div>
         
         <div className="mx-auto max-w-7xl px-6 border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400 font-medium">
               &copy; 2026 Ijo Project. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400 font-medium">
                <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-600">Terms of Service</a>
            </div>
         </div>
      </footer>

    </div>
  );
}