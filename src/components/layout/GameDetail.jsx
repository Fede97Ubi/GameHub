import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

// ─── Spring ───────────────────────────────────────────────────────────────────
const SPRING = {
  type:      'spring',
  stiffness: 280,
  damping:   28,
  mass:      0.9,
};

const FADE = { duration: 0.2 };

// ─── Calcolo dimensioni ────────────────────────────────────────────────────────
// calcNormalSize specchia esattamente il CSS clamp() del modal in JS.
// Serve per dare a Framer i valori iniziali giusti: se initial == animate
// su width/height, Framer non li anima all'apertura.
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

// ─── Componente ───────────────────────────────────────────────────────────────
export const GameDetail = ({ game, onClose }) => {
  const videoRef = useRef(null);

  const [openComplete, setOpenComplete] = useState(false);
  const [videoReady,   setVideoReady]   = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [videoAspect,  setVideoAspect]  = useState(16 / 9);

  const [vp, setVp] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth  : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Resize listener
  useEffect(() => {
    const fn = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  // Escape
  useEffect(() => {
    const fn = (e) => {
      if (e.key !== 'Escape') return;
      if (fullscreen) setFullscreen(false);
      else onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [fullscreen, onClose]);

  // Avvio video dopo apertura + ready
  useEffect(() => {
    if (openComplete && videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [openComplete, videoReady]);

  const handleMetadata = useCallback((e) => {
    const { videoWidth: vw, videoHeight: vh } = e.target;
    if (vw && vh) setVideoAspect(vw / vh);
    setVideoReady(true);
  }, []);

  const handleCanPlay = useCallback(() => setVideoReady(true), []);
  const handlePlaying = useCallback(() => setVideoPlaying(true), []);

  // openComplete si setta solo una volta (alla prima animazione di apertura)
  const openFiredRef = useRef(false);
  const handleAnimComplete = useCallback(() => {
    if (!openFiredRef.current) {
      openFiredRef.current = true;
      setOpenComplete(true);
    }
  }, []);

  if (!game) return null;

  // ── Dimensioni modal ─────────────────────────────────────────────────────────
  //
  // PRINCIPIO:
  // • normalSize specchia il clamp() CSS in JS.
  // • Su apertura: initial.width == animate.width → Framer non anima le dimensioni,
  //   anima solo opacity/scale/y. Zero width/height animation sull'apertura.
  // • Su toggle fullscreen: animate.width/height cambia → Framer li anima con spring.
  //   Il modal è in un overlay fixed, isolato dal resto del layout →
  //   il reflow è contenuto e non coinvolge la pagina.
  const normalSize = useMemo(
    () => calcNormalSize(vp.w, vp.h),
    [vp.w, vp.h]
  );

  const targetSize = fullscreen
    ? calcFullscreenSize(vp.w, vp.h, videoAspect)
    : normalSize;

  return (
    <motion.div
      className="detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0, transition: FADE }}
      transition={FADE}
    >
      {/* Backdrop */}
      <motion.div
        className="detail-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className={`detail-modal ${fullscreen ? 'detail-modal--fs' : ''}`}
        initial={{
          opacity: 0,
          scale:   0.88,
          y:       24,
          width:   normalSize.w,
          height:  normalSize.h,
        }}
        animate={{
          opacity: 1,
          scale:   1,
          y:       0,
          width:   targetSize.w,
          height:  targetSize.h,
        }}
        exit={{
          opacity: 0,
          scale:   0.92,
          y:       16,
          transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
        }}
        transition={SPRING}
        onAnimationComplete={handleAnimComplete}
      >

        {/* Pulsante chiudi — solo fuori fullscreen */}
        <AnimatePresence>
          {!fullscreen && (
            <motion.button
              key="close"
              className="detail-close-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={FADE}
              onClick={onClose}
              aria-label="Chiudi"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Layout interno */}
        <div className="detail-inner">

          {/* ══ COLONNA MEDIA ════════════════════════════════════════════════
              Normale: 50% sinistra. Fullscreen: 100%.
              La colonna testo è in position:absolute sovrapposta da destra.
          ════════════════════════════════════════════════════════════════ */}
          <div className={`detail-media-col ${fullscreen ? 'fullscreen' : ''}`}>

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

            {/* Gradiente rimosso */}

            {/* Pulsante fullscreen */}
            <button
              className="detail-fullscreen-btn"
              onClick={() => setFullscreen(f => !f)}
              aria-label={fullscreen ? 'Esci dal fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

          </div>

          {/* ══ COLONNA TESTO ════════════════════════════════════════════════
              position: absolute, sovrapposta da destra.
              In fullscreen: translateX(100%) la spinge fuori dal modal.
              Puro compositor thread → zero repaint, zero reflow.
          ════════════════════════════════════════════════════════════════ */}
          <motion.div
            className="detail-info-col custom-scrollbar"
            animate={{
              x: fullscreen ? '100%' : '0%',
            }}
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
                  <a
                    href={game.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-cta"
                  >
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