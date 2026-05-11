import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

export const GameDetail = ({ game, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoAspect, setVideoAspect] = useState(16 / 9);

  const [windowSize, setWindowSize] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 1200, 
    h: typeof window !== 'undefined' ? window.innerHeight : 800 
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFullscreen]);

  if (!game) return null;

  const isMobile = windowSize.w < 640;

  // Calcolo Shrink-Wrap "Fullbox"
  let targetWidth = windowSize.w * 0.95;
  let targetHeight = windowSize.h * 0.95;
  if (targetWidth / videoAspect > targetHeight) {
    targetWidth = targetHeight * videoAspect;
  } else {
    targetHeight = targetWidth / videoAspect;
  }

  // Usiamo PIXEL assoluti al posto di calc() per far sì che Framer Motion 
  // possa animare esplicitamente le dimensioni senza usare il sistema "layout"
  // che causa lo stretch (scale) degli elementi figli.
  const defaultBoxWidth = isMobile ? windowSize.w - 32 : Math.min(1152, windowSize.w - 64); // 1152 = 72rem (max-w-6xl)
  const defaultBoxHeight = isMobile ? windowSize.h - 32 : windowSize.h * 0.8;

  const boxWidth = isFullscreen ? targetWidth : defaultBoxWidth;
  const boxHeight = isFullscreen ? targetHeight : defaultBoxHeight;

  // Posizionamenti assoluti fluidi in percentuale
  const mediaStyle = isFullscreen
    ? { top: 0, left: 0, width: '100%', height: '100%' }
    : (isMobile 
        ? { top: 0, left: 0, width: '100%', height: '50%' } 
        : { top: 0, left: 0, width: '50%', height: '100%' });

  const textStyle = isFullscreen
    ? (isMobile 
        ? { bottom: 0, left: 0, width: '100%', height: '0%', opacity: 0 } 
        : { top: 0, right: 0, width: '0%', height: '100%', opacity: 0 })
    : (isMobile 
        ? { bottom: 0, left: 0, width: '100%', height: '50%', opacity: 1 } 
        : { top: 0, right: 0, width: '50%', height: '100%', opacity: 1 });

  return (
    <motion.div 
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Sfondo scuro */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/95 pointer-events-auto"
      />

      {/* 
        Box Principale.
        RIMOSSO 'layout'. Usiamo animate={{ width, height }} espliciti.
        Questo forza un ricalcolo CSS puro al frame e impedisce che i figli (video e pulsante) 
        vengano schiacciati o strecciati!
      */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, scale: 0.96 },
          visible: { opacity: 1, scale: 1 }
        }}
        animate={{
          opacity: 1,
          scale: 1,
          width: boxWidth,
          height: boxHeight,
          borderRadius: isFullscreen ? '16px' : '24px',
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 bg-zinc-900 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto"
      >
        
        {/* Pulsante di chiusura generale */}
        <AnimatePresence>
          {!isFullscreen && (
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* --- COLONNA MEDIA (Assoluta) --- */}
        <motion.div 
          animate={mediaStyle}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute bg-black flex items-center justify-center overflow-hidden z-20"
        >
          {/* L'immagine vola dalla griglia a qui tramite layoutId */}
          <motion.img
            layoutId={`cover-${game.id}`}
            src={game.coverUrl}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Il video in overlay. Senza stretch! */}
          <motion.video
            src={game.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={(e) => setVideoAspect(e.target.videoWidth / e.target.videoHeight)}
            onCanPlay={() => setVideoLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoLoaded ? 1 : 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }} 
            className="absolute inset-0 w-full h-full object-cover z-10 scale-[1.01]"
          />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white backdrop-blur-md transition-colors border border-white/10"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <AnimatePresence>
            {!isFullscreen && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-zinc-900 via-transparent to-transparent opacity-80 pointer-events-none z-20" 
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- COLONNA TESTO (Assoluta) --- */}
        <motion.div 
          animate={textStyle}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute flex flex-col p-6 sm:p-10 overflow-y-auto custom-scrollbar z-10"
        >
          <div className="w-full h-full min-w-[300px]">
            {/* Titolo con Logo a sinistra */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 bg-zinc-800/50 rounded-2xl border-4 border-white/10 flex items-center justify-center overflow-hidden shadow-xl backdrop-blur-sm">
                {game.logoUrl ? (
                  <img 
                    src={game.logoUrl} 
                    alt="" 
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="text-zinc-600 text-[10px] uppercase font-bold text-center">Logo</div>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {game.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                <span className="font-bold">{game.rating}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <span className="text-zinc-400 font-medium border border-zinc-700 px-3 py-1.5 rounded-full text-sm">
                {game.year || '2023'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {game.tags.map((tag, i) => (
                <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-zinc-800 border border-white/5 text-zinc-300 rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line">
                {game.description}
              </p>
            </div>
            
            <div className="mt-auto pt-4">
              {game.steamUrl ? (
                <a 
                  href={game.steamUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-3.5 bg-white text-black text-center font-bold rounded-xl text-lg hover:bg-zinc-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Gioca Ora
                </a>
              ) : (
                <button className="w-full py-3.5 bg-white text-black font-bold rounded-xl text-lg hover:bg-zinc-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Gioca Ora
                </button>
              )}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};
