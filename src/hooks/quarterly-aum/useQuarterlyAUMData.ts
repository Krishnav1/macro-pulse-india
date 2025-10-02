// =====================================================
// HOOK: USE QUARTERLY AUM DATA
// Fetch and manage quarterly AUM data
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuarterlyAUMData, AUMTrend } from '@/services/quarterly-aum/types';

export function useQuarterlyAUMData() {
  const [data, setData] = useState<QuarterlyAUMData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: aumData, error: aumError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('*')
        .order('quarter_end_date', { ascending: true });

      if (aumError) throw aumError;
      setData(aumData || []);
    } catch (err: any) {
      console.error('Error fetching quarterly AUM data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch: fetchData };
}

export function useAUMTrends(viewMode: 'quarterly' | 'annual' = 'quarterly') {
  const [trends, setTrends] = useState<AUMTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends();
  }, [viewMode]);

  const fetchTrends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('quarter_end_date, quarter_label, fiscal_year, aum_crore, aaum_crore, qoq_change_percent, yoy_change_percent')
        .eq('is_total', true)
        .order('quarter_end_date', { ascending: true });

      if (fetchError) throw fetchError;

      if (viewMode === 'annual') {
        // Aggregate by fiscal year (take Q4 data for each year)
        const annualData = data?.reduce((acc, row) => {
          if (row.quarter_label.startsWith('Q4')) {
            acc.push({
              quarter_end_date: row.quarter_end_date,
              quarter_label: row.fiscal_year || row.quarter_label,
              total_aum_crore: row.aum_crore,
              total_aaum_crore: row.aaum_crore,
              qoq_change_percent: null,
              yoy_change_percent: row.yoy_change_percent
            });
          }
          return acc;
        }, [] as AUMTrend[]);

        setTrends(annualData || []);
      } else {
        // Quarterly data
        const quarterlyData = data?.map(row => ({
          quarter_end_date: row.quarter_end_date,
          quarter_label: row.quarter_label,
          total_aum_crore: row.aum_crore,
          total_aaum_crore: row.aaum_crore,
          qoq_change_percent: row.qoq_change_percent,
          yoy_change_percent: row.yoy_change_percent
        })) || [];

        setTrends(quarterlyData);
      }
    } catch (err: any) {
      console.error('Error fetching AUM trends:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { trends, isLoading, error, refetch: fetchTrends };
}

export function useLatestQuarterData() {
  const [latestQuarter, setLatestQuarter] = useState<string | null>(null);
  const [data, setData] = useState<QuarterlyAUMData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get latest quarter
      const { data: latestData, error: latestError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('quarter_end_date')
        .order('quarter_end_date', { ascending: false })
        .limit(1)
        .single();

      if (latestError) throw latestError;
      
      const latestQuarterDate = latestData.quarter_end_date;
      setLatestQuarter(latestQuarterDate);

      // Get all data for latest quarter
      const { data: quarterData, error: quarterError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('*')
        .eq('quarter_end_date', latestQuarterDate)
        .order('aum_crore', { ascending: false });

      if (quarterError) throw quarterError;
      setData(quarterData || []);
    } catch (err: any) {
      console.error('Error fetching latest quarter data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { latestQuarter, data, isLoading, error, refetch: fetchLatestData };
}
