// Hook to fetch market indices

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MarketIndex } from '@/types/equity-markets.types';

interface UseMarketIndicesResult {
  indices: MarketIndex[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMarketIndices(): UseMarketIndicesResult {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get latest indices (most recent timestamp for each symbol)
      const { data, error: dbError } = await (supabase as any)
        .from('market_indices')
        .select('*')
        .order('timestamp', { ascending: false });

      if (dbError) throw dbError;

      // Get unique indices (latest for each symbol)
      const uniqueIndices = data?.reduce((acc: MarketIndex[], curr: MarketIndex) => {
        if (!acc.find(item => item.symbol === curr.symbol)) {
          acc.push(curr);
        }
        return acc;
      }, []) || [];

      setIndices(uniqueIndices);
    } catch (err) {
      console.error('Error fetching indices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch indices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndices();

    // Auto-refresh every 15 minutes during market hours
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;
      const marketOpen = 9 * 60 + 15; // 9:15 AM
      const marketClose = 15 * 60 + 30; // 3:30 PM

      if (currentTime >= marketOpen && currentTime <= marketClose) {
        fetchIndices();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  return { indices, loading, error, refresh: fetchIndices };
}
