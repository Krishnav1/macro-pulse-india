// Hook to fetch index constituents

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { IndexConstituent, StockPrice } from '@/types/equity-markets.types';

interface UseIndexConstituentsResult {
  constituents: IndexConstituent[];
  stockPrices: StockPrice[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useIndexConstituents(indexSymbol: string): UseIndexConstituentsResult {
  const [constituents, setConstituents] = useState<IndexConstituent[]>([]);
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch constituents
      const { data: constituentData, error: constituentError } = await (supabase as any)
        .from('index_constituents')
        .select('*')
        .eq('index_symbol', indexSymbol);

      if (constituentError) throw constituentError;

      setConstituents(constituentData || []);

      // Fetch latest stock prices for these constituents
      if (constituentData && constituentData.length > 0) {
        const symbols = constituentData.map((c: IndexConstituent) => c.stock_symbol);

        const { data: priceData, error: priceError } = await (supabase as any)
          .from('stock_prices')
          .select('*')
          .in('symbol', symbols)
          .order('timestamp', { ascending: false });

        if (priceError) throw priceError;

        // Get unique prices (latest for each symbol)
        const uniquePrices = priceData?.reduce((acc: StockPrice[], curr: StockPrice) => {
          if (!acc.find(item => item.symbol === curr.symbol)) {
            acc.push(curr);
          }
          return acc;
        }, []) || [];

        setStockPrices(uniquePrices);
      }
    } catch (err) {
      console.error('Error fetching index constituents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (indexSymbol) {
      fetchData();
    }
  }, [indexSymbol]);

  return { constituents, stockPrices, loading, error, refresh: fetchData };
}
