import { useState, useEffect } from 'react';
import gamesData from '../data/games.json';

export const useGames = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGames = () => {
      // Simulate network latency of 800ms
      setTimeout(() => {
        if (isMounted) {
          try {
            // In a real app, this would be a fetch() call
            setData(gamesData);
            setIsLoading(false);
          } catch (err) {
            setError(err.message || 'Failed to load games');
            setIsLoading(false);
          }
        }
      }, 800);
    };

    fetchGames();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
};
