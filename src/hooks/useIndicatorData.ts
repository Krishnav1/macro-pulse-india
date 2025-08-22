import { useState, useEffect } from 'react';
import { 
  getIndicator, 
  getIndicatorSeries, 
  getIndicatorEvents, 
  getIndicatorInsights, 
  getIndicatorComparisons,
  Indicator,
  IndicatorSeriesData,
  IndicatorEventData,
  IndicatorInsightData,
  IndicatorComparisonData
} from '@/lib/supabase-admin';

export interface UseIndicatorDataReturn {
  indicator: Indicator | null;
  series: IndicatorSeriesData[];
  events: IndicatorEventData[];
  insights: IndicatorInsightData[];
  comparisons: IndicatorComparisonData[];
  loading: boolean;
  error: string | null;
}

export const useIndicatorData = (slug: string): UseIndicatorDataReturn => {
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [series, setSeries] = useState<IndicatorSeriesData[]>([]);
  const [events, setEvents] = useState<IndicatorEventData[]>([]);
  const [insights, setInsights] = useState<IndicatorInsightData[]>([]);
  const [comparisons, setComparisons] = useState<IndicatorComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIndicatorData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [
          indicatorData,
          seriesData,
          eventsData,
          insightsData,
          comparisonsData
        ] = await Promise.all([
          getIndicator(slug),
          getIndicatorSeries(slug),
          getIndicatorEvents(slug),
          getIndicatorInsights(slug),
          getIndicatorComparisons(slug)
        ]);

        setIndicator(indicatorData);
        setSeries(seriesData);
        setEvents(eventsData);
        setInsights(insightsData);
        setComparisons(comparisonsData);
      } catch (err) {
        console.error(`Error loading indicator data for ${slug}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load indicator data');
      } finally {
        setLoading(false);
      }
    };

    loadIndicatorData();
  }, [slug]);

  return {
    indicator,
    series,
    events,
    insights,
    comparisons,
    loading,
    error
  };
};
