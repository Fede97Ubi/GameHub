import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const GameCardFull = React.memo(({ game, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
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
      className="w-full h-full rounded-2xl overflow-hidden cursor-pointer relative bg-zinc-900 border border-white/10 flex flex-col group"
    >
      {/* Contenitore Media */}
      <div className="relative w-full h-3/4 overflow-hidden">
        <motion.img
          layoutId={`cover-${game.id}`}
          src={game.coverUrl}
          alt={game.title}
          loading="lazy"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            showVideo ? 'opacity-0' : 'opacity-100'
          }`}
        />
        
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

        {/* Gradiente sfumato verso il basso per fondere l'immagine con il testo */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>

      {/* Contenitore Dati (Sempre Visibile) */}
      <div className="absolute bottom-0 inset-x-0 h-1/4 p-6 flex flex-col justify-end bg-zinc-900">
        <h2 className="text-2xl font-bold text-white mb-2">{game.title}</h2>
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {game.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="text-sm font-bold">{game.rating}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

GameCardFull.displayName = 'GameCardFull';
