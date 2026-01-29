'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import Link from 'next/link';
// 👇 IMPORT ICONS (Lucide React)
import { Mail, Lock, ArrowLeft, Loader2, LogIn } from 'lucide-react';
// 👇 IMPORT HELPER
import { getDriveImage } from '@/app/utils/driveHelper';

interface LoginFormInputs {
  email: string;
  password: string;
}

interface AuthContent {
  logo_emoji: string;
  project_name: string;
  login_title_start: string;
  login_title_end: string;
  login_desc: string;
  feature_card_title: string;
  feature_card_desc: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [content, setContent] = useState<AuthContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content/public');
        if (response.data && response.data.auth_section) {
            setContent(response.data.auth_section);
        }
      } catch (error) {
        console.error("Gagal ambil konten login:", error);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchContent();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, role } = response.data; 
      
      Cookies.set('token', accessToken, { expires: 1 });
      toast.success(`Login Berhasil! Halo ${role === 'admin' ? 'Admin' : 'Siswa'} 👋`, { icon: '🔓' });
      
      setTimeout(() => {
        if (role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
      }, 1500);

    } catch (error) {
      const err = error as ApiError;
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Email atau password salah.';
      
      if (status === 403) {
          toast.error(msg, { icon: '⏳', duration: 5000 });
      } else {
          toast.error(msg);
      }
    }
  };

  if (loadingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
         <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
      </div>
    );
  }

  const c = content || {
      logo_emoji: '🌱',
      project_name: 'IJO PROJECT',
      login_title_start: 'Selamat Datang',
      login_title_end: 'Kembali',
      login_desc: 'Silakan login untuk melanjutkan perjalanan hijau Anda.',
      feature_card_title: 'Klasemen',
      feature_card_desc: 'Cek posisimu sekarang.'
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-emerald-950 selection:bg-emerald-200 selection:text-emerald-900">
      <Toaster position="top-center" />

      {/* --- BAGIAN KIRI (Visual Branding / Banner) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-950 overflow-hidden flex-col justify-between p-12 text-white">
         {/* Background Orbs */}
         <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] rounded-full bg-emerald-600/30 blur-[150px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full bg-teal-600/30 blur-[150px]"></div>
        </div>

        <div className="relative z-10">
            <Link href="/" className="flex items-center gap-4 mb-12 w-fit hover:opacity-80 transition-opacity cursor-pointer group">
                <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    {(c.logo_emoji && (c.logo_emoji.includes('http') || c.logo_emoji.includes('/'))) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                            src={getDriveImage(c.logo_emoji)} 
                            alt="Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <span className="text-3xl">{c.logo_emoji}</span>
                    )}
                </div>
                <span className="font-bold text-xl tracking-wider uppercase opacity-90">{c.project_name}</span>
            </Link>
            
            <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-black leading-none tracking-tight">
                    {c.login_title_start} <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                        {c.login_title_end}
                    </span>
                </h1>
                <p className="text-emerald-100 text-lg max-w-md leading-relaxed font-medium opacity-80">
                    {c.login_desc}
                </p>
            </div>
        </div>

        {/* Feature Card Kecil di Kiri Bawah */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl shadow-emerald-900/50 hover:bg-white/10 transition-colors cursor-default">
            <div className="flex items-center gap-5">
                 <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                    🏆
                 </div>
                 <div>
                    <p className="font-bold text-white text-lg">{c.feature_card_title}</p>
                    <p className="text-sm text-emerald-200/80 font-medium">{c.feature_card_desc}</p>
                 </div>
            </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN (Form Login) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-24 relative bg-white">
         <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-emerald-800/60 hover:text-emerald-600 transition-colors font-bold text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Beranda
         </Link>

         <div className="w-full max-w-md space-y-10 mt-10 lg:mt-0">
             <div className="text-center lg:text-left space-y-2">
                <h2 className="text-4xl font-black text-emerald-950 tracking-tight">Masuk Akun</h2>
                <p className="text-emerald-800/70 font-medium text-lg">Masukkan email sekolahmu untuk mulai belajar.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Input Email */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-emerald-50/30 ${errors.email ? 'border-red-200 bg-red-50' : 'border-emerald-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-emerald-500/10'}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-emerald-800/40 group-focus-within:text-emerald-600 transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input 
                        type="email" 
                        placeholder="Email Sekolah (contoh@sekolah.sch.id)"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-emerald-950 font-semibold placeholder:text-emerald-800/30"
                        {...register('email', { required: 'Email wajib diisi' })}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-2 font-bold flex items-center gap-1 mt-1">⚠️ {errors.email.message}</p>}

                {/* Input Password */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-emerald-50/30 ${errors.password ? 'border-red-200 bg-red-50' : 'border-emerald-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-emerald-500/10'}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-emerald-800/40 group-focus-within:text-emerald-600 transition-colors">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input 
                        type="password" 
                        placeholder="Kata Sandi Rahasia"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-emerald-950 font-semibold placeholder:text-emerald-800/30"
                        {...register('password', { required: 'Password wajib diisi' })}
                    />
                </div>
                {errors.password && <p className="text-xs text-red-500 ml-2 font-bold flex items-center gap-1 mt-1">⚠️ {errors.password.message}</p>}

                {/* Tombol Login */}
                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-lg text-white shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/50 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           <span>Memverifikasi...</span>
                        </>
                    ) : (
                        <>
                           <LogIn className="w-5 h-5" />
                           <span>Masuk Dashboard</span>
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-4">
                <p className="text-emerald-800/60 font-medium">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-extrabold text-emerald-600 hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all">
                        Daftar Gratis Sekarang
                    </Link>
                </p>
            </div>
         </div>
      </div>
    </div>
  );
}