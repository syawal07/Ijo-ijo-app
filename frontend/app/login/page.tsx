'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import Link from 'next/link';

// Interface tipe data input
interface LoginFormInputs {
  email: string;
  password: string;
}

// Interface Data Dinamis
interface AuthContent {
  logo_emoji: string;
  project_name: string;
  login_title_start: string;
  login_title_end: string;
  login_desc: string;
  feature_card_title: string;
  feature_card_desc: string;
}

// Interface Error API
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
        console.error("Gagal ambil konten login:", error);
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
  } = useForm<LoginFormInputs>();

  // MARKER: LOGIKA LOGIN UPDATE (CEK ROLE & STATUS)
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      
      // Ambil Token & Role dari Backend
      const { accessToken, role } = response.data; 
      
      Cookies.set('token', accessToken, { expires: 1 });
      toast.success(`Login Berhasil! Halo ${role === 'admin' ? 'Admin' : 'Siswa'} 👋`, { icon: '🔓' });
      
      // MARKER: REDIRECT SESUAI ROLE
      setTimeout(() => {
        if (role === 'admin') {
            router.push('/admin/dashboard'); // Halaman Khusus Admin
        } else {
            router.push('/dashboard'); // Halaman Khusus Siswa
        }
      }, 1500);

    } catch (error) {
      const err = error as ApiError;
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Email atau password salah.';
      
      // MARKER: PENANGANAN AKUN PENDING/DITOLAK
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
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const c = content || {
      logo_emoji: '🌱',
      project_name: 'IJO PROJECT',
      login_title_start: 'Selamat Datang',
      login_title_end: 'Kembali',
      login_desc: 'Silakan login untuk melanjutkan.',
      feature_card_title: 'Klasemen',
      feature_card_desc: 'Cek posisimu sekarang.'
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-emerald-200">
      <Toaster position="top-center" />

      {/* --- BAGIAN KIRI (Visual Branding) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white">
         <div className="absolute top-0 left-0 w-full h-full z-0">
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-600/20 blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]"></div>
        </div>

        <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-8 w-fit hover:opacity-80 transition-opacity cursor-pointer">
                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <span className="text-2xl">{c.logo_emoji}</span>
                </div>
                <span className="font-bold text-xl tracking-wide uppercase">{c.project_name}</span>
            </Link>
            
            <h1 className="text-5xl font-black leading-tight mb-6">
                {c.login_title_start} <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {c.login_title_end}
                </span>
            </h1>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
                {c.login_desc}
            </p>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
                 <div className="text-4xl">🏆</div>
                 <div>
                    <p className="font-bold text-white">{c.feature_card_title}</p>
                    <p className="text-xs text-slate-300">{c.feature_card_desc}</p>
                 </div>
            </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN (Form Login) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-24 relative">
         <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-medium text-sm group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Beranda
         </Link>

         <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
             <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Masuk Akun</h2>
                <p className="text-slate-500 mt-2">Masukkan email sekolahmu untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Email Input */}
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

                {/* Password Input */}
                <div className={`group relative transition-all duration-300 rounded-2xl border-2 bg-white focus-within:border-emerald-500 focus-within:bg-emerald-50/30 ${errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="absolute top-3 left-4 text-xl opacity-50 group-focus-within:opacity-100 group-focus-within:text-emerald-600 transition-opacity">🔒</div>
                    <input 
                        type="password" 
                        placeholder="Password"
                        className="w-full bg-transparent pl-12 pr-4 py-4 outline-none text-slate-800 font-medium placeholder:text-slate-400"
                        {...register('password', { required: 'Password wajib diisi' })}
                    />
                </div>
                {errors.password && <p className="text-xs text-red-500 ml-2 font-bold">⚠️ {errors.password.message}</p>}

                {/* Submit Button */}
                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/50 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                           <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                           <span>Memverifikasi...</span>
                        </div>
                    ) : "Masuk Dashboard →"}
                </button>
            </form>

            <div className="text-center">
                <p className="text-slate-500 text-sm">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700 underline decoration-2 decoration-transparent hover:decoration-emerald-600 transition-all">
                        Daftar sekarang
                    </Link>
                </p>
            </div>
         </div>
      </div>
    </div>
  );
}