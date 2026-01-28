'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';
import * as tmImage from '@teachablemachine/image';
import { ArrowLeft, Loader2, ScanLine, Zap, CheckCircle2, Camera } from 'lucide-react';
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

  // --- FUNGSI API ---
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
          <span className="font-bold">{isManual ? 'Laporan Manual Sukses!' : 'Sampah Terdeteksi!'}</span>
          <span className="text-xs">Kamu dapat +{data.reward} Koin</span>
        </div>,
        { duration: 3000, icon: '🌱' }
      );

      if (data.tickets > 0 && data.newCoinBalance === 0) {
        setTimeout(() => toast('🎉 Selamat! Koin ditukar jadi Tiket!', { icon: '🎟️' }), 1000);
      }

      router.refresh();
      setTimeout(() => router.push('/dashboard'), 1500);

    } catch (error) {
      console.error("Gagal Lapor:", error);
      toast.error('Gagal terhubung ke server.');
      isSendingRef.current = false;
      setIsProcessing(false);
      stabilityCounterRef.current = 0;
      setScanProgress(0);
    }
  }, [router]);

  // --- INIT & LOOP ---
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

                // Trigger Auto Send (Hanya jika SANGAT yakin)
                if (stabilityCounterRef.current >= STABILITY_FRAMES && !isSendingRef.current) {
                    handleLapor(currentClassRef.current!);
                }

                // Update UI
                if (now - lastUiUpdateRef.current > UI_UPDATE_DELAY) {
                    setPredictions(sorted.slice(0, 3));
                    // Kita set Best Guess lebih agresif (di atas 40% sudah tampil namanya)
                    // Supaya tombol manual bisa aktif lebih cepat
                    setBestGuess(topResult.probability > 0.4 ? topResult.className : null);
                    
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

        const webcam = new tmImage.Webcam(224, 224, true); 
        await webcam.setup();
        
        if (!isMountedRef.current) return; 

        const videoEl = webcam.canvas;
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('muted', 'true');
        
        await webcam.play();
        webcamInstanceRef.current = webcam;

        if (webcamRef.current) {
            webcamRef.current.innerHTML = ''; 
            webcam.canvas.className = "absolute inset-0 w-full h-full object-cover";
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

      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link href="/dashboard" className="pointer-events-auto p-3 bg-white/10 backdrop-blur-md rounded-full active:scale-95 transition border border-white/10">
            <ArrowLeft size={24} className="text-white" />
        </Link>
        <div className="text-right">
            <h1 className="font-bold text-lg tracking-wider text-white">AI SCANNER</h1>
            <div className="flex items-center justify-end gap-2 text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                System Online
            </div>
        </div>
      </header>

      {/* VIEWPORT KAMERA */}
      <div className="relative flex-1 bg-gray-900 w-full h-full overflow-hidden">
        
        {!isCameraReady && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-900 text-center px-6">
                {errorMessage ? (
                    <>
                        <Zap className="text-red-500 mb-4" size={48} />
                        <p className="text-red-400 font-medium">{errorMessage}</p>
                        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20">Coba Reload</button>
                    </>
                ) : (
                    <>
                        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                        <p className="text-sm text-emerald-500 font-bold tracking-widest animate-pulse">MEMUAT MODEL AI...</p>
                    </>
                )}
             </div>
        )}

        <div ref={webcamRef} className="absolute inset-0 w-full h-full z-0 transform scale-x-[-1]" />
        
        {isCameraReady && !isProcessing && (
            <>
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-black/20 z-10" />
                <div className="absolute inset-x-0 h-[3px] bg-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.8)] z-10 animate-[scan_2.5s_ease-in-out_infinite]" />
            </>
        )}

        {/* PROGRESS CIRCLE (Auto Scan Indikator) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
             <div className={cn("relative transition-all duration-300 ease-out", scanProgress > 5 ? 'scale-100 opacity-100' : 'scale-90 opacity-0')}>
                <div className="w-64 h-64 rounded-full border border-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <svg className="w-64 h-64 -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                     <circle cx="128" cy="128" r="124" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-transparent" />
                     <circle 
                        cx="128" cy="128" r="124" 
                        stroke="currentColor" strokeWidth="6" fill="transparent" 
                        className="text-emerald-500 transition-all duration-100 ease-linear"
                        strokeDasharray={779} 
                        strokeDashoffset={779 - (779 * scanProgress) / 100}
                        strokeLinecap="round"
                     />
                </svg>
             </div>
        </div>
      </div>

      {/* FOOTER & BUTTON AREA */}
      <div className="relative z-30 bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 pb-8 rounded-t-3xl -mt-6">
         
         <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className={bestGuess ? "text-emerald-500" : "text-gray-600"} />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    {isProcessing ? "MENGIRIM..." : bestGuess ? `TERDETEKSI: ${bestGuess}` : "MENCARI OBJEK..."}
                </span>
             </div>
         </div>

         {/* GRAFIK BAR */}
         <div className="space-y-3 mb-6">
            {predictions.length > 0 ? predictions.map((pred, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                    <span className={cn("w-24 text-right truncate font-medium", pred.className === bestGuess ? 'text-white' : 'text-gray-500')}>
                        {pred.className}
                    </span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={cn("h-full rounded-full transition-all duration-300", pred.className === bestGuess ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gray-700')}
                            style={{ width: `${pred.probability * 100}%` }}
                        />
                    </div>
                    <span className="w-10 text-right font-mono text-gray-500">{Math.round(pred.probability*100)}%</span>
                </div>
            )) : (
                <div className="text-center py-2 text-xs text-gray-600">Menunggu objek masuk ke frame...</div>
            )}
         </div>

         {/* TOMBOL MANUAL (BARU) */}
         <button 
            onClick={() => bestGuess && handleLapor(bestGuess, true)}
            disabled={!bestGuess || isProcessing}
            className={cn(
                "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg",
                bestGuess && !isProcessing 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20" 
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
            )}
         >
            {isProcessing ? (
                <>
                    <Loader2 className="animate-spin" /> Sedang Mengirim...
                </>
            ) : bestGuess ? (
                <>
                    <Camera size={20} /> Lapor: {bestGuess}
                </>
            ) : (
                "Dekatkan Objek..."
            )}
         </button>

      </div>
      
      <style jsx global>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </main>
  );
}