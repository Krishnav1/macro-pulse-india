import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ForexReservesData {
  id: string;
  week_ended: string;
  total_reserves_inr_crore: number;
  total_reserves_usd_mn: number;
  foreign_currency_assets_inr_crore: number;
  foreign_currency_assets_usd_mn: number;
  gold_inr_crore: number;
  gold_usd_mn: number;
  sdrs_inr_crore: number;
  sdrs_usd_mn: number;
  reserve_position_imf_inr_crore: number;
  reserve_position_imf_usd_mn: number;
  source?: string;
  notes?: string;
}

export const useForexReserves = (
  unit: 'usd' | 'inr',
  timeframe: string = 'all',
  selectedYear?: string | null
) => {
  const [data, setData] = useState<ForexReservesData[]>([]);
  const [availableFYs, setAvailableFYs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getYearFromDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getFullYear().toString();
  };

  const getDateRange = (timeframe: string, selectedYear?: string | null) => {
    const now = new Date();
    let startDate: Date;

    if (selectedYear) {
      // Use simple year format like "2024", "2023"
      const year = parseInt(selectedYear);
      startDate = new Date(year, 0, 1); // January 1st
      const endDate = new Date(year, 11, 31); // December 31st
      return { startDate, endDate };
    }

    switch (timeframe) {
      case '1Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '5Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      case '10Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 10);
        break;
      case 'latest':
        // Get only the latest record
        return { limit: 1 };
      case 'recent':
        // Get recent records for insights
        return { limit: 10 };
      default:
        startDate = new Date(2000, 0, 1); // All data from 2000
    }

    return { startDate, endDate: now };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get available FYs from Supabase
        try {
          const { data: allData, error: fyError } = await (supabase as any)
            .from('forex_reserves_weekly')
            .select('week_ended')
            .order('week_ended', { ascending: false });

          if (!fyError && allData) {
            const years = Array.from(new Set(
              allData.map((item: any) => getYearFromDate(item.week_ended))
            )).sort().reverse() as string[];
            setAvailableFYs(years);
          } else {
            setAvailableFYs(['2024', '2023', '2022', '2021', '2020']);
          }
        } catch {
          setAvailableFYs(['2024', '2023', '2022', '2021', '2020']);
        }

        // Build Supabase query
        let query = (supabase as any)
          .from('forex_reserves_weekly')
          .select('*')
          .order('week_ended', { ascending: false });

        const dateRange = getDateRange(timeframe, selectedYear);

        if ('limit' in dateRange) {
          query = query.limit(dateRange.limit);
        } else {
          if (dateRange.startDate) {
            query = query.gte('week_ended', dateRange.startDate.toISOString().split('T')[0]);
          }
          if (dateRange.endDate) {
            query = query.lte('week_ended', dateRange.endDate.toISOString().split('T')[0]);
          }
        }

        const { data: forexData, error } = await query;

        if (error) {
          console.warn('Forex data fetch failed, using empty data:', error);
          setData([]);
        } else {
          setData((forexData || []) as ForexReservesData[]);
        }
      } catch (err) {
        console.error('Error fetching forex reserves data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unit, timeframe, selectedYear]);

  return {
    data,
    availableFYs,
    loading,
    error
  };
};
