import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

// ─── Configurazioni animazione ────────────────────────────────────────────────
// Spring principale: usato per apertura/chiusura del modal e per il toggle fullscreen
const SPRING_MODAL = {
  type:      'spring',
  stiffness: 280,
  damping:   28,
  mass:      0.9,
};

// Spring per il FLIP layoutId dell'immagine (dalla card alla modal)
const SPRING_IMAGE = {
  type:      'spring',
  stiffness: 320,
  damping:   32,
};

// Fade rapido per elementi secondari (close button, overlay)
const FADE_FAST = { duration: 0.2 };

// ─── Varianti del modal ───────────────────────────────────────────────────────
// L'animazione di apertura è scale + opacity partendo dal centro.
// NON animiamo width/height: il modal è già a dimensione finale nel DOM,
// ci limitiamo a "rivelare" la sua presenza tramite transform.
const modalVariants = {
  hidden: {
    opacity: 0,
    scale:   0.88,
    y:       24,
  },
  visible: {
    opacity: 1,
    scale:   1,
    y:       0,
  },
  exit: {
    opacity:    0,
    scale:      0.92,
    y:          16,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

// ─── Varianti backdrop ────────────────────────────────────────────────────────
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

export const GameDetail = ({ game, onClose }) => {
  const videoRef = useRef(null);

  // true quando l'animazione di apertura del modal è completata
  // serve per avviare il video solo a modal stabilizzato
  const [openComplete,  setOpenComplete]  = useState(false);

  // true quando il video ha abbastanza dati per partire
  const [videoReady,    setVideoReady]    = useState(false);

  // true quando il video sta effettivamente riproducendo
  const [videoPlaying,  setVideoPlaying]  = useState(false);

  // modalità fullscreen: nasconde la colonna testo e allarga la colonna media
  const [fullscreen,    setFullscreen]    = useState(false);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (fullscreen) setFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen, onClose]);

  // ── Avvio video post-animazione ─────────────────────────────────────────────
  // Il video parte solo quando ENTRAMBE le condizioni sono vere:
  // 1. L'animazione di apertura è completata (openComplete)
  // 2. Il browser ha caricato abbastanza dati (videoReady)
  useEffect(() => {
    if (openComplete && videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay bloccato dal browser: non è un errore critico
      });
    }
  }, [openComplete, videoReady]);

  const handleVideoCanPlay  = useCallback(() => setVideoReady(true),   []);
  const handleVideoPlaying  = useCallback(() => setVideoPlaying(true),  []);
  const handleOpenComplete  = useCallback((def) => {
    if (def === 'visible') setOpenComplete(true);
  }, []);

  if (!game) return null;

  return (
    <motion.div
      className="detail-overlay"
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <motion.div
        className="detail-backdrop"
        variants={backdropVariants}
        transition={FADE_FAST}
        onClick={onClose}
      />

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {/*
          ARCHITETTURA DIMENSIONI:
          Il modal ha sempre la sua dimensione finale (stabilita dal CSS).
          L'animazione usa solo scale+opacity+y → nessun reflow.
          
          In modalità fullscreen il modal non cambia dimensione:
          è la colonna destra che viene nascosta via clip-path,
          e la colonna sinistra che si allarga via flex.
      */}
      <motion.div
        className="detail-modal"
        variants={modalVariants}
        transition={SPRING_MODAL}
        onAnimationComplete={handleOpenComplete}
      >

        {/* ── Pulsante chiudi (visibile solo fuori fullscreen) ─────────────── */}
        <AnimatePresence>
          {!fullscreen && (
            <motion.button
              key="close"
              className="detail-close-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0, scale: 0.8 }}
              transition={FADE_FAST}
              onClick={onClose}
              aria-label="Chiudi"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Layout interno: flex row (desktop) / flex col (mobile) ──────── */}
        <div className="detail-inner">

          {/* ══ COLONNA SINISTRA — MEDIA ═══════════════════════════════════ */}
          {/*
              In fullscreen: flex-grow:1 (occupa tutto)
              In normale:    flex base 50%
              La transizione è gestita da CSS transition su flex-grow,
              non da Framer → nessun JS sul thread principale durante l'animazione.
          */}
          <motion.div
            className={`detail-media-col ${fullscreen ? 'fullscreen' : ''}`}
          >

            {/* Immagine con FLIP layoutId dalla card */}
            <motion.img
              layoutId={`cover-${game.id}`}
              src={game.coverUrl}
              alt={game.title}
              className="detail-cover-img"
              // Opacità: svanisce quando il video prende il sopravvento
              animate={{ opacity: videoPlaying ? 0 : 1 }}
              transition={{ duration: 0.6 }}
              // Il FLIP usa la sua spring dedicata
              // (Framer usa la transition del layoutId separatamente)
            />

            {/* Video: sempre montato ma invisibile finché non parte */}
            {/* Non usiamo conditional render per evitare rimount al toggle fullscreen */}
            <motion.video
              ref={videoRef}
              src={game.videoUrl}
              muted
              loop
              playsInline
              className="detail-media-video"
              onLoadedMetadata={handleVideoCanPlay}
              onCanPlay={handleVideoCanPlay}
              onPlaying={handleVideoPlaying}
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

          </motion.div>

          {/* ══ COLONNA DESTRA — TESTO ═══════════════════════════════════ */}
          {/*
              ARCHITETTURA VISIBILITÀ:
              La colonna destra NON viene smontata in fullscreen.
              Viene nascosta con clip-path: inset(0 100% 0 0) che taglia
              i pixel dal lato destro senza alterare il layout.
              Il testo non si ricalcola mai: la larghezza del box di testo
              è fissa, definita da min-width nel CSS.
              Scorrere verticalmente rimane possibile in qualsiasi momento.
          */}
          <motion.div
            className="detail-info-col custom-scrollbar"
            animate={{
              clipPath: fullscreen
                ? 'inset(0 100% 0 0)'
                : 'inset(0 0% 0 0)',
              // opacity ridotta come secondo strato di "scomparsa"
              opacity: fullscreen ? 0 : 1,
            }}
            transition={SPRING_MODAL}
          >
            <div className="detail-info-inner">

              {/* Header: logo + titolo */}
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

              {/* Meta: rating + anno */}
              <div className="detail-meta">
                <div className="detail-rating-badge">
                  <span>{game.rating}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="detail-star">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </div>
                <span className="detail-year-badge">{game.year || '2023'}</span>
              </div>

              {/* Tag */}
              <div className="detail-tags">
                {game.tags.map((tag, i) => (
                  <span key={i} className="detail-tag">{tag}</span>
                ))}
              </div>

              {/* Descrizione */}
              <p className="detail-description">{game.description}</p>

              {/* CTA */}
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

        </div>{/* /detail-inner */}
      </motion.div>
    </motion.div>
  );
};