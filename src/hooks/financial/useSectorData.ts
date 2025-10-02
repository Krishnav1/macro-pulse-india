// Hook to fetch sector data (combines Supabase + Yahoo Finance)

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectorData, SectorHeatmapData } from '@/types/financial-markets.types';
import { fetchSectorQuotes, SECTOR_SYMBOLS, isMarketHours } from '@/services/financial/yahooFinanceService';

interface UseSectorDataResult {
  sectors: SectorHeatmapData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useSectorData(useLiveData: boolean = true): UseSectorDataResult {
  const [sectors, setSectors] = useState<SectorHeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (useLiveData && isMarketHours()) {
          // Fetch live data from Yahoo Finance
          await fetchLiveData();
        } else {
          // Fetch latest data from Supabase
          await fetchSupabaseData();
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sector data');
      } finally {
        setLoading(false);
      }
    }

    async function fetchLiveData() {
      const quotes = await fetchSectorQuotes();
      
      // Get latest Supabase data for PE/PB ratios
      const { data: dbSectors } = await (supabase as any)
        .from('sector_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(11);

      const sectorMap = new Map(dbSectors?.map((s: any) => [s.sector_slug, s]) || []);

      const sectorData: SectorHeatmapData[] = [];

      for (const [slug, symbol] of Object.entries(SECTOR_SYMBOLS)) {
        const quote = quotes.get(symbol);
        const dbData = sectorMap.get(slug) as any;

        if (quote || dbData) {
          sectorData.push({
            sector_name: dbData?.sector_name || slug.toUpperCase(),
            sector_slug: slug,
            change_percent: quote?.regularMarketChangePercent ?? dbData?.change_percent ?? 0,
            price: quote?.regularMarketPrice ?? dbData?.price ?? 0,
            market_cap: quote?.marketCap ?? dbData?.market_cap ?? 0,
            pe_ratio: dbData?.pe_ratio ?? null,
            pb_ratio: dbData?.pb_ratio ?? null,
          });
        }
      }

      setSectors(sectorData);
    }

    async function fetchSupabaseData() {
      const { data, error: dbError } = await (supabase as any)
        .from('sector_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(11);

      if (dbError) throw dbError;

      const sectorData: SectorHeatmapData[] = (data || []).map((sector: any) => ({
        sector_name: sector.sector_name,
        sector_slug: sector.sector_slug,
        change_percent: sector.change_percent ?? 0,
        price: sector.price ?? 0,
        market_cap: sector.market_cap ?? 0,
        pe_ratio: sector.pe_ratio,
        pb_ratio: sector.pb_ratio,
      }));

      setSectors(sectorData);
    }

    // Initial fetch
    fetchData();

    // Set up polling during market hours
    if (useLiveData && isMarketHours()) {
      intervalId = setInterval(fetchData, 15000); // Refresh every 15 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [useLiveData]);

  return { sectors, loading, error, lastUpdated };
}
