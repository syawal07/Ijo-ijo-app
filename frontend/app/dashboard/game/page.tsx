'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';
import { ArrowLeft, Play, Lock, Trophy, Timer, Zap, Star } from 'lucide-react';

// ============================================================================
// BAGIAN 1: LOGIKA GAME "IJO CATCHER" (Kode Kamu Sebelumnya)
// ============================================================================

const TRASH_TYPES = [
  { type: 'Plastik', emoji: '🥤', color: 'text-blue-400' },
  { type: 'Kertas', emoji: '📄', color: 'text-yellow-200' },
  { type: 'Organik', emoji: '🍎', color: 'text-green-400' },
  { type: 'Logam', emoji: '🥫', color: 'text-gray-400' },
] as const;

type TrashTypeItem = typeof TRASH_TYPES[number];

interface UserData {
  fullName: string;
  gameTickets: number;
  highScore: number;
}

interface TrashItem {
  id: number;
  type: string;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  isCaught: boolean;
}

// Kita ubah GamePage kamu menjadi komponen 'IjoCatcherGame' yang menerima props 'onBack'
function IjoCatcherGame({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // State UI
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [items, setItems] = useState<TrashItem[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [livesDisplay, setLivesDisplay] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [targetType, setTargetType] = useState<TrashTypeItem>(TRASH_TYPES[0]);

  // Refs
  const itemsRef = useRef<TrashItem[]>([]); 
  const basketXRef = useRef(50);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const timeRef = useRef(60);
  const targetTypeRef = useRef<TrashTypeItem>(TRASH_TYPES[0]);
  
  // Loop Control
  const requestRef = useRef<number>(0); 
  const lastSpawnRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Load User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error("Gagal load profile:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, []);

  // Start Game
  const handleStartGame = async () => {
    if (!user || user.gameTickets <= 0) {
      toast.error('Tiket habis!');
      return;
    }

    const toastId = toast.loading('Siap-siap...');
    try {
      await api.post('/games/start');
      setUser(prev => prev ? ({ ...prev, gameTickets: prev.gameTickets - 1 }) : null);
      toast.dismiss(toastId);
      startGameLoop();
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('Gagal mulai game');
    }
  };

  const startGameLoop = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    timeRef.current = 60; 
    itemsRef.current = [];
    basketXRef.current = 50;

    setScoreDisplay(0);
    setLivesDisplay(3);
    setTimeLeft(60);
    setItems([]);
    setBasketX(50);
    setGameState('playing');

    const randomTarget = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
    targetTypeRef.current = randomTarget;
    setTargetType(randomTarget);
    
    toast(`Misi: Tangkap ${randomTarget.type}!`, { 
        icon: randomTarget.emoji,
        duration: 3000,
        style: { background: '#333', color: '#fff' }
    });

    const now = performance.now();
    lastSpawnRef.current = now;

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // MAIN GAME LOOP
  const gameLoop = (timestamp: number) => {
    if (livesRef.current <= 0 || timeRef.current <= 0) {
      endGame();
      return;
    }

    const now = performance.now();
    const spawnRate = Math.max(400, 1000 - (scoreRef.current * 8)); 
    
    if (now - lastSpawnRef.current > spawnRate) {
        const randomData = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
        const newItem: TrashItem = {
            id: Math.random(),
            type: randomData.type,
            emoji: randomData.emoji,
            x: Math.random() * 80 + 10,
            y: -15, 
            speed: 0.4 + (Math.random() * 0.3) + (scoreRef.current * 0.002),
            isCaught: false,
        };
        itemsRef.current.push(newItem);
        lastSpawnRef.current = now;
    }

    const activeItems: TrashItem[] = [];

    itemsRef.current.forEach(item => {
        if (item.isCaught) return; 
        item.y += item.speed;

        const isAtBasketHeight = item.y > 80 && item.y < 95;
        const isInsideBasketWidth = Math.abs(item.x - basketXRef.current) < 12;

        if (isAtBasketHeight && isInsideBasketWidth) {
            item.isCaught = true; 
            
            if (item.type === targetTypeRef.current.type) {
                scoreRef.current += 10;
                if (scoreRef.current % 100 === 0) {
                    timeRef.current += 5;
                    setTimeLeft(timeRef.current);
                    toast.success('+5 Detik!', { duration: 1000, position: 'bottom-center' });
                }
            } else {
                livesRef.current -= 1;
                if (navigator.vibrate) navigator.vibrate(200);
            }
        } else if (item.y > 120) {
            // Missed logic if needed
        } else {
            activeItems.push(item);
        }
    });

    itemsRef.current = activeItems;
    setItems([...itemsRef.current]); 
    setScoreDisplay(scoreRef.current);
    setLivesDisplay(livesRef.current);

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // Timer System
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
        interval = setInterval(() => {
            if (timeRef.current > 0) {
                timeRef.current -= 1;
                setTimeLeft(timeRef.current);
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Game Over
  const endGame = async () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setGameState('gameover');
    
    const finalScore = scoreRef.current;
    
    try {
      await api.post('/games/score', { score: finalScore });
      if (user && finalScore > user.highScore) {
        setUser({ ...user, highScore: finalScore });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) clientX = e.touches[0].clientX;
    else clientX = (e as React.MouseEvent).clientX;

    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    xPercent = Math.max(10, Math.min(90, xPercent));
    
    basketXRef.current = xPercent;
    setBasketX(xPercent);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (loadingData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><div className="animate-spin text-4xl">⏳</div></div>;

  return (
    <div className="fixed inset-0 bg-gray-900 text-white font-sans overflow-hidden select-none touch-none z-50">
      <div 
        ref={gameAreaRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className="relative mx-auto max-w-md h-screen bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl overflow-hidden cursor-none"
      >
        {/* HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
             <div className="flex justify-between items-center bg-slate-800/90 backdrop-blur border border-slate-600 rounded-2xl p-3 shadow-lg mb-4">
                <div className="flex flex-col items-start">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Target</span>
                    <div className={`flex items-center gap-2 text-xl font-bold ${targetType.color} animate-pulse`}>
                        <span>{targetType.emoji}</span>
                        <span>{targetType.type}</span>
                    </div>
                </div>
                <div className={`text-3xl font-black font-mono ${timeLeft <= 10 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                    {timeLeft}s
                </div>
             </div>
             <div className="flex justify-between items-end">
                <div>
                    <span className="text-xs text-gray-500 font-bold">SKOR</span>
                    <div className="text-5xl font-black text-yellow-400 drop-shadow-md leading-none">{scoreDisplay}</div>
                </div>
                <div className="flex gap-1 text-2xl">
                   {[...Array(3)].map((_, i) => (
                     <span key={i} className={`transition-all duration-300 ${i < livesDisplay ? "scale-100 opacity-100" : "scale-75 opacity-20 grayscale"}`}>❤️</span>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* ITEMS */}
        {gameState === 'playing' && items.map(item => (
          <div key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }} className="absolute text-5xl z-10 pointer-events-none will-change-transform">
            {item.emoji}
          </div>
        ))}

        {/* KERANJANG */}
        {gameState === 'playing' && (
          <div style={{ left: `${basketX}%` }} className="absolute bottom-[8%] -translate-x-1/2 w-28 h-24 z-20 pointer-events-none will-change-transform">
             <div className="w-full h-full relative">
                <div className="absolute bottom-0 w-full h-4/5 bg-emerald-600 rounded-b-3xl rounded-t-lg border-b-4 border-emerald-900 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center">
                    <span className="text-4xl">🗑️</span>
                </div>
                <div className="absolute top-0 w-full h-3 bg-emerald-400/50 blur-sm rounded-full animate-pulse"></div>
             </div>
          </div>
        )}

        {/* MENU INTERNAL GAME */}
        {gameState === 'menu' && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-8 text-center animate-in fade-in">
              <div className="text-7xl mb-4 animate-bounce">♻️</div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">IJO CATCHER</h1>
              <p className="text-gray-400 mb-8 max-w-xs text-sm">Tangkap sampah sesuai target!<br/><span className="text-yellow-400 font-bold">Waktu: 60 Detik</span></p>
              
              <div className="bg-white/5 p-4 rounded-2xl w-full mb-8 border border-white/10">
                 <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">High Score</p>
                 <p className="text-4xl font-bold text-white">{user?.highScore || 0}</p>
              </div>

              <button onClick={handleStartGame} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-xl text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mb-4">
                MULAI MAIN (-1 Tiket)
              </button>
              <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">
                Kembali ke Menu Game
              </button>
           </div>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="text-6xl mb-4">🏁</div>
              <h2 className="text-3xl font-bold text-white mb-2">SELESAI!</h2>
              <div className="flex flex-col items-center gap-2 mb-10 bg-white/5 p-6 rounded-3xl border border-white/10 w-full">
                <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Skor Akhir</span>
                <span className="text-6xl font-black text-yellow-400 drop-shadow-xl">{scoreRef.current}</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={() => setGameState('menu')} className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-gray-200 transition-colors">Main Lagi</button>
                <button onClick={onBack} className="w-full py-4 bg-transparent border border-white/20 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">Pilih Game Lain</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// BAGIAN 2: HALAMAN UTAMA (LOBBY/DASHBOARD GAME)
// ============================================================================

export default function GameCenterPage() {
  const [activeGame, setActiveGame] = useState<'catcher' | null>(null);

  // Jika ada game aktif, tampilkan komponen game tersebut
  if (activeGame === 'catcher') {
    return <IjoCatcherGame onBack={() => setActiveGame(null)} />;
  }

  // Tampilan LOBBY
  return (
    <main className="min-h-screen bg-[#F0FDF4] font-sans text-slate-800 pb-20 overflow-x-hidden selection:bg-emerald-200">
      <Toaster position="top-center" />
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-200/40 blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-100/60 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 relative z-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
            <Link 
                href="/dashboard" 
                className="group flex items-center gap-2 rounded-full bg-white/50 backdrop-blur-md border border-white/50 px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-white hover:text-emerald-700 hover:shadow-md"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Dashboard</span>
            </Link>
            <div className="hidden sm:block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Arcade Zone
            </div>
        </div>

        {/* HERO TITLE */}
        <div className="text-center mb-16 space-y-4 animate-in slide-in-from-bottom-5 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                Pilih <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Tantanganmu</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Asah ketangkasan dan pengetahuan lingkunganmu melalui berbagai mini-game seru. Kumpulkan poin dan tukarkan dengan hadiah!
            </p>
        </div>

        {/* GAME CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* GAME 1: IJO CATCHER (AKTIF) */}
            <div 
                onClick={() => setActiveGame('catcher')}
                className="group relative cursor-pointer rounded-[2.5rem] bg-white p-2 shadow-xl shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 animate-in zoom-in duration-500"
            >
                <div className="absolute -top-3 -right-3 z-20">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-xl shadow-lg animate-bounce">🔥</span>
                </div>
                
                <div className="relative h-48 w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600">
                    <div className="absolute inset-0 flex items-center justify-center text-8xl transition-transform duration-500 group-hover:scale-110">
                        ♻️
                    </div>
                    {/* Overlay Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-xl">
                            <Play className="ml-1 w-8 h-8 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ketangkasan</span>
                        <span className="rounded-lg bg-yellow-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-700 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-700" /> Popular
                        </span>
                    </div>
                    <h3 className="mb-2 text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">Ijo Catcher</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Tangkap sampah yang jatuh sesuai target. Jangan sampai salah ambil atau nyawamu berkurang!
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                            <Timer className="w-4 h-4" /> 60 Detik
                        </div>
                        <span className="text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">Main Sekarang →</span>
                    </div>
                </div>
            </div>

            {/* GAME 2: NEURO SNAKE (LOCKED) */}
            <div className="group relative rounded-[2.5rem] bg-white p-2 opacity-80 transition-all duration-300 hover:opacity-100 hover:shadow-xl grayscale hover:grayscale-0">
                <div className="relative h-48 w-full overflow-hidden rounded-[2rem] bg-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center text-8xl text-slate-300">
                        🐍
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
                            <Lock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Coming Soon</span>
                    </div>
                    <h3 className="mb-2 text-2xl font-black text-slate-400">Neuro Snake</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Game klasik ular dengan twist edukasi. Makan sampah organik untuk tumbuh besar!
                    </p>
                    <div className="mt-6 border-t border-slate-100 pt-4">
                        <button disabled className="w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-400">
                            Segera Hadir
                        </button>
                    </div>
                </div>
            </div>

            {/* GAME 3: ECO QUIZ (LOCKED) */}
            <div className="group relative rounded-[2.5rem] bg-white p-2 opacity-80 transition-all duration-300 hover:opacity-100 hover:shadow-xl grayscale hover:grayscale-0">
                <div className="relative h-48 w-full overflow-hidden rounded-[2rem] bg-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center text-8xl text-slate-300">
                        🧠
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md">
                            <Lock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Coming Soon</span>
                    </div>
                    <h3 className="mb-2 text-2xl font-black text-slate-400">Eco Quiz</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Uji pengetahuanmu seputar lingkungan. Jawab cepat dan tepat untuk menang!
                    </p>
                    <div className="mt-6 border-t border-slate-100 pt-4">
                        <button disabled className="w-full rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-400">
                            Segera Hadir
                        </button>
                    </div>
                </div>
            </div>

        </div>

      </div>
    </main>
  );
}