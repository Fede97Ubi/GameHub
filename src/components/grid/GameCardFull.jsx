import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const GameCardFull = React.memo(({ game, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
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
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.1)" }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(game)}
      className="card full"
    >
      {/* Contenitore Media */}
      <div className="card-media">
        <motion.img
          layoutId={`cover-${game.id}`}
          src={game.coverUrl}
          alt={game.title}
          loading="lazy"
          animate={{ 
            scale: isHovered ? 1.05 : 1,
            opacity: isVideoPlaying ? 0 : 1 
          }}
          transition={{ duration: 0.5 }}
          className="card-img"
        />
        
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
            className="card-video"
          />
        )}

        {/* Gradiente sfumato verso il basso */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>

      {/* Contenitore Dati (Sempre Visibile) */}
      <div className="card-content">
        <h2 className="card-title">{game.title}</h2>
        <p className="card-description">
          {game.description}
        </p>
        
        <div className="card-footer">
          <div className="card-tags">
            {game.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="rating">
            <span>{game.rating}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="rating-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

GameCardFull.displayName = 'GameCardFull';
