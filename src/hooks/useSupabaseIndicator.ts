import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseIndicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "irregular" | null;
}

export const useSupabaseIndicator = (slug: string) => {
  const [indicator, setIndicator] = useState<SupabaseIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicator = async () => {
      try {
        const { data, error } = await supabase
          .from('indicators')
          .select('slug, name, description, definition, category, unit, frequency')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching indicator:', error);
          setError(error.message);
        } else {
          setIndicator(data as unknown as SupabaseIndicator);
        }
      } catch (err) {
        console.error('Error fetching indicator:', err);
        setError('Failed to fetch indicator data');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchIndicator();
    }
  }, [slug]);

  return { indicator, loading, error };
};
