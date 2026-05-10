import React from 'react';
import Layout from './components/layout/Layout';
import { useGames } from './hooks/useGames';
import { GameCardSkeleton } from './components/ui/GameCardSkeleton';

function App() {
  const { data: games, isLoading, error } = useGames();

  return (
    <Layout>
      <div className="w-full">
        {error && (
          <div className="p-4 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg">
            Errore durante il caricamento dei giochi: {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Array of 12 items to match our 12 fake games */}
            {Array.from({ length: 12 }).map((_, index) => (
              <GameCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold mb-6">La tua Libreria ({games.length} Titoli)</h2>
            <ul className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
              {games.map(game => (
                <li key={game.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{game.title}</span>
                    <div className="flex gap-2">
                      {game.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
