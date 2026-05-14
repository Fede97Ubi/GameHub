import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// Spring naturale per l'hover: si "sente" fisico, non meccanico
const SPRING_HOVER = { type: 'spring', stiffness: 350, damping: 28 };

export const GameCard = React.memo(({ game, onSelect }) => {
  const [hovered,      setHovered]      = useState(false);
  const [showVideo,    setShowVideo]    = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const timerRef = useRef(null);

  // ── Hover handlers ──────────────────────────────────────────────────────────
  // useCallback per evitare di ricreare la funzione ad ogni render
  const onEnter = useCallback(() => {
    setHovered(true);
    // Il video si monta dopo 400ms per non sprecare risorse su passaggi veloci
    timerRef.current = setTimeout(() => setShowVideo(true), 400);
  }, []);

  const onLeave = useCallback(() => {
    clearTimeout(timerRef.current);
    setHovered(false);
    setShowVideo(false);       // smonta il <video> → libera risorse
    setVideoPlaying(false);    // resetta il flag per il prossimo hover
  }, []);

  // Cleanup se il componente viene smontato dal virtualizer mentre è in hover
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <motion.div
      // RIMOSSO: initial={{ opacity:0, scale:0.95 }}
      // Motivo: il virtualizer rimonta le card durante lo scroll.
      // L'entrance animation si riattiverebbe su ogni remount → flickering fastidioso.
      //
      // RIMOSSO: zIndex:50 da whileHover
      // Motivo: animare zIndex via Framer forza il browser a rivalutare lo stacking
      // context dell'intera pagina ad ogni frame. Sostituito con CSS :has() sul wrapper.
      whileHover={{ scale: 1.08 }}
      transition={SPRING_HOVER}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => onSelect?.(game)}
      className="card slim"
    >
      <div className="card-media">

        {/* ── Copertina ───────────────────────────────────────────────────── */}
        {/* layoutId: il FLIP di Framer anima questa immagine dalla card    */}
        {/* alla modal quando viene aperto GameDetail                         */}
        <motion.img
          layoutId={`cover-${game.id}`}
          src={game.coverUrl}
          alt={game.title}
          loading="lazy"
          animate={{ opacity: videoPlaying ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="card-img"
        />

        {/* ── Video ───────────────────────────────────────────────────────── */}
        {/* Montato solo dopo il delay. opacity rimane 0 finché non è in play */}
        {/* così non c'è un flash bianco se il video è lento a partire        */}
        {showVideo && (
          <motion.video
            src={game.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0 }}
            animate={{ opacity: videoPlaying ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            onPlaying={() => setVideoPlaying(true)}
            className="card-video"
          />
        )}

        {/* ── Overlay informazioni ────────────────────────────────────────── */}
        {/* Semplice fade: Framer gestisce l'opacity, nessun reflow           */}
        <motion.div
          className="card-overlay"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="card-title truncate">{game.title}</h3>
          <div className="card-tags">
            {game.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
});

GameCard.displayName = 'GameCard';