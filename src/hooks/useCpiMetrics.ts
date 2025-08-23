import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CPIMetrics {
  yoyInflation: number | null;
  lastChange: number | null;
  cpiIndex: number | null;
  momInflation: number | null;
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
}

export const useCpiMetrics = (geography: 'rural' | 'urban' | 'combined' = 'combined') => {
  const [metrics, setMetrics] = useState<CPIMetrics>({
    yoyInflation: null,
    lastChange: null,
    cpiIndex: null,
    momInflation: null,
    lastUpdated: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchCpiMetrics();
  }, [geography]);

  const fetchCpiMetrics = async () => {
    try {
      setMetrics(prev => ({ ...prev, loading: true, error: null }));

      // Get latest CPI data for headline (General Index) from indicator_series
      const { data: latestData, error: latestError } = await supabase
        .from('indicator_series')
        .select('*')
        .eq('indicator_slug', 'cpi-inflation')
        .order('period_date', { ascending: false })
        .limit(2);

      if (latestError) throw latestError;

      if (!latestData || latestData.length === 0) {
        setMetrics(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No CPI data available' 
        }));
        return;
      }

      const latest = latestData[0];
      const previous = latestData[1];

      // Get data from 12 months ago for YoY calculation
      const currentDate = new Date(latest.period_date);
      const yearAgoDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
      const yearAgoDateStr = yearAgoDate.toISOString().split('T')[0];

      const { data: yearAgoData, error: yearAgoError } = await supabase
        .from('indicator_series')
        .select('*')
        .eq('indicator_slug', 'cpi-inflation')
        .eq('period_date', yearAgoDateStr)
        .single();

      // Calculate metrics
      const cpiIndex = latest.value;
      const momInflation = previous ? 
        ((latest.value - previous.value) / previous.value) * 100 : null;
      
      const yoyInflation = yearAgoData && !yearAgoError ? 
        ((latest.value - yearAgoData.value) / yearAgoData.value) * 100 : null;

      const lastChange = previous ? 
        ((latest.value - previous.value) / previous.value) * 100 : null;

      setMetrics({
        yoyInflation: yoyInflation ? parseFloat(yoyInflation.toFixed(2)) : null,
        lastChange: lastChange ? parseFloat(lastChange.toFixed(2)) : null,
        cpiIndex: cpiIndex ? parseFloat(cpiIndex.toFixed(1)) : null,
        momInflation: momInflation ? parseFloat(momInflation.toFixed(2)) : null,
        lastUpdated: latest.period_date,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching CPI metrics:', error);
      setMetrics(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch CPI metrics' 
      }));
    }
  };

  return { ...metrics, refetch: fetchCpiMetrics };
};
