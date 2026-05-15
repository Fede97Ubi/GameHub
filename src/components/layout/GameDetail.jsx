import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 };
const FADE   = { duration: 0.2 };

function calcNormalSize(vpW, vpH) {
  return {
    w: Math.max(320, Math.min(vpW * 0.92, 1280)),
    h: Math.max(400, Math.min(vpH * 0.85, 860)),
  };
}

function calcFullscreenSize(vpW, vpH, aspect) {
  const maxW = vpW * 0.96;
  const maxH = vpH * 0.96;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) { h = maxH; w = h * aspect; }
  return { w: Math.round(w), h: Math.round(h) };
}

export const GameDetail = ({ game, onClose }) => {
  const videoRef = useRef(null);
  const modalRef = useRef(null);

  const [openComplete, setOpenComplete] = useState(false);
  const [videoReady,   setVideoReady]   = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [muted,        setMuted]        = useState(true);
  const [videoAspect,  setVideoAspect]  = useState(16 / 9);
  const [renderedSize, setRenderedSize] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef(null);

  const [vp, setVp] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth  : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const fn = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key !== 'Escape') return;
      fullscreen ? setFullscreen(false) : onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [fullscreen, onClose]);

  useEffect(() => {
    if (openComplete && videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [openComplete, videoReady]);

  // Gestione timer inattività controlli
  const resetControlsTimer = useCallback(() => {
    if (!fullscreen) {
      setShowControls(true);
      return;
    }
    
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, [fullscreen]);

  useEffect(() => {
    if (fullscreen) {
      resetControlsTimer();
    } else {
      setShowControls(true);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    }
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [fullscreen, resetControlsTimer]);

  const handleMetadata = useCallback((e) => {
    const { videoWidth: vw, videoHeight: vh } = e.target;
    if (vw && vh) setVideoAspect(vw / vh);
    setVideoReady(true);
  }, []);

  const handleCanPlay = useCallback(() => setVideoReady(true), []);
  const handlePlaying = useCallback(() => setVideoPlaying(true), []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const target = muted ? 1 : 0;
    // Ramp volume in 200ms per evitare click audio
    const steps = 10;
    const interval = 200 / steps;
    const delta = (target - v.volume) / steps;
    let step = 0;
    v.muted = false; // serve per poter controllare il volume
    const ramp = setInterval(() => {
      step++;
      v.volume = Math.max(0, Math.min(1, v.volume + delta));
      if (step >= steps) {
        clearInterval(ramp);
        v.volume = target;
        if (target === 0) v.muted = true;
      }
    }, interval);
    setMuted(!muted);
  }, [muted]);

  const openFiredRef = useRef(false);
  const handleAnimComplete = useCallback(() => {
    if (!openFiredRef.current) {
      openFiredRef.current = true;
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        setRenderedSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
      setOpenComplete(true);
    }
  }, []);

  if (!game) return null;

  const calcSize   = calcNormalSize(vp.w, vp.h);
  const normalSize = renderedSize || calcSize;
  const targetSize = fullscreen ? calcFullscreenSize(vp.w, vp.h, videoAspect) : normalSize;

  return (
    <motion.div
      className="detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: FADE }}
      transition={FADE}
    >
      <motion.div className="detail-backdrop" onClick={onClose} />

      <motion.div
        ref={modalRef}
        className="detail-modal"
        initial={{ opacity: 0, scale: 0.88, y: 24, width: calcSize.w, height: calcSize.h }}
        animate={{ opacity: 1, scale: 1, y: 0, width: targetSize.w, height: targetSize.h }}
        exit={{ opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
        transition={SPRING}
        onAnimationComplete={handleAnimComplete}
      >
        <AnimatePresence>
          {!fullscreen && (
            <motion.button
              key="close"
              className="detail-close-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              onClick={onClose}
              aria-label="Chiudi"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="detail-inner">

          <div 
            className={`detail-media-col ${fullscreen ? 'fullscreen' : ''}`}
            onMouseMove={resetControlsTimer}
            style={{ cursor: (fullscreen && !showControls) ? 'none' : 'auto' }}
          >
            <motion.img
              layoutId={`cover-${game.id}`}
              src={game.coverUrl}
              alt={game.title}
              className="detail-cover-img"
              animate={{ opacity: videoPlaying ? 0 : 1 }}
              transition={{ duration: 0.6 }}
            />

            <motion.video
              ref={videoRef}
              src={game.videoUrl}
              muted
              loop
              playsInline
              className="detail-media-video"
              onLoadedMetadata={handleMetadata}
              onCanPlay={handleCanPlay}
              onPlaying={handlePlaying}
              initial={{ opacity: 0 }}
              animate={{ opacity: videoPlaying ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />

            <AnimatePresence>
              {showControls && (
                <>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="detail-fullscreen-btn"
                    onClick={() => setFullscreen(f => !f)}
                    aria-label={fullscreen ? 'Esci dal fullscreen' : 'Fullscreen'}
                  >
                    {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="detail-mute-btn"
                    onClick={toggleMute}
                    aria-label={muted ? 'Attiva audio' : 'Disattiva audio'}
                  >
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="detail-info-col custom-scrollbar"
            animate={{ x: fullscreen ? '100%' : '0%' }}
            transition={SPRING}
          >
            <div className="detail-info-inner">
              <div className="detail-header">
                <div className="detail-logo-box">
                  {game.logoUrl ? (
                    <img
                      src={game.logoUrl}
                      alt=""
                      className="detail-logo-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="detail-logo-placeholder">Logo</span>
                  )}
                </div>
                <h2 className="detail-title">{game.title}</h2>
              </div>

              <div className="detail-meta">
                <div className="detail-rating-badge">
                  <span>{game.rating}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="detail-star">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </div>
                <span className="detail-year-badge">{game.year || '2023'}</span>
              </div>

              <div className="detail-tags">
                {game.tags.map((tag, i) => (
                  <span key={i} className="detail-tag">{tag}</span>
                ))}
              </div>

              <p className="detail-description">{game.description}</p>

              <div className="detail-cta-container">
                {game.steamUrl ? (
                  <a href={game.steamUrl} target="_blank" rel="noopener noreferrer" className="detail-cta">
                    Gioca Ora
                  </a>
                ) : (
                  <button className="detail-cta">Gioca Ora</button>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </motion.div>
  );
};