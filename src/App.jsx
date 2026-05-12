import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { useGames } from './hooks/useGames';
import { GameCardSkeleton } from './components/ui/GameCardSkeleton';
import { GameGridSmart } from './components/grid/GameGridSmart';
import { GameGridFull } from './components/grid/GameGridFull';
import { GameDetail } from './components/layout/GameDetail';

function App() {
  const { data: games, isLoading, error } = useGames();
  const [selectedGame, setSelectedGame] = useState(null);
  
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
      <div className="app-main">
        {error && (
          <div className="alert alert-error">
            Errore durante il caricamento dei giochi: {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-grid">
            {Array.from({ length: 12 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="content-wrapper">
            <AnimatePresence mode="wait">
              {viewMode === 'smart' ? (
                <motion.div 
                  key="smart" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="content-view"
                >
                  <GameGridSmart games={games} onGameSelect={setSelectedGame} />
                </motion.div>
              ) : (
                <motion.div 
                  key="full" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="content-view"
                >
                  <GameGridFull games={games} onGameSelect={setSelectedGame} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {selectedGame && (
            <GameDetail 
              key="detail" 
              game={selectedGame} 
              onClose={() => setSelectedGame(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default App;
