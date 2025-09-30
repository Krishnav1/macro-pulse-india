import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

      const { data, error: fetchError } = await supabase
        .from('heatmap_values')
        .select('*')
        .eq('indicator_id', indicatorId)
        .eq('year_label', yearLabel)
        .order('state_name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const valuesData = data || [];
      setValues(valuesData);

      // Create state-value mapping for easy lookup
      const stateMap: StateValueMap = {};
      valuesData.forEach(item => {
        stateMap[item.state_name] = item.value;
      });
      setStateValueMap(stateMap);

      // Calculate statistics
      const numericValues = valuesData
        .map(item => item.value)
        .filter((val): val is number => val !== null && !isNaN(val));

      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        
        setStats({
          min,
          max,
          mean,
          count: numericValues.length,
        });
      } else {
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
