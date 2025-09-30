import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeatmapValue {
  id: string;
  indicator_id: string;
  state_name: string;
  year_label: string;
  value: number | null;
  source?: string;
  dataset_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StateValueMap {
  [stateName: string]: number | null;
}

export const useHeatmapValues = (indicatorId?: string, yearLabel?: string) => {
  const [values, setValues] = useState<HeatmapValue[]>([]);
  const [stateValueMap, setStateValueMap] = useState<StateValueMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    mean: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (indicatorId && yearLabel) {
      fetchValues(indicatorId, yearLabel);
    } else {
      setValues([]);
      setStateValueMap({});
      setStats(null);
      setLoading(false);
    }
  }, [indicatorId, yearLabel]);

  const fetchValues = async (indicatorId: string, yearLabel: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('heatmap_values')
        .select('*')
        .eq('indicator_id', indicatorId)
        .eq('year_label', yearLabel)
        .order('state_name', { ascending: true });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        if (fetchError.code === '42P01') {
          throw new Error('Heatmap tables not found. Please set up the database first.');
        } else if (fetchError.code === '42501') {
          throw new Error('Permission denied. Please check database access policies.');
        }
        throw fetchError;
      }

      const valuesData = (data as any) || [];
      console.log('Fetched heatmap values:', valuesData.length, 'records for indicator:', indicatorId, 'year:', yearLabel);
      setValues(valuesData);

      // Create state-value mapping for easy lookup
      const stateMap: StateValueMap = {};
      valuesData.forEach((item: any) => {
        // Convert string values to numbers - handle both string and number types
        let numericValue: number | null = null;
        if (item.value !== null && item.value !== undefined) {
          // If it's already a number, use it directly
          if (typeof item.value === 'number') {
            numericValue = item.value;
          } else {
            // If it's a string, remove commas and parse
            const cleanedValue = String(item.value).replace(/,/g, '');
            const parsed = parseFloat(cleanedValue);
            numericValue = isNaN(parsed) ? null : parsed;
          }
        }
        stateMap[item.state_name] = numericValue;
      });
      console.log('State value map created:', Object.keys(stateMap).length, 'states');
      setStateValueMap(stateMap);

      // Calculate statistics
      const numericValues = valuesData
        .map((item: any) => {
          if (item.value === null || item.value === undefined) return null;
          
          // Handle both number and string types
          if (typeof item.value === 'number') {
            return item.value;
          }
          
          // Clean string values (remove commas) and parse
          const cleanedValue = String(item.value).replace(/,/g, '');
          const parsed = parseFloat(cleanedValue);
          return isNaN(parsed) ? null : parsed;
        })
        .filter((val: any): val is number => val !== null && !isNaN(val) && isFinite(val));

      console.log('Numeric values for stats:', numericValues.length, 'out of', valuesData.length);

      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        
        const statsObj = {
          min,
          max,
          mean,
          count: numericValues.length,
        };
        console.log('Stats calculated:', statsObj);
        setStats(statsObj);
      } else {
        console.log('No valid numeric values found, setting stats to null');
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching heatmap values:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch values');
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    stateValueMap,
    stats,
    loading,
    error,
    refetch: () => indicatorId && yearLabel && fetchValues(indicatorId, yearLabel),
  };
};
