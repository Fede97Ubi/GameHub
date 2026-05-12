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

  const [isOpeningComplete, setIsOpeningComplete] = useState(false);
  const videoRef = React.useRef(null);

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

  // Gestione Play Video Post-Animazione
  useEffect(() => {
    if (isOpeningComplete && videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay blocked or failed", e));
    }
  }, [isOpeningComplete]);

  if (!game) return null;

  const isMobile = windowSize.w < 640;

  // Calcolo Dimensioni Target
  let targetWidth = windowSize.w * 0.95;
  let targetHeight = windowSize.h * 0.95;
  if (targetWidth / videoAspect > targetHeight) {
    targetWidth = targetHeight * videoAspect;
  } else {
    targetHeight = targetWidth / videoAspect;
  }

  const defaultBoxWidth = isMobile ? windowSize.w - 32 : Math.min(1152, windowSize.w - 64);
  const defaultBoxHeight = isMobile ? windowSize.h - 32 : windowSize.h * 0.8;

  const boxWidth = isFullscreen ? targetWidth : defaultBoxWidth;
  const boxHeight = isFullscreen ? targetHeight : defaultBoxHeight;

  // Transizione Spring: Molto più performante dei tween per il motore di proiezione
  const springConfig = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 };
  const smoothTransition = { duration: 0.4, ease: [0.23, 1, 0.32, 1] };

  const mediaStyle = isFullscreen
    ? { width: '100%', height: '100%' }
    : (isMobile 
        ? { width: '100%', height: '50%' } 
        : { width: '50%', height: '100%' });

  const textStyle = isFullscreen
    ? (isMobile 
        ? { bottom: 0, left: 0, width: '100%', height: '0%', opacity: 0 } 
        : { top: 0, right: 0, width: '0%', height: '100%', opacity: 0 })
    : (isMobile 
        ? { bottom: 0, left: 0, width: '100%', height: '50%', opacity: 1 } 
        : { top: 0, right: 0, width: '50%', height: '100%', opacity: 1 });

  return (
    <motion.div 
      className="detail-overlay"
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
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
          hidden: { opacity: 0, scale: 0.9, y: 20 },
          visible: { opacity: 1, scale: 1, y: 0 }
        }}
        animate={{
          width: boxWidth,
          height: boxHeight,
          borderRadius: isFullscreen ? '16px' : '24px',
        }}
        onAnimationComplete={(definition) => {
          if (definition === 'visible') setIsOpeningComplete(true);
        }}
        transition={springConfig}
        className="detail-modal"
        style={{ willChange: "transform, width, height" }}
      >
        
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

        {/* --- COLONNA MEDIA --- */}
        <motion.div 
          animate={mediaStyle}
          transition={springConfig}
          className="detail-media-container"
        >
          <motion.img
            layoutId={`cover-${game.id}`}
            src={game.coverUrl}
            alt={game.title}
            transition={springConfig}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <motion.video
            ref={videoRef}
            src={game.videoUrl}
            muted
            loop
            playsInline
            onLoadedMetadata={(e) => setVideoAspect(e.target.videoWidth / e.target.videoHeight)}
            onCanPlay={() => setVideoLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: (videoLoaded && isOpeningComplete) ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover z-10 scale-[1.01]"
            style={{ pointerEvents: isOpeningComplete ? 'auto' : 'none' }}
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
          transition={springConfig}
          className="detail-info-container custom-scrollbar"
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

      </motion.div>
    </motion.div>
  );
};
