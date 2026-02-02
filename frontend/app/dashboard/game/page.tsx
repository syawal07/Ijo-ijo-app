'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Play, Trophy, Timer, Star, RefreshCw, ChevronRight, Brain, Leaf } from 'lucide-react';
import api from '@/lib/axios';

// ============================================================================
// SHARED TYPES & UTILS
// ============================================================================

interface UserData {
  fullName: string;
  gameTickets: number;
  highScore: number; 
}

const GAME_PRICE = 1;

// ============================================================================
// GAME 1: IJO CATCHER (WITH AUDIO)
// ============================================================================

const TRASH_TYPES = [
  { type: 'Plastik', emoji: '🥤', color: 'text-blue-400' },
  { type: 'Kertas', emoji: '📄', color: 'text-yellow-200' },
  { type: 'Organik', emoji: '🍎', color: 'text-green-400' },
  { type: 'Logam', emoji: '🥫', color: 'text-gray-400' },
] as const;

type TrashTypeItem = typeof TRASH_TYPES[number];

interface TrashItem {
  id: number;
  type: string;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  isCaught: boolean;
}

function IjoCatcherGame({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [items, setItems] = useState<TrashItem[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [livesDisplay, setLivesDisplay] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [targetType, setTargetType] = useState<TrashTypeItem>(TRASH_TYPES[0]);

  const itemsRef = useRef<TrashItem[]>([]); 
  const basketXRef = useRef(50);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const timeRef = useRef(60);
  const targetTypeRef = useRef<TrashTypeItem>(TRASH_TYPES[0]);
  const requestRef = useRef<number>(0); 
  const lastSpawnRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // --- AUDIO REFS ---
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxPop = useRef<HTMLAudioElement | null>(null);
  const sfxWrong = useRef<HTMLAudioElement | null>(null);
  const sfxOver = useRef<HTMLAudioElement | null>(null);

  // --- AUDIO INIT ---
  useEffect(() => {
    bgmRef.current = new Audio('/sound/bgm-catcher.mp3'); 
    bgmRef.current.loop = true; 
    bgmRef.current.volume = 0.4; 

    sfxPop.current = new Audio('/sound/pop.mp3');
    sfxPop.current.volume = 0.6;

    sfxWrong.current = new Audio('/sound/wrong.mp3');
    sfxWrong.current.volume = 0.6;

    sfxOver.current = new Audio('/sound/gameover.mp3');
    sfxOver.current.volume = 0.7;

    return () => {
      stopBGM();
    };
  }, []);

  const playSfx = (type: 'pop' | 'wrong' | 'over') => {
    let audio: HTMLAudioElement | null = null;
    if (type === 'pop') audio = sfxPop.current;
    if (type === 'wrong') audio = sfxWrong.current;
    if (type === 'over') audio = sfxOver.current;

    if (audio) {
      const soundClone = audio.cloneNode() as HTMLAudioElement; 
      soundClone.volume = audio.volume;
      soundClone.play().catch(e => console.log("Audio error:", e));
    }
  };

  const playBGM = () => {
    if (bgmRef.current) {
      bgmRef.current.currentTime = 0;
      bgmRef.current.play().catch(e => console.log("BGM error:", e));
    }
  };

  const stopBGM = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, []);

  const handleStartGame = async () => {
    if (!user || user.gameTickets < GAME_PRICE) {
      toast.error('Tiket habis!');
      return;
    }
    const toastId = toast.loading('Siap-siap...');
    try {
      await api.post('/games/start');
      setUser(prev => prev ? ({ ...prev, gameTickets: prev.gameTickets - GAME_PRICE }) : null);
      toast.dismiss(toastId);
      
      // --- PLAY MUSIC ---
      playBGM();

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
                
                // --- SFX CORRECT ---
                playSfx('pop');

                if (scoreRef.current % 100 === 0) {
                    timeRef.current += 5;
                    setTimeLeft(timeRef.current);
                    toast.success('+5 Detik!', { duration: 1000, position: 'bottom-center' });
                }
            } else {
                livesRef.current -= 1;
                
                // --- SFX WRONG ---
                playSfx('wrong');

                if (navigator.vibrate) navigator.vibrate(200);
            }
        } else if (item.y > 120) {
            // Missed
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

  const endGame = async () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // --- STOP BGM & PLAY OVER ---
    stopBGM();
    playSfx('over');

    setGameState('gameover');
    
    const finalScore = scoreRef.current;
    
    try {
      await api.post('/games/score', { 
        score: finalScore,
        gameType: 'catcher' 
      });

      if (user && finalScore > user.highScore) {
        setUser({ ...user, highScore: finalScore });
      }
    } catch (error) {
      console.error("Gagal simpan skor:", error);
      toast.error("Gagal menyimpan skor");
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
      stopBGM();
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

        {gameState === 'playing' && items.map(item => (
          <div key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }} className="absolute text-5xl z-10 pointer-events-none will-change-transform">
            {item.emoji}
          </div>
        ))}

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

        {gameState === 'menu' && (
           <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-8 text-center animate-in fade-in">
              <div className="text-7xl mb-4 animate-bounce">♻️</div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">IJO CATCHER</h1>
              <p className="text-gray-400 mb-8 max-w-xs text-sm">Tangkap sampah sesuai target!<br/><span className="text-yellow-400 font-bold">Waktu: 60 Detik</span></p>
              
              <button onClick={handleStartGame} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-xl text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mb-4">
                MULAI MAIN (-1 Tiket)
              </button>
              <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">
                Kembali ke Menu Game
              </button>
           </div>
        )}

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
// GAME 2: NEURO SNAKE (FIXED)
// ============================================================================

const GRID_SIZE = 20;
const CELL_COUNT = 20;

function NeuroSnakeGame({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  
  const [snake, setSnake] = useState<{x: number, y: number}[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{x: number, y: number}>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [score, setScore] = useState(0);

  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) { console.error(error); } 
      finally { setLoadingData(false); }
    };
    fetchProfile();
  }, []);

  const generateFood = () => {
    return {
      x: Math.floor(Math.random() * CELL_COUNT),
      y: Math.floor(Math.random() * CELL_COUNT)
    };
  };

  const handleStartGame = async () => {
    if (!user || user.gameTickets < GAME_PRICE) {
      toast.error('Tiket habis!');
      return;
    }
    const toastId = toast.loading('Memulai Neuro Snake...');
    try {
      await api.post('/games/start');
      setUser(prev => prev ? ({ ...prev, gameTickets: prev.gameTickets - GAME_PRICE }) : null);
      toast.dismiss(toastId);
      startGameLoop();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Gagal mulai game');
    }
  };

  const startGameLoop = () => {
    setSnake([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
    setFood(generateFood());
    setScore(0);
    setDirection('UP');
    directionRef.current = 'UP';
    setGameState('playing');
  };

  const endGame = async () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    setGameState('gameover');
    try {
      await api.post('/games/score', { 
        score: score, 
        gameType: 'snake' 
      });

      if (user && score > user.highScore) {
        setUser({ ...user, highScore: score });
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (directionRef.current) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        if (newHead.x < 0 || newHead.x >= CELL_COUNT || newHead.y < 0 || newHead.y >= CELL_COUNT) {
          endGame();
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          endGame();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, 150);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameState, food]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp': if (directionRef.current !== 'DOWN') directionRef.current = 'UP'; break;
        case 'ArrowDown': if (directionRef.current !== 'UP') directionRef.current = 'DOWN'; break;
        case 'ArrowLeft': if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'; break;
        case 'ArrowRight': if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const setDir = (d: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (d === 'UP' && directionRef.current !== 'DOWN') directionRef.current = 'UP';
    if (d === 'DOWN' && directionRef.current !== 'UP') directionRef.current = 'DOWN';
    if (d === 'LEFT' && directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
    if (d === 'RIGHT' && directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
  };

  if (loadingData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><div className="animate-spin text-4xl">⏳</div></div>;

  return (
    <div className="fixed inset-0 bg-slate-900 text-white font-sans overflow-hidden touch-none z-50 flex flex-col items-center">
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 p-8 text-center animate-in fade-in">
          <div className="text-7xl mb-4 animate-bounce">🐍</div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">NEURO SNAKE</h1>
          <p className="text-gray-400 mb-8 max-w-xs text-sm">Makan sampah organik untuk tumbuh.<br/><span className="text-emerald-400 font-bold">Jangan tabrak dinding!</span></p>
          
          <button onClick={handleStartGame} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-xl text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mb-4">MULAI MAIN (-1 Tiket)</button>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-white">Kembali</button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
            <div className="w-full max-w-md p-4 flex justify-between items-center bg-slate-800 shadow-lg z-10">
                <div className="font-bold text-emerald-400 flex items-center gap-2"><Trophy className="w-4 h-4"/> {score}</div>
                <div className="text-xs text-gray-400">Swipe or use Arrows</div>
            </div>

            <div className="relative w-full max-w-md aspect-square bg-slate-800 border-4 border-slate-700 mt-4 rounded-lg overflow-hidden">
                {snake.map((segment, i) => (
                    <div key={i} style={{ left: `${segment.x * 5}%`, top: `${segment.y * 5}%` }} className={`absolute w-[5%] h-[5%] ${i === 0 ? 'bg-emerald-400 rounded-sm z-20' : 'bg-emerald-600/80 rounded-sm z-10'}`}></div>
                ))}
                <div style={{ left: `${food.x * 5}%`, top: `${food.y * 5}%` }} className="absolute w-[5%] h-[5%] bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red] flex items-center justify-center text-[10px]">🍎</div>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 mt-8 w-full max-w-[200px]">
                <div></div>
                <button onPointerDown={() => setDir('UP')} className="h-14 bg-slate-700 rounded-xl active:bg-emerald-500 flex items-center justify-center">⬆️</button>
                <div></div>
                <button onPointerDown={() => setDir('LEFT')} className="h-14 bg-slate-700 rounded-xl active:bg-emerald-500 flex items-center justify-center">⬅️</button>
                <button onPointerDown={() => setDir('DOWN')} className="h-14 bg-slate-700 rounded-xl active:bg-emerald-500 flex items-center justify-center">⬇️</button>
                <button onPointerDown={() => setDir('RIGHT')} className="h-14 bg-slate-700 rounded-xl active:bg-emerald-500 flex items-center justify-center">➡️</button>
            </div>
        </>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl p-8 text-center animate-in fade-in zoom-in">
           <div className="text-6xl mb-4">💥</div>
           <h2 className="text-3xl font-bold text-white mb-2">GAME OVER</h2>
           <div className="flex flex-col items-center gap-2 mb-10 bg-white/5 p-6 rounded-3xl border border-white/10 w-full">
             <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Skor Akhir</span>
             <span className="text-6xl font-black text-yellow-400 drop-shadow-xl">{score}</span>
           </div>
           <button onClick={() => setGameState('menu')} className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-gray-200 mb-3">Main Lagi</button>
           <button onClick={onBack} className="w-full py-4 bg-transparent border border-white/20 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white">Keluar</button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GAME 3: ECO QUIZ (FIXED)
// ============================================================================

const QUESTIONS = [
    { q: "Sampah plastik butuh berapa lama untuk terurai?", options: ["50 tahun", "100 tahun", "400+ tahun", "1 minggu"], ans: 2 },
    { q: "Apa warna tempat sampah untuk organik?", options: ["Hijau", "Kuning", "Merah", "Biru"], ans: 0 },
    { q: "Manakah yang BUKAN gas rumah kaca?", options: ["Karbondioksida", "Metana", "Oksigen", "Nitrogen Oksida"], ans: 2 },
    { q: "3R dalam pengelolaan sampah adalah...", options: ["Read, Run, Rest", "Reduce, Reuse, Recycle", "Race, Ride, Rise", "Rose, Rice, Rain"], ans: 1 },
    { q: "Limbah B3 adalah limbah yang...", options: ["Berbau wangi", "Berbahaya & Beracun", "Bersih & Berkilau", "Basah & Bau"], ans: 1 },
    { q: "Energi terbarukan contohnya...", options: ["Batubara", "Minyak Bumi", "Sinar Matahari", "Gas Alam"], ans: 2 },
    { q: "Apa dampak utama penebangan hutan liar?", options: ["Tanah subur", "Banjir & Longsor", "Udara bersih", "Hewan senang"], ans: 1 },
    { q: "Berapa persen permukaan bumi tertutup air?", options: ["30%", "50%", "71%", "90%"], ans: 2 },
];

function EcoQuizGame({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) { console.error(error); } 
      finally { setLoadingData(false); }
    };
    fetchProfile();
  }, []);

  const handleStartGame = async () => {
    if (!user || user.gameTickets < GAME_PRICE) {
        toast.error('Tiket habis!');
        return;
    }
    const toastId = toast.loading('Loading Quiz...');
    try {
        await api.post('/games/start');
        setUser(prev => prev ? ({ ...prev, gameTickets: prev.gameTickets - GAME_PRICE }) : null);
        toast.dismiss(toastId);
        startGameLogic();
    } catch (error) {
        toast.dismiss(toastId);
        toast.error('Gagal mulai game');
    }
  };

  const startGameLogic = () => {
      setScore(0);
      setCurrentQ(0);
      setTimeLeft(60);
      setGameState('playing');
  };

  useEffect(() => {
      if (gameState === 'playing') {
          timerRef.current = setInterval(() => {
              setTimeLeft(t => {
                  if (t <= 1) {
                      endGameSafe();
                      return 0;
                  }
                  return t - 1;
              });
          }, 1000);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const handleAnswer = (idx: number) => {
      const isCorrect = idx === QUESTIONS[currentQ].ans;
      if (isCorrect) {
          setScore(s => s + 20);
          toast.success('Benar! +20', { duration: 1000, position: 'top-center', icon: '✅' });
      } else {
          toast.error('Salah!', { duration: 1000, position: 'top-center' });
          if (navigator.vibrate) navigator.vibrate(200);
      }

      if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(q => q + 1);
      } else {
          endGameSafe();
      }
  };

  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);
  
  const endGameSafe = async () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('gameover');
      try {
          await api.post('/games/score', { 
            score: scoreRef.current,
            gameType: 'quiz' 
          });

          if (user && scoreRef.current > user.highScore) {
             setUser({ ...user, highScore: scoreRef.current });
          }
      } catch (e) { console.error(e); }
  };

  if (loadingData) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><div className="animate-spin text-4xl">⏳</div></div>;

  return (
      <div className="fixed inset-0 bg-slate-900 text-white font-sans overflow-hidden touch-none z-50 flex flex-col items-center">
          {gameState === 'menu' && (
             <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 p-8 text-center animate-in fade-in">
                <div className="text-7xl mb-4 animate-bounce">🧠</div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">ECO QUIZ</h1>
                <p className="text-gray-400 mb-8 max-w-xs text-sm">Jawab pertanyaan lingkungan secepat mungkin!<br/><span className="text-blue-400 font-bold">Waktu: 60 Detik</span></p>
                
                <button onClick={handleStartGame} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all mb-4">MULAI MAIN (-1 Tiket)</button>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-white">Kembali</button>
             </div>
          )}

          {gameState === 'playing' && (
              <div className="w-full h-full max-w-md bg-slate-800 flex flex-col p-6">
                 <div className="flex justify-between items-center mb-8">
                     <div className="flex flex-col">
                         <span className="text-xs text-gray-400 font-bold uppercase">Skor</span>
                         <span className="text-3xl font-black text-yellow-400">{score}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-full border border-slate-600">
                         <Timer className="w-4 h-4 text-white"/>
                         <span className={`font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</span>
                     </div>
                 </div>

                 <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-2 text-xs text-blue-400 font-bold tracking-widest uppercase">Pertanyaan {currentQ + 1}/{QUESTIONS.length}</div>
                    <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">{QUESTIONS[currentQ].q}</h2>

                    <div className="flex flex-col gap-3">
                        {QUESTIONS[currentQ].options.map((opt, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleAnswer(idx)}
                                className="w-full p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-left transition-all active:scale-95 flex justify-between items-center group"
                            >
                                <span className="font-semibold text-gray-200">{opt}</span>
                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white"/>
                            </button>
                        ))}
                    </div>
                 </div>
              </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl p-8 text-center animate-in fade-in zoom-in">
               <div className="text-6xl mb-4">📝</div>
               <h2 className="text-3xl font-bold text-white mb-2">QUIZ SELESAI</h2>
               <div className="flex flex-col items-center gap-2 mb-10 bg-white/5 p-6 rounded-3xl border border-white/10 w-full">
                 <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">Skor Akhir</span>
                 <span className="text-6xl font-black text-yellow-400 drop-shadow-xl">{score}</span>
               </div>
               <button onClick={() => setGameState('menu')} className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-gray-200 mb-3">Main Lagi</button>
               <button onClick={onBack} className="w-full py-4 bg-transparent border border-white/20 rounded-2xl hover:bg-white/5 text-gray-400 hover:text-white">Keluar</button>
            </div>
          )}
      </div>
  );
}

// ============================================================================
// HALAMAN UTAMA (GAME CENTER)
// ============================================================================

export default function GameCenterPage() {
  const [activeGame, setActiveGame] = useState<'catcher' | 'snake' | 'quiz' | null>(null);

  if (activeGame === 'catcher') return <IjoCatcherGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'snake') return <NeuroSnakeGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'quiz') return <EcoQuizGame onBack={() => setActiveGame(null)} />;

  return (
    <main className="min-h-screen bg-[#F0FDF4] font-sans text-slate-800 pb-20 overflow-x-hidden selection:bg-emerald-200">
      <Toaster position="top-center" />
      
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-200/40 blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-100/60 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 relative z-10">
        
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

        <div className="text-center mb-16 space-y-4 animate-in slide-in-from-bottom-5 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                Pilih <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Tantanganmu</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Asah ketangkasan dan pengetahuan lingkunganmu melalui berbagai mini-game seru. Kumpulkan poin dan tukarkan dengan hadiah!
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* GAME 1: IJO CATCHER */}
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

            {/* GAME 2: NEURO SNAKE (UNLOCKED) */}
            <div 
                onClick={() => setActiveGame('snake')}
                className="group relative cursor-pointer rounded-[2.5rem] bg-white p-2 shadow-xl shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 animate-in zoom-in duration-500 delay-100"
            >
                <div className="relative h-48 w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600">
                    <div className="absolute inset-0 flex items-center justify-center text-8xl transition-transform duration-500 group-hover:scale-110">
                        🐍
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl">
                            <Play className="ml-1 w-8 h-8 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">Logika</span>
                    </div>
                    <h3 className="mb-2 text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">Neuro Snake</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Game klasik ular dengan twist edukasi. Makan sampah organik untuk tumbuh besar dan raih skor tertinggi!
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                            <RefreshCw className="w-4 h-4" /> Endless
                        </div>
                        <span className="text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Main Sekarang →</span>
                    </div>
                </div>
            </div>

            {/* GAME 3: ECO QUIZ (UNLOCKED) */}
            <div 
                onClick={() => setActiveGame('quiz')}
                className="group relative cursor-pointer rounded-[2.5rem] bg-white p-2 shadow-xl shadow-emerald-900/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 animate-in zoom-in duration-500 delay-200"
            >
                <div className="relative h-48 w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-400 to-purple-600">
                    <div className="absolute inset-0 flex items-center justify-center text-8xl transition-transform duration-500 group-hover:scale-110">
                        🧠
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-indigo-600 shadow-xl">
                            <Play className="ml-1 w-8 h-8 fill-current" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">Wawasan</span>
                    </div>
                    <h3 className="mb-2 text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Eco Quiz</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Uji pengetahuanmu seputar lingkungan. Jawab cepat dan tepat sebelum waktu habis!
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                            <Timer className="w-4 h-4" /> 60 Detik
                        </div>
                        <span className="text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">Main Sekarang →</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}