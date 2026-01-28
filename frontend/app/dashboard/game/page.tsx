'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';
import Link from 'next/link';

// --- TIPE DATA ---
interface UserData {
  fullName: string;
  gameTickets: number;
  highScore: number;
}

interface TrashItem {
  id: number;
  type: string;
  emoji: string;
  x: number; // Posisi Horizontal (%)
  y: number; // Posisi Vertikal (%)
  speed: number;
  isCaught: boolean; // Status apakah sedang animasi masuk keranjang
}

const TRASH_TYPES = [
  { type: 'Plastik', emoji: '🥤' },
  { type: 'Kertas', emoji: '📄' },
  { type: 'Organik', emoji: '🍎' },
  { type: 'Logam', emoji: '🥫' },
] as const;

export default function GamePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // State Game
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [items, setItems] = useState<TrashItem[]>([]);
  const [basketX, setBasketX] = useState(50); // Posisi Tengah (50%)
  const [targetType, setTargetType] = useState<string>('Plastik');
  
  // Display Score
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [livesDisplay, setLivesDisplay] = useState(3);

  // REFS (Variable yang berubah cepat tanpa re-render)
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const requestRef = useRef<number>(0); 
  const lastSpawnRef = useRef(0);
  const basketRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // 1. Load User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error(error);
        router.push('/dashboard');
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, [router]);

  // 2. Start Game
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
      toast.dismiss(toastId);
      toast.error('Gagal mulai game');
    }
  };

  const startGameLoop = () => {
    setGameState('playing');
    scoreRef.current = 0;
    livesRef.current = 3;
    setScoreDisplay(0);
    setLivesDisplay(3);
    setItems([]);
    changeTarget();

    lastSpawnRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const changeTarget = () => {
    const random = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
    setTargetType(random.type);
  };

  // 3. CORE LOGIC (Jantung Game)
  const updateGame = (time: number) => {
    if (livesRef.current <= 0) {
      endGame();
      return;
    }

    // A. Spawn Sampah (Makin lama makin cepat)
    // Minimal jeda 400ms, Maksimal 1200ms
    const spawnRate = Math.max(400, 1200 - (scoreRef.current * 10)); 
    if (time - lastSpawnRef.current > spawnRate) {
      spawnItem();
      lastSpawnRef.current = time;
    }

    // B. Gerakkan Sampah & Cek Tabrakan
    setItems(prevItems => {
      const nextItems: TrashItem[] = [];
      
      prevItems.forEach(item => {
        // Jika sudah tertangkap (animasi mengecil), biarkan dia hilang
        if (item.isCaught) return; 

        // Gerakkan ke bawah
        const nextY = item.y + item.speed;

        // --- LOGIKA TABRAKAN (COLLISION DETECTION) ---
        // Keranjang berada di Y: 80% sampai 95%
        // Lebar Keranjang efektif sekitar 20% (basketX +/- 10%)
        
        const isAtBasketHeight = nextY > 80 && nextY < 95;
        const isInsideBasketWidth = Math.abs(item.x - basketX) < 12; // Toleransi lebar 12% kiri-kanan

        if (isAtBasketHeight && isInsideBasketWidth) {
          // KENA! Masuk Keranjang
          handleCatch(item);
          // Tandai item ini caught (untuk animasi atau dihapus)
          nextItems.push({ ...item, isCaught: true }); 
        } 
        else if (nextY > 100) {
           // Jatuh ke lantai (Hilang)
           // Opsional: Kalau item target jatuh tapi ga ditangkap, mau dikurangi poin?
           // Untuk sekarang kita biarkan saja (hanya salah tangkap yg kurangi nyawa)
        } 
        else {
           // Masih jatuh
           nextItems.push({ ...item, y: nextY });
        }
      });

      // Filter yang sudah isCaught agar hilang dari array di frame berikutnya (biar visualnya clean)
      return nextItems.filter(i => !i.isCaught);
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  const spawnItem = () => {
    const randomType = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
    const newItem: TrashItem = {
      id: Math.random(),
      type: randomType.type,
      emoji: randomType.emoji,
      x: Math.random() * 80 + 10, // Random X (10% - 90%) agar tidak terlalu pinggir
      y: -10,
      speed: 0.4 + (Math.random() * 0.3) + (scoreRef.current * 0.005), // Kecepatan bertambah pelan-pelan
      isCaught: false,
    };
    setItems(prev => [...prev, newItem]);
  };

  // 4. Logika Penilaian
  const handleCatch = (item: TrashItem) => {
    if (item.type === targetType) {
      // BENAR
      scoreRef.current += 10;
      setScoreDisplay(scoreRef.current);
      
      // Ganti misi setiap 50 poin
      if (scoreRef.current % 50 === 0) {
        changeTarget();
        setTimeout(() => toast(`Misi Baru: ${targetType}!`, { icon: '🎯' }), 0);
      }
    } else {
      // SALAH
      livesRef.current -= 1;
      setLivesDisplay(livesRef.current);
      if (navigator.vibrate) navigator.vibrate(200);
      setTimeout(() => toast('Salah Sampah! -1 Nyawa', { icon: '💔' }), 0);
    }
  };

  // 5. Game Over
  const endGame = async () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setGameState('gameover');
    
    // Pastikan item bersih
    setItems([]);

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

  // 6. Kontrol Gerak (Mouse & Touch)
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    // Konversi posisi mouse (pixel) ke persen (0-100) relatif terhadap lebar area game
    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    
    // Batasi agar keranjang tidak keluar layar (10% - 90%)
    xPercent = Math.max(10, Math.min(90, xPercent));
    
    setBasketX(xPercent);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (loadingData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans overflow-hidden select-none touch-none">
      <Toaster position="top-center" />

      {/* AREA GAME (FULL SCREEN DI HP) */}
      <div 
        ref={gameAreaRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className="relative mx-auto max-w-md h-screen bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl overflow-hidden cursor-crosshair"
      >
        
        {/* HUD (Score & Lives) */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
             <div>
                <div className="text-3xl font-black text-yellow-400 drop-shadow-md tracking-wider">
                  {scoreDisplay}
                </div>
                <div className="flex gap-1 mt-1 text-xl">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className={`transition-opacity duration-300 ${i < livesDisplay ? "opacity-100" : "opacity-20 grayscale"}`}>
                      ❤️
                    </span>
                  ))}
                </div>
             </div>

             <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center animate-pulse shadow-lg">
                <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">Misi</p>
                <p className="text-xl font-bold text-emerald-400 drop-shadow-sm">{targetType}</p>
             </div>
          </div>
        )}

        {/* ITEMS (SAMPAH JATUH) */}
        {gameState === 'playing' && items.map(item => (
          <div
            key={item.id}
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute text-5xl transition-none z-10"
          >
            {item.emoji}
          </div>
        ))}

        {/* KERANJANG (PLAYER) */}
        {gameState === 'playing' && (
          <div 
            ref={basketRef}
            style={{ left: `${basketX}%` }}
            className="absolute bottom-[10%] -translate-x-1/2 w-24 h-20 z-20 transition-transform duration-75"
          >
             {/* Visual Keranjang */}
             <div className="w-full h-full relative">
                <div className="absolute bottom-0 w-full h-4/5 bg-emerald-600 rounded-b-3xl rounded-t-lg border-4 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)] flex items-center justify-center">
                    <span className="text-3xl drop-shadow-lg">🗑️</span>
                </div>
                {/* Efek Mulut Keranjang */}
                <div className="absolute top-0 w-full h-1/5 bg-emerald-800 rounded-full opacity-50 blur-sm"></div>
             </div>
          </div>
        )}

        {/* MENU START */}
        {gameState === 'menu' && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎮</div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-2">
                IJO CATCHER
              </h1>
              <p className="text-gray-400 mb-8 max-w-xs leading-relaxed">
                Geser keranjang ke kiri/kanan. Tangkap sampah sesuai perintah misi!
              </p>
              
              <div className="bg-white/5 p-4 rounded-2xl w-full mb-8 border border-white/10 backdrop-blur-sm">
                 <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Rekor Kamu</p>
                 <p className="text-4xl font-bold text-yellow-400">{user?.highScore || 0}</p>
              </div>

              <button 
                onClick={handleStartGame}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <span>MULAI</span>
                <span className="bg-black/20 text-sm px-2 py-1 rounded text-white/90">-1 Tiket</span>
              </button>

              <Link href="/dashboard" className="mt-8 text-sm text-gray-500 hover:text-white transition-colors">
                Kembali ke Dashboard
              </Link>
           </div>
        )}

        {/* MENU GAME OVER */}
        {gameState === 'gameover' && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-xl p-6 text-center animate-in zoom-in duration-300">
              <div className="text-6xl mb-2">🏁</div>
              <h2 className="text-3xl font-bold text-white mb-6">PERMAINAN SELESAI</h2>
              
              <div className="flex flex-col items-center gap-1 mb-10">
                <span className="text-gray-400 text-sm uppercase tracking-widest">Skor Akhir</span>
                <span className="text-6xl font-black text-yellow-400 drop-shadow-lg">{scoreRef.current}</span>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Main Lagi
                </button>
                <Link href="/dashboard" className="w-full py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  Kembali ke Dashboard
                </Link>
              </div>
           </div>
        )}

      </div>
    </main>
  );
}