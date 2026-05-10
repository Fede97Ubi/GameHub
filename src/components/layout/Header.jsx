import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Maximize } from 'lucide-react';

export const Header = ({ viewMode, setViewMode }) => {
  return (
    <header className="shrink-0 z-50 w-full backdrop-blur-md bg-zinc-950/80 border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
        <span className="bg-white text-black px-2 py-0.5 rounded-md">G</span>
        GameHub
      </h1>

      {/* Switcher Elegante */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-400 hidden sm:block">View Mode</span>
        
        <div className="relative flex items-center p-1 bg-zinc-900 rounded-full border border-white/5 shadow-inner">
          {/* Sfondo animato dello switch */}
          <motion.div
            className="absolute h-8 w-12 bg-white/10 rounded-full shadow-sm"
            layout
            initial={false}
            animate={{
              x: viewMode === 'smart' ? 0 : 48 // 48px = larghezza bottone
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          />

          <button
            onClick={() => setViewMode('smart')}
            className={`relative z-10 w-12 h-8 flex items-center justify-center transition-colors ${
              viewMode === 'smart' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Smart View"
          >
            <LayoutGrid size={18} />
          </button>

          <button
            onClick={() => setViewMode('full')}
            className={`relative z-10 w-12 h-8 flex items-center justify-center transition-colors ${
              viewMode === 'full' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Full View"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
