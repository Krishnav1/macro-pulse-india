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

      // Get latest CPI data for headline (General Index) from cpi_series
      const { data: latestData, error: latestError } = await supabase
        .from('cpi_series' as any)
        .select('*')
        .eq('geography', geography)
        .eq('series_code', 'headline')
        .order('date', { ascending: false })
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

      const latest = latestData[0] as any;
      const previous = latestData[1] as any;

      // Get data from 12 months ago for YoY calculation
      const currentDate = new Date(latest.date);
      const yearAgoDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
      const yearAgoDateStr = yearAgoDate.toISOString().split('T')[0];

      const { data: yearAgoData, error: yearAgoError } = await supabase
        .from('cpi_series' as any)
        .select('*')
        .eq('geography', geography)
        .eq('series_code', 'headline')
        .eq('date', yearAgoDateStr)
        .single();

      // Calculate metrics using cpi_series structure
      const cpiIndex = latest.index_value;
      const momInflation = latest.inflation_mom || (previous ? 
        ((latest.index_value - previous.index_value) / previous.index_value) * 100 : null);
      
      const yoyInflation = latest.inflation_yoy || (yearAgoData && !yearAgoError ? 
        ((latest.index_value - (yearAgoData as any).index_value) / (yearAgoData as any).index_value) * 100 : null);

      const lastChange = previous ? 
        ((latest.index_value - previous.index_value) / previous.index_value) * 100 : null;

      setMetrics({
        yoyInflation: yoyInflation ? parseFloat(yoyInflation.toFixed(2)) : null,
        lastChange: lastChange ? parseFloat(lastChange.toFixed(2)) : null,
        cpiIndex: cpiIndex ? parseFloat(cpiIndex.toFixed(1)) : null,
        momInflation: momInflation ? parseFloat(momInflation.toFixed(2)) : null,
        lastUpdated: latest.date,
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
