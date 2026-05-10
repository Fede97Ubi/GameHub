import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export const GameDetail = ({ game, onClose }) => {
  // Gestione tasto ESC per chiudere
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 md:p-24">
      {/* Sfondo sfocato. Non animiamo il backdrop blur qui altrimenti potremmo avere glitch con i layout id, 
          usiamo un semplice div assoluto animato in opacità */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
      />

      {/* Contenitore Principale del Dettaglio */}
      <div className="relative z-10 w-full max-w-6xl h-full sm:h-[80vh] flex flex-col sm:flex-row bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Pulsante di chiusura assoluto */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X size={24} />
        </button>

        {/* Colonna Sinistra: L'Immagine "Volante" */}
        <div className="w-full sm:w-1/2 h-1/2 sm:h-full relative overflow-hidden bg-black flex-shrink-0">
          <motion.img
            layoutId={`cover-${game.id}`}
            src={game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          {/* Sfumatura per raccordarsi col lato destro su schermi piccoli */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-zinc-900 via-transparent to-transparent opacity-60" />
        </div>

        {/* Colonna Destra: Dettagli (Entra con Fade-in) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full sm:w-1/2 h-1/2 sm:h-full p-8 sm:p-12 flex flex-col overflow-y-auto custom-scrollbar relative"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 leading-tight">
            {game.title}
          </h2>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
              <span className="font-bold">{game.rating}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
            {/* Dato fittizio per l'anno visto che non è nel json */}
            <span className="text-zinc-400 font-medium border border-zinc-700 px-3 py-1 rounded-full text-sm">
              2023
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {game.tags.map((tag, i) => (
              <span key={i} className="text-sm font-semibold px-3 py-1.5 bg-zinc-800 text-white rounded-lg">
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-zinc-300 leading-relaxed">
              {game.description}
            </p>
            {/* Testo aggiuntivo per riempire la scheda */}
            <p className="text-md text-zinc-400 mt-4 leading-relaxed">
              Esplora paesaggi mozzafiato, affronta nemici letali e scopri segreti celati da tempo in questa avventura che ridefinisce gli standard di eccellenza. La tua libreria ad alte prestazioni rende onore a questo capolavoro.
            </p>
          </div>
          
          <div className="mt-auto pt-8">
            <button className="w-full py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-zinc-200 transition-transform active:scale-95">
              Gioca Ora
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
