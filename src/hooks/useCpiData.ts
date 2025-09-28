import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CpiDataPoint {
  date: string;
  inflation_yoy: number;
  index_value?: string;
}

export const useCpiData = () => {
  const [data, setData] = useState<CpiDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCpiData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: cpiData, error: cpiError } = await supabase
          .from('cpi_series' as any)
          .select('date, inflation_yoy, index_value')
          .eq('geography', 'combined')
          .eq('series_code', 'headline')
          .order('date', { ascending: true });

        if (cpiError) {
          throw cpiError;
        }

        // Process data to calculate inflation where missing
        const processedData: CpiDataPoint[] = [];
        const rawData = (cpiData as any[]) || [];
        
        for (let i = 0; i < rawData.length; i++) {
          const current = rawData[i];
          let inflationYoy: number;
          
          if (current.inflation_yoy !== null) {
            // Use existing inflation_yoy value
            inflationYoy = parseFloat(current.inflation_yoy);
          } else if (current.index_value && i >= 12) {
            // Calculate YoY inflation from index values (12 months back)
            const yearAgo = rawData[i - 12];
            if (yearAgo && yearAgo.index_value) {
              const currentIndex = parseFloat(current.index_value);
              const yearAgoIndex = parseFloat(yearAgo.index_value);
              inflationYoy = ((currentIndex - yearAgoIndex) / yearAgoIndex) * 100;
            } else {
              continue; // Skip if can't calculate
            }
          } else {
            continue; // Skip if no data to work with
          }
          
          processedData.push({
            date: current.date,
            inflation_yoy: inflationYoy,
            index_value: current.index_value
          });
        }

        setData(processedData);
      } catch (err) {
        console.error('Error fetching CPI data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch CPI data');
      } finally {
        setLoading(false);
      }
    };

    fetchCpiData();
  }, []);

  return { data, loading, error };
};
