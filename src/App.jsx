import React from 'react';
import Layout from './components/layout/Layout';
import { useGames } from './hooks/useGames';
import { GameCardSkeleton } from './components/ui/GameCardSkeleton';
import { GameGrid } from './components/grid/GameGrid';

function App() {
  const { data: games, isLoading, error } = useGames();

  return (
    <Layout>
      <div className="w-full h-full flex flex-col min-h-0">
        {error && (
          <div className="p-4 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg shrink-0 mb-4">
            Errore durante il caricamento dei giochi: {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-hidden">
            {/* Array of 12 items to match our 12 fake games */}
            {Array.from({ length: 12 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="flex-1 w-full min-h-0 relative">
            <GameGrid games={games} />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
