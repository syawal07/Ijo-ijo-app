'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Globe, ChevronUp, Check } from 'lucide-react';

// === FIX ERROR TYPESCRIPT ===
// Kita tambahkan komentar disable agar ESLint tidak marah soal 'any'
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    googleTranslateElementInit: any;
  }
}

export default function GoogleTranslateWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ID'); 

  useEffect(() => {
    // Fix untuk Hydration (ESLint React Hooks)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'id',
          includedLanguages: 'id,en', 
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };
  }, []);

  // Fungsi ganti bahasa
  const changeLanguage = (langCode: string, label: string) => {
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (googleSelect) {
      googleSelect.value = langCode;
      googleSelect.dispatchEvent(new Event('change'));
      setCurrentLang(label);
      setIsOpen(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* 1. HIDDEN GOOGLE WIDGET */}
      <div 
        id="google_translate_element" 
        className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
      ></div>

      {/* 2. STYLE HACKING (Anti Banner Google) */}
     <style jsx global>{`
        /* 1. JANGAN HILANGKAN (Display None), TAPI SEMBUNYIKAN (Invisible)
           Ini mencegah "bug" translate macet, karena elemennya teknisnya masih ada */
        .goog-te-banner-frame {
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            border: none !important;
            overflow: hidden !important;
        }

        /* 2. MEMAKSA BODY HALAMAN TETAP DI ATAS
           Google secara otomatis menambahkan 'top: 40px' ke body. Kita lawan! */
        body {
            top: 0px !important;
            position: static !important;
        }

        /* 3. MENYEMBUNYIKAN BAR BIRU "Translated to..." (Class .skiptranslate) */
        .skiptranslate {
            visibility: hidden !important; 
            height: 0 !important;
            width: 0 !important; 
        }

        /* PENTING: Tampilkan kembali widget Custom kita 
           (Karena widget kita mungkin berada di dalam container skiptranslate secara tidak sengaja) */
        .notranslate {
            visibility: visible !important;
            height: auto !important;
            width: auto !important;
        }

        /* Membersihkan sisa elemen Google yang mengganggu */
        .goog-tooltip, 
        .goog-te-balloon-frame {
            display: none !important;
        }
        
        .goog-text-highlight {
            background-color: transparent !important;
            border: none !important; 
            box-shadow: none !important;
        }
      `}</style>

      {/* 3. SCRIPT */}
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      {/* 4. CUSTOM BUTTON UI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        
        {/* Dropdown */}
        {isOpen && (
           <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 mb-2 w-40 animate-in slide-in-from-bottom-5 fade-in duration-200">
              <button 
                onClick={() => changeLanguage('id', 'ID')}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
              >
                 <span className="flex items-center gap-2">🇮🇩 Indo</span>
                 {currentLang === 'ID' && <Check className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => changeLanguage('en', 'EN')}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
              >
                 <span className="flex items-center gap-2">🇬🇧 English</span>
                 {currentLang === 'EN' && <Check className="w-4 h-4" />}
              </button>
           </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl shadow-emerald-500/20 rounded-full flex items-center justify-center text-slate-700 hover:bg-emerald-600 hover:text-white hover:scale-110 transition-all duration-300 group"
        >
           {isOpen ? (
             <ChevronUp className="w-6 h-6" />
           ) : (
             <Globe className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
           )}
        </button>
      </div>
    </>
  );
}