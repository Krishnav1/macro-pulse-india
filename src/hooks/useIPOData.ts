// Custom hook for fetching IPO data with filters

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IPOListing, IPOFilters } from '@/types/ipo';

export function useIPOData(filters: IPOFilters) {
  const [data, setData] = useState<IPOListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIPOData();
  }, [filters.ipoType, filters.year, filters.sector]);

  const fetchIPOData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from('ipo_listings')
        .select('*')
        .order('listing_date', { ascending: false });

      // Apply IPO type filter
      if (filters.ipoType !== 'all') {
        query = query.eq('ipo_type', filters.ipoType);
      }

      // Apply year filter
      if (filters.year !== 'all') {
        query = query.eq('year', filters.year);
      }

      // Apply sector filter
      if (filters.sector) {
        query = query.eq('sector', filters.sector);
      }

      const { data: ipoData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setData(ipoData || []);
    } catch (err: any) {
      console.error('Error fetching IPO data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchIPOData };
}

// Hook to fetch available years
export function useIPOYears() {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('ipo_listings')
        .select('year')
        .order('year', { ascending: false });

      if (error) throw error;

      // Get unique years
      const uniqueYears = [...new Set(data?.map((item: any) => item.year) || [])] as number[];
      setYears(uniqueYears);
    } catch (err) {
      console.error('Error fetching years:', err);
    } finally {
      setLoading(false);
    }
  };

  return { years, loading };
}

// Hook to fetch available sectors
export function useIPOSectors() {
  const [sectors, setSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('ipo_listings')
        .select('sector')
        .not('sector', 'is', null)
        .order('sector');

      if (error) throw error;

      // Get unique sectors
      const uniqueSectors = [...new Set(data?.map(item => item.sector) || [])].filter(Boolean) as string[];
      setSectors(uniqueSectors);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    } finally {
      setLoading(false);
    }
  };

  return { sectors, loading };
}

// Hook to fetch available main industries
export function useIPOMainIndustries() {
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('ipo_listings')
        .select('main_industry')
        .not('main_industry', 'is', null)
        .order('main_industry');

      if (error) throw error;

      // Get unique industries
      const uniqueIndustries = [...new Set(data?.map(item => item.main_industry) || [])].filter(Boolean) as string[];
      setIndustries(uniqueIndustries);
    } catch (err) {
      console.error('Error fetching industries:', err);
    } finally {
      setLoading(false);
    }
  };

  return { industries, loading };
}
