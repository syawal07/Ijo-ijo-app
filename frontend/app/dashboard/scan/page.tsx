'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';
import * as tmImage from '@teachablemachine/image';
import { ArrowLeft, Loader2, Zap, Scan, Aperture, RefreshCw, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- KONFIGURASI AI ---
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/mF1G2Xwy_2/';
const CONFIDENCE_THRESHOLD = 0.85; // Ambang batas untuk Auto-Scan
const STABILITY_FRAMES = 30; 
const UI_UPDATE_DELAY = 100; // UI lebih responsif

export default function ScanPage() {
  const router = useRouter();

  // STATE UI
  const [predictions, setPredictions] = useState<{ className: string; probability: number }[]>([]);
  const [bestGuess, setBestGuess] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // REFS
  const webcamRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const webcamInstanceRef = useRef<tmImage.Webcam | null>(null);
  const requestRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  
  // REFS LOGIC
  const stabilityCounterRef = useRef<number>(0);
  const currentClassRef = useRef<string | null>(null);
  const lastUiUpdateRef = useRef<number>(0);
  const isSendingRef = useRef<boolean>(false);

  // --- FUNGSI API (LOGIC TETAP SAMA) ---
  const handleLapor = useCallback(async (detectedClass: string, isManual = false) => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    setIsProcessing(true);

    try {
      let categoryBackend = detectedClass;
      const lower = detectedClass.toLowerCase();

      // Mapping Kategori
      if (lower.includes('plastik') || lower.includes('plastic')) categoryBackend = 'Plastik';
      else if (lower.includes('kertas') || lower.includes('paper')) categoryBackend = 'Kertas';
      else if (lower.includes('kaleng') || lower.includes('logam')) categoryBackend = 'Logam';
      else if (lower.includes('organik')) categoryBackend = 'Organik';

      const response = await api.post('/garbage/scan', { category: categoryBackend });
      const data = response.data;

      toast.success(
        <div className="flex flex-col">
          <span className="font-bold text-sm">{isManual ? 'Manual Scan Sukses!' : 'Objek Teridentifikasi!'}</span>
          <span className="text-xs">Reward: +{data.reward} Koin</span>
        </div>,
        { duration: 4000, icon: '🤖', style: { borderRadius: '12px', background: '#064e3b', color: '#fff' } }
      );

      if (data.tickets > 0 && data.newCoinBalance === 0) {
        setTimeout(() => toast('🎉 Selamat! Koin ditukar jadi Tiket!', { icon: '🎟️' }), 1000);
      }

      router.refresh();
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error) {
      console.error("Gagal Lapor:", error);
      toast.error('Gagal terhubung ke server.');
      isSendingRef.current = false;
      setIsProcessing(false);
      stabilityCounterRef.current = 0;
      setScanProgress(0);
    }
  }, [router]);

  // --- INIT & LOOP (LOGIC TETAP SAMA) ---
  useEffect(() => {
    isMountedRef.current = true;

    const loop = async () => {
        if (!isMountedRef.current) return;

        if (webcamInstanceRef.current) {
            webcamInstanceRef.current.update();
            
            if (modelRef.current && !isSendingRef.current) {
                const prediction = await modelRef.current.predict(webcamInstanceRef.current.canvas);
                const sorted = prediction.sort((a, b) => b.probability - a.probability);
                const topResult = sorted[0];
                const now = Date.now();

                // Stabilizer Logic (Auto Scan)
                if (topResult.probability > CONFIDENCE_THRESHOLD) {
                    if (topResult.className === currentClassRef.current) {
                        stabilityCounterRef.current += 1;
                    } else {
                        currentClassRef.current = topResult.className;
                        stabilityCounterRef.current = 0;
                    }
                } else {
                    stabilityCounterRef.current = Math.max(0, stabilityCounterRef.current - 1);
                }

                // Trigger Auto Send
                if (stabilityCounterRef.current >= STABILITY_FRAMES && !isSendingRef.current) {
                    handleLapor(currentClassRef.current!);
                }

                // Update UI
                if (now - lastUiUpdateRef.current > UI_UPDATE_DELAY) {
                    setPredictions(sorted.slice(0, 3));
                    setBestGuess(topResult.probability > 0.45 ? topResult.className : null);
                    
                    const progress = Math.min(100, (stabilityCounterRef.current / STABILITY_FRAMES) * 100);
                    setScanProgress(progress);
                    lastUiUpdateRef.current = now;
                }
            }
            requestRef.current = window.requestAnimationFrame(loop);
        }
    };

    const initAI = async () => {
      try {
        const modelURL = MODEL_URL + 'model.json';
        const metadataURL = MODEL_URL + 'metadata.json';
        
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        modelRef.current = loadedModel;

        const webcam = new tmImage.Webcam(400, 400, true); // Resolusi sedikit dinaikkan
        await webcam.setup();
        
        if (!isMountedRef.current) return; 

        const videoEl = webcam.canvas;
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('muted', 'true');
        
        await webcam.play();
        webcamInstanceRef.current = webcam;

        if (webcamRef.current) {
            webcamRef.current.innerHTML = ''; 
            webcam.canvas.className = "absolute inset-0 w-full h-full object-cover filter contrast-110"; // Tambah kontras dikit
            webcamRef.current.appendChild(webcam.canvas);
        }

        setIsCameraReady(true);
        requestRef.current = window.requestAnimationFrame(loop);

      } catch (error) {
        console.error("AI Init Error:", error);
        if (isMountedRef.current) {
            setErrorMessage("Kamera tidak dapat diakses.");
        }
      }
    };

    initAI();

    return () => {
      isMountedRef.current = false;
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      if (webcamInstanceRef.current) {
        try { webcamInstanceRef.current.stop(); } catch(e) {}
      }
    };
  }, [handleLapor]);

  return (
    <main className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col font-sans select-none">
      <Toaster position="top-center" />

      {/* --- HEADER (HUD Style) --- */}
      <header className="absolute top-0 left-0 right-0 z-30 pt-safe-top px-6 py-4 flex justify-between items-start pointer-events-none">
        {/* Tombol Back */}
        <Link href="/dashboard" className="pointer-events-auto group flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-white/20 active:scale-95 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50">
            <ArrowLeft size={20} className="text-white group-hover:text-emerald-400" />
        </Link>
        
        {/* Status AI */}
        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isCameraReady ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-100/80">
                    AI VISION v2.0
                </span>
            </div>
        </div>
      </header>

      {/* --- VIEWPORT KAMERA --- */}
      <div className="relative flex-1 bg-gray-950 w-full h-full overflow-hidden">
        
        {/* Loading / Error State */}
        {!isCameraReady && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-950/90 text-center px-6">
                {errorMessage ? (
                    <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                        <XCircle className="text-red-500 mb-4 mx-auto" size={48} />
                        <p className="text-red-400 font-bold mb-2">Akses Ditolak</p>
                        <p className="text-red-400/70 text-sm">{errorMessage}</p>
                        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
                            <RefreshCw size={16} /> Coba Lagi
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Aperture size={24} className="text-emerald-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-emerald-500 font-mono font-bold tracking-[0.2em] animate-pulse">INITIALIZING...</p>
                    </div>
                )}
             </div>
        )}

        {/* Video Feed */}
        <div ref={webcamRef} className="absolute inset-0 w-full h-full z-0 transform scale-x-[-1]" />
        
        {/* --- OVERLAYS VISUAL (HUD) --- */}
        {isCameraReady && !isProcessing && (
            <>
                {/* Vignette Gelap di pinggir agar fokus ke tengah */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-10" />
                
                {/* Grid Pattern Halus */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 mix-blend-overlay"></div>

                {/* Scan Line Laser */}
                <div className="absolute inset-x-0 h-[2px] bg-emerald-400/80 shadow-[0_0_40px_rgba(52,211,153,0.8)] z-10 animate-[scan_3s_ease-in-out_infinite]" />

                {/* RETICLE (Kotak Bidik Tengah) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 rounded-3xl z-10 pointer-events-none">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -mb-1 -mr-1"></div>
                    
                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/50 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/50 -translate-y-1/2"></div>
                    </div>
                </div>

                {/* Progress Circle (Indikator Auto-Lock) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                     <div className={cn("relative transition-all duration-300 ease-out", scanProgress > 5 ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}>
                        <svg className="w-72 h-72 -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                             <circle cx="144" cy="144" r="140" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/10" />
                             <circle 
                                cx="144" cy="144" r="140" 
                                stroke="currentColor" strokeWidth="4" fill="transparent" 
                                className="text-emerald-400 transition-all duration-100 ease-linear"
                                strokeDasharray={880} 
                                strokeDashoffset={880 - (880 * scanProgress) / 100}
                                strokeLinecap="round"
                             />
                        </svg>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-emerald-400 text-xs font-mono font-bold tracking-widest">
                            LOCKING TARGET... {Math.round(scanProgress)}%
                        </div>
                     </div>
                </div>
            </>
        )}
      </div>

      {/* --- FOOTER & CONTROLS --- */}
      <div className="relative z-30 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-8 px-6 -mt-24">
         
         <div className="flex justify-between items-end mb-6">
             {/* Text Indikator */}
             <div>
                <p className="text-xs text-emerald-400 font-mono font-bold tracking-widest mb-1">
                    {isProcessing ? "ANALYZING DATA..." : "TARGET SCANNER"}
                </p>
                <h2 className={cn("text-2xl font-black tracking-tight transition-colors", bestGuess ? "text-white" : "text-white/40")}>
                    {isProcessing ? "Mohon Tunggu..." : bestGuess ? bestGuess.toUpperCase() : "Cari Objek..."}
                </h2>
             </div>
             
             {/* Icon Status */}
             <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border transition-all", 
                bestGuess ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/5 border-white/10 text-white/20")}>
                 {isProcessing ? <Loader2 className="animate-spin" /> : <Scan />}
             </div>
         </div>

         {/* Bar Probabilitas (Desain Baru) */}
         <div className="space-y-3 mb-6 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            {predictions.length > 0 ? predictions.map((pred, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className={cn("w-20 text-xs font-bold truncate text-right", pred.className === bestGuess ? 'text-emerald-300' : 'text-gray-500')}>
                        {pred.className}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full rounded-full transition-all duration-300 relative", 
                                pred.className === bestGuess ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gray-600')}
                            style={{ width: `${pred.probability * 100}%` }}
                        >
                            {pred.className === bestGuess && <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>}
                        </div>
                    </div>
                    <span className="w-8 text-xs font-mono text-gray-400">{Math.round(pred.probability*100)}%</span>
                </div>
            )) : (
                <div className="text-center py-2 text-xs text-gray-500 italic">Arahkan kamera ke sampah...</div>
            )}
         </div>

         {/* Tombol Manual Action */}
         <button 
            onClick={() => bestGuess && handleLapor(bestGuess, true)}
            disabled={!bestGuess || isProcessing}
            className={cn(
                "w-full py-4 rounded-2xl font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-300 border",
                bestGuess && !isProcessing 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-100" 
                    : "bg-gray-900/50 text-gray-600 border-gray-800 cursor-not-allowed scale-95"
            )}
         >
            {isProcessing ? (
                <>
                    <Loader2 className="animate-spin w-5 h-5" /> 
                    <span>MENGIRIM DATA...</span>
                </>
            ) : bestGuess ? (
                <>
                    <Zap className="w-5 h-5 fill-white" />
                    <span>LAPOR: {bestGuess.toUpperCase()}</span>
                </>
            ) : (
                <span className="opacity-50">TUNGGU DETEKSI...</span>
            )}
         </button>

      </div>
      
      {/* CSS Animasi Custom */}
      <style jsx global>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </main>
  );
}