import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { useGames } from './hooks/useGames';
import { GameCardSkeleton } from './components/ui/GameCardSkeleton';
import { GameGridSmart } from './components/grid/GameGridSmart';
import { GameGridFull } from './components/grid/GameGridFull';

function App() {
  const { data: games, isLoading, error } = useGames();
  
  // Inizializza lo stato leggendo dal localStorage (default 'smart')
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gamehub_viewMode') || 'smart';
    }
    return 'smart';
  });

  // Salva nel localStorage ogni volta che cambia
  useEffect(() => {
    localStorage.setItem('gamehub_viewMode', viewMode);
  }, [viewMode]);

  return (
    <Layout header={<Header viewMode={viewMode} setViewMode={setViewMode} />}>
      <div className="w-full h-full flex flex-col min-h-0 relative">
        {error && (
          <div className="p-4 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg shrink-0 mb-4 z-10">
            Errore durante il caricamento dei giochi: {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-hidden z-10">
            {Array.from({ length: 12 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="flex-1 w-full min-h-0 relative">
            <AnimatePresence mode="wait">
              {viewMode === 'smart' ? (
                <motion.div 
                  key="smart" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <GameGridSmart games={games} />
                </motion.div>
              ) : (
                <motion.div 
                  key="full" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <GameGridFull games={games} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
