'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Leaf, Utensils } from 'lucide-react';

interface TipsCardProps {
  title: string;
  desc: string;
  index: number;
}

export default function TipsCard({ title, desc, index }: TipsCardProps) {
  // Pilih icon berdasarkan judul (opsional, pemanis aja)
  const getIcon = () => {
    if (title.toLowerCase().includes('makanan') || title.toLowerCase().includes('masak')) 
      return <Utensils className="w-6 h-6 text-white" />;
    return <Leaf className="w-6 h-6 text-white" />;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
      
      {/* Header Card */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shrink-0">
           <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-black text-slate-300 border border-slate-100 shadow-sm">
             {index + 1}
           </span>
           {getIcon()}
        </div>
        <h3 className="text-xl font-bold text-slate-800 leading-tight">
          {title}
        </h3>
      </div>

      {/* Content Markdown Renderer */}
      <div className="text-slate-600 text-sm leading-relaxed space-y-4 flex-1 tips-content">
        <ReactMarkdown
          components={{
            // Styling untuk Heading
            h3: ({node, ...props}) => <h3 className="font-bold text-emerald-700 mt-4 mb-2 text-base" {...props} />,
            
            // Styling untuk Bold (**Teks**)
            strong: ({node, ...props}) => <strong className="font-bold text-emerald-800 bg-emerald-50 px-1 rounded" {...props} />,
            
            // Styling untuk List Bullet
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 marker:text-emerald-500" {...props} />,
            
            // Styling untuk List Angka
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 marker:text-emerald-600 font-medium" {...props} />,
            
            // Styling untuk Paragraf biasa
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            
            // Styling untuk List Item
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
          }}
        >
          {desc}
        </ReactMarkdown>
      </div>
    </div>
  );
}