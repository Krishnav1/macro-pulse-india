// Hook to fetch live market data for header ticker

import { useEffect, useState } from 'react';
import { YahooQuote } from '@/types/financial-markets.types';
import { fetchMultipleQuotes, isMarketHours, MAJOR_INDICES, CURRENCY_PAIRS } from '@/services/financial/yahooFinanceService';

interface UseLiveMarketDataResult {
  indices: Map<string, YahooQuote>;
  currencies: Map<string, YahooQuote>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
}

export function useLiveMarketData(): UseLiveMarketDataResult {
  const [indices, setIndices] = useState<Map<string, YahooQuote>>(new Map());
  const [currencies, setCurrencies] = useState<Map<string, YahooQuote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchData() {
      try {
        setError(null);
        const marketOpen = isMarketHours();
        setIsLive(marketOpen);

        // Fetch key indices
        const indicesSymbols = [
          MAJOR_INDICES.nifty50,
          MAJOR_INDICES.sensex,
          MAJOR_INDICES.niftyBank,
          MAJOR_INDICES.niftyIT,
        ];

        const currencySymbols = [
          CURRENCY_PAIRS['USD-INR'],
          CURRENCY_PAIRS['EUR-INR'],
        ];

        const [indicesData, currenciesData] = await Promise.all([
          fetchMultipleQuotes(indicesSymbols),
          fetchMultipleQuotes(currencySymbols),
        ]);

        setIndices(indicesData);
        setCurrencies(currenciesData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching live market data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch live data');
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchData();

    // Poll every 15 seconds during market hours, every 5 minutes otherwise
    const pollInterval = isMarketHours() ? 15000 : 300000;
    intervalId = setInterval(fetchData, pollInterval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { indices, currencies, loading, error, lastUpdated, isLive };
}
