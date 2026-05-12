import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const GameCard = React.memo(({ game, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Aspetta 400ms prima di mostrare il video
    hoverTimeoutRef.current = setTimeout(() => {
      setShowVideo(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideo(false);
    setIsVideoPlaying(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    // Cleanup del timer se il componente viene smontato
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.10, zIndex: 50 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(game)}
      className="card slim"
    >
      <div className="card-media">
        {/* Immagine di Copertina */}
        <motion.img
          layoutId={`cover-${game.id}`}
          src={game.coverUrl}
          alt={game.title}
          loading="lazy"
          animate={{ opacity: isVideoPlaying ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="card-img"
        />
        
        {/* Video in Autoplay */}
        {showVideo && (
          <motion.video
            src={game.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0 }}
            animate={{ opacity: isVideoPlaying ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            onPlaying={() => setIsVideoPlaying(true)}
            className="card-video scale-[1.001]"
          />
        )}

        {/* Overlay con Informazioni (visibile in hover) */}
        <motion.div 
          className="card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="card-title truncate drop-shadow-md">{game.title}</h3>
          <div className="card-tags">
            {game.tags.slice(0, 5).map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

GameCard.displayName = 'GameCard';
