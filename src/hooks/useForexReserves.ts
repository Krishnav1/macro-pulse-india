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
  selectedFY?: string | null
) => {
  const [data, setData] = useState<ForexReservesData[]>([]);
  const [availableFYs, setAvailableFYs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFYFromDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const getDateRange = (timeframe: string, selectedFY?: string | null) => {
    const now = new Date();
    let startDate: Date;

    if (selectedFY) {
      // Parse FY format like "24-25" to get start and end dates
      const [startYear, endYear] = selectedFY.split('-').map(y => parseInt(`20${y}`));
      startDate = new Date(startYear, 3, 1); // April 1st
      const endDate = new Date(endYear, 2, 31); // March 31st
      return { startDate, endDate };
    }

    switch (timeframe) {
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '5Y':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      case '10Y':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
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

        // First, get available FYs
        const { data: allData, error: fyError } = await supabase
          .from('forex_reserves_weekly')
          .select('week_ended')
          .order('week_ended', { ascending: false });

        if (fyError) throw fyError;

        if (allData) {
          const fys = Array.from(new Set(
            allData.map(item => getFYFromDate(item.week_ended))
          )).sort().reverse();
          setAvailableFYs(fys);
        }

        // Build query
        let query = supabase
          .from('forex_reserves_weekly')
          .select('*')
          .order('week_ended', { ascending: false });

        const dateRange = getDateRange(timeframe, selectedFY);

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

        if (error) throw error;

        setData(forexData || []);
      } catch (err) {
        console.error('Error fetching forex reserves data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unit, timeframe, selectedFY]);

  return {
    data,
    availableFYs,
    loading,
    error
  };
};
