'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';
import { User, GraduationCap, Mail, Lock, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { getDriveImage } from '@/app/utils/driveHelper';

// 1. Interface Data Form
interface RegisterFormInputs {
  fullName: string;
  schoolClass: string;
  email: string;
  password: string;
}

// 2. Interface Data CMS (Backend)
interface AuthContent {
  logo_emoji: string;
  project_name: string;
  register_title_start: string;
  register_title_end: string;
  register_desc: string;
  register_quote: string;
}

// 3. Interface Error API
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function RegisterPage() {
  const router = useRouter();
  
  // State Konten Dinamis
  const [content, setContent] = useState<AuthContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  // Fetch Data CMS
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content/public');
        if (response.data && response.data.auth_section) {
            setContent(response.data.auth_section);
        }
      } catch (error) {
        console.error("Gagal load konten register:", error);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchContent();
  }, []);

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>();

  // Fungsi Submit
  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await api.post('/auth/register', data);
      toast.success('Akun berhasil dibuat! Mengalihkan...', { icon: '🚀' });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      const err = error as ApiError;
      const errorMessage = err.response?.data?.message || 'Gagal mendaftar. Coba lagi.';
      toast.error(errorMessage);
    }
  };

  // Tampilan Loading Awal
  if (loadingContent) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-white">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"></div>
        </div>
     );
  }

  // Fallback Data
  const c = content || {
      logo_emoji: '🌱',
      project_name: 'IJO PROJECT',
      register_title_start: 'Mulai Perjalanan',
      register_title_end: 'Hijau Kamu',
      register_desc: 'Bergabung dengan komunitas siswa peduli lingkungan.',
      register_quote: 'Langkah kecil untuk memilah sampah hari ini, adalah lompatan besar untuk bumi di masa depan.'
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-emerald-950 selection:bg-emerald-200 selection:text-emerald-900">
      <Toaster position="top-center" />

      {/* --- BAGIAN KIRI (Visual & Branding) - Identik dengan Login --- */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-950 overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Background Animation */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/20 blur-[120px]"></div>
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
            
            <h1 className="text-5xl lg:text-6xl font-black leading-none tracking-tight mb-6">
                {c.register_title_start} <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {c.register_title_end}
                </span>
            </h1>
            <p className="text-emerald-100/80 text-lg max-w-md leading-relaxed font-medium">
                {c.register_desc}
            </p>
        </div>

        {/* Quote Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-emerald-900/50">
            <p className="italic text-emerald-50 mb-6 text-lg font-light leading-relaxed">&quot;{c.register_quote}&quot;</p>
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-lg border-2 border-white/20"></div>
                <div>
                    <p className="text-sm font-bold text-white">Tim {c.project_name}</p>
                    <p className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Official Message</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN (Form Register) --- */}
      {/* Ubah p-12 menjadi p-24 agar lebih lega dan mirip Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-24 relative bg-white">
        
        {/* Tombol Kembali - Tetap Absolute tapi container form akan kita beri jarak */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-emerald-800/60 hover:text-emerald-600 transition-colors font-bold text-sm group z-20">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Beranda
        </Link>

        {/* Container Form - Menambahkan mt-12 agar judul tidak menabrak tombol kembali saat layar pendek */}
        <div className="w-full max-w-md space-y-8 mt-20 lg:mt-0">
            <div className="text-center lg:text-left space-y-2">
                <h2 className="text-4xl font-black text-emerald-950 tracking-tight">Buat Akun Baru</h2>
                <p className="text-emerald-800/70 font-medium text-lg">Lengkapi data dirimu untuk memulai.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Nama Lengkap */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-emerald-50/30 ${errors.fullName ? 'border-red-200 bg-red-50' : 'border-emerald-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-emerald-500/10'}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-emerald-800/40 group-focus-within:text-emerald-600 transition-colors">
                        <User className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Nama Lengkap"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-emerald-950 font-semibold placeholder:text-emerald-800/30"
                        {...register('fullName', { required: 'Nama wajib diisi' })}
                    />
                </div>
                {errors.fullName && <p className="text-xs text-red-500 ml-2 font-bold flex items-center gap-1 mt-1">⚠️ {errors.fullName.message}</p>}

                {/* Kelas */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-emerald-50/30 ${errors.schoolClass ? 'border-red-200 bg-red-50' : 'border-emerald-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-emerald-500/10'}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-emerald-800/40 group-focus-within:text-emerald-600 transition-colors">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Kelas (Contoh: X IPA 1)"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-emerald-950 font-semibold placeholder:text-emerald-800/30"
                        {...register('schoolClass', { required: 'Kelas wajib diisi' })}
                    />
                </div>
                {errors.schoolClass && <p className="text-xs text-red-500 ml-2 font-bold flex items-center gap-1 mt-1">⚠️ {errors.schoolClass.message}</p>}

                {/* Email */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-emerald-50/30 ${errors.email ? 'border-red-200 bg-red-50' : 'border-emerald-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-emerald-500/10'}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-emerald-800/40 group-focus-within:text-emerald-600 transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input 
                        type="email" 
                        placeholder="Email Sekolah"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-emerald-950 font-semibold placeholder:text-emerald-800/30"
                        {...register('email', { required: 'Email wajib diisi' })}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-2 font-bold flex items-center gap-1 mt-1">⚠️ {errors.email.message}</p>}

                {/* Password */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-emerald-50/30 ${errors.password ? 'border-red-200 bg-red-50' : 'border-emerald-100 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-emerald-500/10'}`}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-emerald-800/40 group-focus-within:text-emerald-600 transition-colors">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input 
                        type="password" 
                        placeholder="Password (Min. 8 Karakter)"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-emerald-950 font-semibold placeholder:text-emerald-800/30"
                        {...register('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } })}
                    />
                </div>
                {errors.password && <p className="text-xs text-red-500 ml-2 font-bold flex items-center gap-1 mt-1">⚠️ {errors.password.message}</p>}

                {/* Submit Button */}
                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-lg text-white shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/50 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" />
                           <span>Memproses Data...</span>
                        </>
                    ) : (
                        <>
                           <UserPlus className="w-5 h-5" />
                           <span>Daftar Sekarang</span>
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-4">
                <p className="text-emerald-800/60 font-medium">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-extrabold text-emerald-600 hover:text-emerald-500 hover:underline decoration-2 underline-offset-4 transition-all">
                        Login disini
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}