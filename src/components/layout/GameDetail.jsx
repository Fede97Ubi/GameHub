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
    ? { width: boxWidth, height: boxHeight }
    : (isMobile 
        ? { width: boxWidth, height: boxHeight * 0.5 } 
        : { width: boxWidth * 0.5, height: boxHeight });

  const textStyle = isFullscreen
    ? { width: 0, height: boxHeight, opacity: 0, display: 'none' }
    : (isMobile 
        ? { width: boxWidth, height: boxHeight * 0.5, opacity: 1, display: 'block' } 
        : { width: boxWidth * 0.5, height: boxHeight, opacity: 1, display: 'block' });

  return (
    <motion.div 
      className="detail-overlay"
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
        className="detail-backdrop"
      />

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
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="detail-modal"
      >
        
        {/* Pulsante di chiusura generale */}
        <AnimatePresence>
          {!isFullscreen && (
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="detail-close-btn"
            >
              <X size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* --- COLONNA MEDIA (Assoluta) --- */}
        <div 
          className="detail-content-canvas"
          style={{ width: boxWidth, height: boxHeight }}
        >
          {/* --- COLONNA MEDIA --- */}
          <motion.div 
            animate={mediaStyle}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="detail-media-container"
            style={{ position: 'relative' }}
          >
            <motion.img
              layoutId={`cover-${game.id}`}
              src={game.coverUrl}
              alt={game.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

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
              transition={{ opacity: { duration: 0.5, ease: "easeInOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }} 
              className="absolute inset-0 w-full h-full object-cover z-10 scale-[1.01]"
            />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="detail-media-btn"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            <AnimatePresence>
              {!isFullscreen && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="detail-media-overlay" 
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* --- COLONNA TESTO --- */}
          <motion.div 
            animate={textStyle}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="detail-info-container custom-scrollbar"
            style={{ position: 'relative' }}
          >
            <div className="detail-info-inner">
              <div className="detail-header">
                <div className="detail-logo-box">
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
                <h2 className="detail-title">
                  {game.title}
                </h2>
              </div>
              
              <div className="detail-meta">
                <div className="detail-rating-badge">
                  <span className="font-bold">{game.rating}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
                <span className="detail-year-badge">
                  {game.year || '2023'}
                </span>
              </div>

              <div className="detail-tags">
                {game.tags.map((tag, i) => (
                  <span key={i} className="detail-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="detail-description">
                {game.description}
              </div>
              
              <div className="detail-cta-container">
                {game.steamUrl ? (
                  <a 
                    href={game.steamUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="detail-cta"
                  >
                    Gioca Ora
                  </a>
                ) : (
                  <button className="detail-cta">
                    Gioca Ora
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </motion.div>
  );
};
