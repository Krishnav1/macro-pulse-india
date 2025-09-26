import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndicatorEventData {
  id: number;
  indicator_slug: string;
  date: string;
  title: string | null;
  description: string;
  impact: 'low' | 'medium' | 'high';
  tag: string | null;
  created_at: string;
  updated_at: string;
}

interface UseIndicatorEventsParams {
  indicatorSlug: string;
  startDate?: string;
  endDate?: string;
  impact?: 'low' | 'medium' | 'high';
  tag?: string;
}

export const useIndicatorEvents = (params: UseIndicatorEventsParams) => {
  const [data, setData] = useState<IndicatorEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { indicatorSlug, startDate, endDate, impact, tag } = params;

  useEffect(() => {
    const fetchIndicatorEvents = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('indicator_events')
          .select('*')
          .eq('indicator_slug', indicatorSlug)
          .order('date', { ascending: false });

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }
        if (impact) {
          query = query.eq('impact', impact);
        }
        if (tag) {
          query = query.eq('tag', tag);
        }

        const { data: eventsData, error } = await query;

        if (error) {
          console.error('Error fetching indicator events:', error);
          setError(error.message);
        } else {
          // Transform the data to ensure title and tag are included
          const transformedData = (eventsData || []).map(event => ({
            ...event,
            title: (event as any).title || 'Untitled Event',
            tag: (event as any).tag || null,
            impact: event.impact as 'low' | 'medium' | 'high'
          })) as IndicatorEventData[];
          setData(transformedData);
        }
      } catch (err) {
        console.error('Error fetching indicator events:', err);
        setError('Failed to fetch indicator events data');
      } finally {
        setLoading(false);
      }
    };

    if (indicatorSlug) {
      fetchIndicatorEvents();
    }
  }, [indicatorSlug, startDate, endDate, impact, tag]);

  return { data, loading, error };
};
