'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import toast, { Toaster } from 'react-hot-toast';

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
      // PERBAIKAN: Menghapus ': any' di catch dan melakukan casting di sini
      const err = error as ApiError;
      const errorMessage = err.response?.data?.message || 'Gagal mendaftar. Coba lagi.';
      toast.error(errorMessage);
    }
  };

  // Tampilan Loading Awal
  if (loadingContent) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-white">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
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
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-emerald-200">
      <Toaster position="top-center" />

      {/* --- BAGIAN KIRI (Visual & Branding - Dinamis) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-emerald-900 overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Background Animation */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/20 blur-[120px]"></div>
        </div>

        <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-8 w-fit hover:opacity-80 transition-opacity cursor-pointer">
                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <span className="text-2xl">{c.logo_emoji}</span>
                </div>
                <span className="font-bold text-xl tracking-wide uppercase">{c.project_name}</span>
            </Link>
            
            <h1 className="text-5xl font-black leading-tight mb-6">
                {c.register_title_start} <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {c.register_title_end}
                </span>
            </h1>
            <p className="text-emerald-200/80 text-lg max-w-md leading-relaxed">
                {c.register_desc}
            </p>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
            <p className="italic text-emerald-100 mb-4">&quot;{c.register_quote}&quot;</p>
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500"></div>
                <div>
                    <p className="text-sm font-bold">Tim {c.project_name}</p>
                    <p className="text-xs text-emerald-300">Official Message</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN (Form Register - Powerfull) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-24 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-medium text-sm group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Beranda
        </Link>

        <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Buat Akun Baru</h2>
                <p className="text-slate-500 mt-2">Lengkapi data dirimu untuk memulai.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Nama Lengkap */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-white focus-within:border-emerald-500 focus-within:bg-emerald-50/30 ${errors.fullName ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="absolute top-3 left-4 text-xl opacity-50 group-focus-within:opacity-100 group-focus-within:text-emerald-600 transition-opacity">👤</div>
                    <input 
                        type="text" 
                        placeholder="Nama Lengkap"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        {...register('fullName', { required: 'Nama wajib diisi' })}
                    />
                </div>
                {errors.fullName && <p className="text-xs text-red-500 ml-2 font-bold">⚠️ {errors.fullName.message}</p>}

                {/* Kelas */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-white focus-within:border-emerald-500 focus-within:bg-emerald-50/30 ${errors.schoolClass ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="absolute top-3 left-4 text-xl opacity-50 group-focus-within:opacity-100 group-focus-within:text-emerald-600 transition-opacity">🎓</div>
                    <input 
                        type="text" 
                        placeholder="Kelas (Contoh: X IPA 1)"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        {...register('schoolClass', { required: 'Kelas wajib diisi' })}
                    />
                </div>
                {errors.schoolClass && <p className="text-xs text-red-500 ml-2 font-bold">⚠️ {errors.schoolClass.message}</p>}

                {/* Email */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-white focus-within:border-emerald-500 focus-within:bg-emerald-50/30 ${errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="absolute top-3 left-4 text-xl opacity-50 group-focus-within:opacity-100 group-focus-within:text-emerald-600 transition-opacity">📧</div>
                    <input 
                        type="email" 
                        placeholder="Email Sekolah"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        {...register('email', { required: 'Email wajib diisi' })}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-2 font-bold">⚠️ {errors.email.message}</p>}

                {/* Password */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-white focus-within:border-emerald-500 focus-within:bg-emerald-50/30 ${errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="absolute top-3 left-4 text-xl opacity-50 group-focus-within:opacity-100 group-focus-within:text-emerald-600 transition-opacity">🔒</div>
                    <input 
                        type="password" 
                        placeholder="Password (Min. 8 Karakter)"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        {...register('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } })}
                    />
                </div>
                {errors.password && <p className="text-xs text-red-500 ml-2 font-bold">⚠️ {errors.password.message}</p>}

                {/* Submit Button */}
                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                           <span>Memproses Data...</span>
                        </div>
                    ) : "Daftar Sekarang →"}
                </button>
            </form>

            <div className="text-center">
                <p className="text-slate-500 text-sm">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline decoration-2 decoration-transparent hover:decoration-emerald-600 transition-all">
                        Login disini
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}