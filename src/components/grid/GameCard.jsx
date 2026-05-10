import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const GameCard = React.memo(({ game, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

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
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(game)}
      className="w-full h-full rounded-xl overflow-hidden cursor-pointer relative bg-zinc-900 border border-white/5 shadow-xl origin-center group"
    >
      {/* Immagine di Copertina (Animazione Condivisa) */}
      <motion.img
        layoutId={`cover-${game.id}`}
        src={game.coverUrl}
        alt={game.title}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          showVideo ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Video in Autoplay */}
      {showVideo && (
        <video
          src={game.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay con Informazioni (visibile in hover) */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-white font-bold text-sm lg:text-base truncate drop-shadow-md">{game.title}</h3>
        <div className="flex gap-1 mt-1 flex-wrap">
          {game.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-sm backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

GameCard.displayName = 'GameCard';
