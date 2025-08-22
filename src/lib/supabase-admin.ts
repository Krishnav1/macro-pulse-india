// Generic data access layer with Supabase first, localStorage fallback
import { supabase } from '@/integrations/supabase/client';

// Generic interfaces
export interface Indicator {
  slug: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular';
  decimals?: number;
  chart_config?: any;
  created_at?: string;
  updated_at?: string;
}

export interface IndicatorSeriesData {
  id?: number;
  indicator_slug: string;
  period_date: string;
  value: number;
  period_label?: string;
  source_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IndicatorEventData {
  id?: number;
  indicator_slug: string;
  date: string;
  description: string;
  impact?: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

export interface IndicatorInsightData {
  id?: number;
  indicator_slug: string;
  content: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IndicatorComparisonData {
  id?: number;
  indicator_slug: string;
  compare_indicator_slug: string;
  display_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface RepoRateData {
  id?: number;
  date: string;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface RepoRateEvent {
  id?: number;
  date: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

export interface RepoRateInsight {
  id?: number;
  content: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RepoRateComparison {
  id?: number;
  indicator_id: string;
  name: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

// Initialize local defaults in localStorage for immediate UX
export const initializeTables = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Initialize localStorage with default data if empty
    if (!localStorage.getItem('repoRateData')) {
      const defaultData = [
        { date: '2025-08-06', rate: 5.50 },
        { date: '2025-06-06', rate: 5.50 },
        { date: '2025-04-09', rate: 6.00 },
        { date: '2025-02-07', rate: 6.20 },
        { date: '2024-12-06', rate: 6.50 }
      ];
      localStorage.setItem('repoRateData', JSON.stringify(defaultData));
    }
    
    if (!localStorage.getItem('repoRateEvents')) {
      const defaultEvents = [
        { date: '2025-02-07', description: 'RBI cuts repo rate by 20 bps amid easing inflation', impact: 'medium' },
        { date: '2024-02-08', description: 'RBI maintains status quo, signals data-dependent approach', impact: 'low' }
      ];
      localStorage.setItem('repoRateEvents', JSON.stringify(defaultEvents));
    }
    
    if (!localStorage.getItem('repoRateInsights')) {
      const defaultInsights = [
        'The repo rate at 5.50% reflects RBI\'s accommodative stance amid controlled inflation expectations.',
        'Current rate is 100 bps below the peak of 6.50% reached in early 2023.',
        'Real interest rates remain positive at approximately 3.95%.'
      ];
      localStorage.setItem('repoRateInsights', JSON.stringify(defaultInsights));
    }
    
    if (!localStorage.getItem('repoRateComparisons')) {
      const defaultComparisons = [
        { indicator_id: 'cpi_inflation', name: 'CPI Inflation', category: 'Inflation' },
        { indicator_id: 'gsec_yield_10y', name: '10-Year G-Sec Yield', category: 'Interest Rate' },
        { indicator_id: 'bank_credit_growth', name: 'Bank Credit Growth', category: 'Financial' }
      ];
      localStorage.setItem('repoRateComparisons', JSON.stringify(defaultComparisons));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to mirror data to localStorage
const mirrorToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to mirror to localStorage:', error);
  }
};

// Helper function to get data from localStorage
const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn('Failed to get from localStorage:', error);
    return null;
  }
};

// Generic CRUD functions for all indicators

// Get all indicators
export const getIndicators = async (): Promise<Indicator[]> => {
  try {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    mirrorToLocalStorage('indicators', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return getFromLocalStorage('indicators') || [];
  }
};

// Get single indicator
export const getIndicator = async (slug: string): Promise<Indicator | null> => {
  try {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    mirrorToLocalStorage(`indicator:${slug}`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching indicator ${slug}:`, error);
    return getFromLocalStorage(`indicator:${slug}`);
  }
};

// Save indicator
export const saveIndicator = async (indicator: Indicator): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('indicators')
      .upsert(indicator);
    
    if (error) throw error;
    
    mirrorToLocalStorage(`indicator:${indicator.slug}`, indicator);
    return { success: true };
  } catch (error) {
    console.error('Error saving indicator:', error);
    mirrorToLocalStorage(`indicator:${indicator.slug}`, indicator);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get indicator series data
export const getIndicatorSeries = async (slug: string): Promise<IndicatorSeriesData[]> => {
  try {
    const { data, error } = await supabase
      .from('indicator_series')
      .select('*')
      .eq('indicator_slug', slug)
      .order('period_date', { ascending: false });
    
    if (error) throw error;
    
    mirrorToLocalStorage(`indicator:${slug}:series`, data);
    return data || [];
  } catch (error) {
    console.error(`Error fetching series for ${slug}:`, error);
    return getFromLocalStorage(`indicator:${slug}:series`) || [];
  }
};

// Save indicator series data (replace all)
export const saveIndicatorSeries = async (slug: string, series: IndicatorSeriesData[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete existing series for this indicator
    const { error: deleteError } = await supabase
      .from('indicator_series')
      .delete()
      .eq('indicator_slug', slug);
    
    if (deleteError) throw deleteError;
    
    // Insert new series data
    if (series.length > 0) {
      const seriesWithSlug = series.map(s => ({ ...s, indicator_slug: slug }));
      const { error: insertError } = await supabase
        .from('indicator_series')
        .insert(seriesWithSlug);
      
      if (insertError) throw insertError;
    }
    
    mirrorToLocalStorage(`indicator:${slug}:series`, series);
    return { success: true };
  } catch (error) {
    console.error(`Error saving series for ${slug}:`, error);
    mirrorToLocalStorage(`indicator:${slug}:series`, series);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get indicator events
export const getIndicatorEvents = async (slug: string): Promise<IndicatorEventData[]> => {
  try {
    const { data, error } = await supabase
      .from('indicator_events')
      .select('*')
      .eq('indicator_slug', slug)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    mirrorToLocalStorage(`indicator:${slug}:events`, data);
    return data || [];
  } catch (error) {
    console.error(`Error fetching events for ${slug}:`, error);
    return getFromLocalStorage(`indicator:${slug}:events`) || [];
  }
};

// Save indicator events (replace all)
export const saveIndicatorEvents = async (slug: string, events: IndicatorEventData[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete existing events for this indicator
    const { error: deleteError } = await supabase
      .from('indicator_events')
      .delete()
      .eq('indicator_slug', slug);
    
    if (deleteError) throw deleteError;
    
    // Insert new events data
    if (events.length > 0) {
      const eventsWithSlug = events.map(e => ({ ...e, indicator_slug: slug }));
      const { error: insertError } = await supabase
        .from('indicator_events')
        .insert(eventsWithSlug);
      
      if (insertError) throw insertError;
    }
    
    mirrorToLocalStorage(`indicator:${slug}:events`, events);
    return { success: true };
  } catch (error) {
    console.error(`Error saving events for ${slug}:`, error);
    mirrorToLocalStorage(`indicator:${slug}:events`, events);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get indicator insights
export const getIndicatorInsights = async (slug: string): Promise<IndicatorInsightData[]> => {
  try {
    const { data, error } = await supabase
      .from('indicator_insights')
      .select('*')
      .eq('indicator_slug', slug)
      .order('order_index');
    
    if (error) throw error;
    
    mirrorToLocalStorage(`indicator:${slug}:insights`, data);
    return data || [];
  } catch (error) {
    console.error(`Error fetching insights for ${slug}:`, error);
    return getFromLocalStorage(`indicator:${slug}:insights`) || [];
  }
};

// Save indicator insights (replace all)
export const saveIndicatorInsights = async (slug: string, insights: IndicatorInsightData[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete existing insights for this indicator
    const { error: deleteError } = await supabase
      .from('indicator_insights')
      .delete()
      .eq('indicator_slug', slug);
    
    if (deleteError) throw deleteError;
    
    // Insert new insights data
    if (insights.length > 0) {
      const insightsWithSlug = insights.map(i => ({ ...i, indicator_slug: slug }));
      const { error: insertError } = await supabase
        .from('indicator_insights')
        .insert(insightsWithSlug);
      
      if (insertError) throw insertError;
    }
    
    mirrorToLocalStorage(`indicator:${slug}:insights`, insights);
    return { success: true };
  } catch (error) {
    console.error(`Error saving insights for ${slug}:`, error);
    mirrorToLocalStorage(`indicator:${slug}:insights`, insights);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get indicator comparisons
export const getIndicatorComparisons = async (slug: string): Promise<IndicatorComparisonData[]> => {
  try {
    const { data, error } = await supabase
      .from('indicator_comparisons')
      .select('*')
      .eq('indicator_slug', slug);
    
    if (error) throw error;
    
    mirrorToLocalStorage(`indicator:${slug}:comparisons`, data);
    return data || [];
  } catch (error) {
    console.error(`Error fetching comparisons for ${slug}:`, error);
    return getFromLocalStorage(`indicator:${slug}:comparisons`) || [];
  }
};

// Save indicator comparisons (replace all)
export const saveIndicatorComparisons = async (slug: string, comparisons: IndicatorComparisonData[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete existing comparisons for this indicator
    const { error: deleteError } = await supabase
      .from('indicator_comparisons')
      .delete()
      .eq('indicator_slug', slug);
    
    if (deleteError) throw deleteError;
    
    // Insert new comparisons data
    if (comparisons.length > 0) {
      const comparisonsWithSlug = comparisons.map(c => ({ ...c, indicator_slug: slug }));
      const { error: insertError } = await supabase
        .from('indicator_comparisons')
        .insert(comparisonsWithSlug);
      
      if (insertError) throw insertError;
    }
    
    mirrorToLocalStorage(`indicator:${slug}:comparisons`, comparisons);
    return { success: true };
  } catch (error) {
    console.error(`Error saving comparisons for ${slug}:`, error);
    mirrorToLocalStorage(`indicator:${slug}:comparisons`, comparisons);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Repo Rate Data Functions (Supabase first, fallback to localStorage)
export const saveRepoRateData = async (data: RepoRateData[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try Supabase: replace-all strategy
    const del = await supabase.from('repo_rate_data').delete().neq('id', -1);
    if (del.error) throw del.error;
    if (data.length) {
      const ins = await supabase.from('repo_rate_data').insert(
        data.map(d => ({ date: d.date, rate: d.rate }))
      );
      if (ins.error) throw ins.error;
    }
    // Mirror to local for fast reads
    persistLocal('repoRateData', data);
    return { success: true };
  } catch (error) {
    console.error('Error saving repo rate data:', error);
    // Fallback to localStorage
    try {
      persistLocal('repoRateData', data);
      return { success: true, error: error instanceof Error ? error.message : 'Unknown error' };
    } catch (e) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

export const getRepoRateData = async (): Promise<RepoRateData[]> => {
  try {
    const { data, error } = await supabase
      .from('repo_rate_data')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    const mapped = (data || []).map(r => ({ id: r.id, date: r.date as string, rate: Number(r.rate), created_at: r.created_at ?? undefined, updated_at: r.updated_at ?? undefined }));
    // Mirror to local
    persistLocal('repoRateData', mapped);
    return mapped;
  } catch (error) {
    console.error('Error fetching repo rate data:', error);
    return readLocal<RepoRateData[]>('repoRateData', []);
  }
};

// Repo Rate Events Functions
export const saveRepoRateEvents = async (events: RepoRateEvent[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const del = await supabase.from('repo_rate_events').delete().neq('id', -1);
    if (del.error) throw del.error;
    if (events.length) {
      const ins = await supabase.from('repo_rate_events').insert(
        events.map(e => ({ date: e.date, description: e.description, impact: e.impact }))
      );
      if (ins.error) throw ins.error;
    }
    mirrorToLocalStorage('repoRateEvents', events);
    return { success: true };
  } catch (error) {
    mirrorToLocalStorage('repoRateEvents', events);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getRepoRateEvents = async (): Promise<RepoRateEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('repo_rate_events')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    mirrorToLocalStorage('repoRateEvents', data);
    return data || [];
  } catch (error) {
    return getFromLocalStorage('repoRateEvents') || [];
  }
};

// Repo Rate Insights Functions
export const saveRepoRateInsights = async (insights: RepoRateInsight[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const del = await supabase.from('repo_rate_insights').delete().neq('id', -1);
    if (del.error) throw del.error;
    if (insights.length) {
      const ins = await supabase.from('repo_rate_insights').insert(
        insights.map(i => ({ ...i, id: undefined }))
      );
      if (ins.error) throw ins.error;
    }
    mirrorToLocalStorage('repoRateInsights', insights);
    return { success: true };
  } catch (error) {
    mirrorToLocalStorage('repoRateInsights', insights);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getRepoRateInsights = async (): Promise<RepoRateInsight[]> => {
  try {
    const { data, error } = await supabase
      .from('repo_rate_insights')
      .select('*')
      .order('order_index');
    if (error) throw error;
    mirrorToLocalStorage('repoRateInsights', data);
    return data || [];
  } catch (error) {
    return getFromLocalStorage('repoRateInsights') || [];
  }
};

// Repo Rate Comparisons Functions
export const saveRepoRateComparisons = async (comparisons: RepoRateComparison[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const del = await supabase.from('repo_rate_comparisons').delete().neq('id', -1);
    if (del.error) throw del.error;
    if (comparisons.length) {
      const ins = await supabase.from('repo_rate_comparisons').insert(
        comparisons.map(c => ({ ...c, id: undefined }))
      );
      if (ins.error) throw ins.error;
    }
    mirrorToLocalStorage('repoRateComparisons', comparisons);
    return { success: true };
  } catch (error) {
    mirrorToLocalStorage('repoRateComparisons', comparisons);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getRepoRateComparisons = async (): Promise<RepoRateComparison[]> => {
  try {
    const { data, error } = await supabase
      .from('repo_rate_comparisons')
      .select('*');
    if (error) throw error;
    mirrorToLocalStorage('repoRateComparisons', data);
    return data || [];
  } catch (error) {
    return getFromLocalStorage('repoRateComparisons') || [];
  }
};
