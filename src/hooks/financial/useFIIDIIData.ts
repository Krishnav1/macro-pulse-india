import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyFIIDIIData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  fii_equity: number;
  fii_debt: number;
  fii_derivatives: number;
  fii_total: number;
  dii_equity: number;
  dii_debt: number;
  dii_derivatives: number;
  dii_total: number;
}

export interface DailyFIIDIIData {
  id: string;
  date: string;
  financial_year: string;
  investor_type: 'FII' | 'DII';
  segment: 'Cash' | 'Derivatives';
  asset_class: 'Equity' | 'Debt' | 'Futures' | 'Options';
  gross_purchase: number;
  gross_sales: number;
  net_purchase_sales: number;
}

export interface DerivativesFIIDIIData {
  id: string;
  date: string;
  financial_year: string;
  investor_type: 'FII' | 'DII';
  instrument: 'Futures' | 'Options';
  market_type: 'Indices' | 'Stocks';
  gross_purchase: number;
  gross_sales: number;
  net_purchase_sales: number;
}

interface UseFIIDIIDataOptions {
  view: 'monthly' | 'daily' | 'quarterly';
  financialYear?: string;
  month?: string;
}

export function useFIIDIIData(options: UseFIIDIIDataOptions) {
  const [monthlyData, setMonthlyData] = useState<MonthlyFIIDIIData[]>([]);
  const [dailyData, setDailyData] = useState<DailyFIIDIIData[]>([]);
  const [derivativesData, setDerivativesData] = useState<DerivativesFIIDIIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (options.view === 'monthly') {
        await fetchMonthlyData();
      } else if (options.view === 'daily') {
        await fetchDailyData();
      } else if (options.view === 'quarterly') {
        await fetchQuarterlyData();
      }
    } catch (err) {
      console.error('Error fetching FII/DII data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    let query = (supabase as any)
      .from('fii_dii_monthly_data')
      .select('*')
      .order('date', { ascending: true });

    if (options.financialYear) {
      query = query.eq('financial_year', options.financialYear);
    }

    const { data, error: dbError } = await query;

    if (dbError) throw dbError;
    setMonthlyData((data || []) as MonthlyFIIDIIData[]);
  };

  const fetchDailyData = async () => {
    let query = (supabase as any)
      .from('fii_dii_daily_data')
      .select('*')
      .order('date', { ascending: true });

    if (options.financialYear) {
      query = query.eq('financial_year', options.financialYear);
    }

    if (options.month) {
      const monthDate = new Date(options.month);
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      query = query
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data, error: dbError } = await query;

    if (dbError) throw dbError;
    setDailyData((data || []) as DailyFIIDIIData[]);
  };

  const fetchQuarterlyData = async () => {
    // Quarterly data is aggregated from monthly data
    await fetchMonthlyData();
  };

  const fetchDerivativesData = async (date?: string) => {
    let query = (supabase as any)
      .from('fii_dii_derivatives_data')
      .select('*')
      .order('date', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error: dbError } = await query;

    if (dbError) throw dbError;
    setDerivativesData((data || []) as DerivativesFIIDIIData[]);
  };

  return {
    monthlyData,
    dailyData,
    derivativesData,
    loading,
    error,
    refetch: fetchData,
    fetchDerivativesData,
  };
}

// Hook to get available financial years
export function useFIIDIIFinancialYears() {
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('fii_dii_monthly_data')
        .select('financial_year')
        .order('financial_year', { ascending: false });

      if (error) throw error;

      const uniqueYears = [...new Set((data as any[])?.map(d => d.financial_year) || [])];
      setYears(uniqueYears as string[]);
    } catch (err) {
      console.error('Error fetching financial years:', err);
    } finally {
      setLoading(false);
    }
  };

  return { years, loading };
}

// Hook to get available months for a financial year
export function useFIIDIIMonths(financialYear?: string) {
  const [months, setMonths] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (financialYear) {
      fetchMonths();
    }
  }, [financialYear]);

  const fetchMonths = async () => {
    try {
      let query = (supabase as any)
        .from('fii_dii_monthly_data')
        .select('date, month_name')
        .order('date', { ascending: true });

      if (financialYear) {
        query = query.eq('financial_year', financialYear);
      }

      const { data, error } = await query;

      if (error) throw error;

      const monthsData = (data as any[])?.map(d => ({
        value: d.date,
        label: d.month_name,
      })) || [];

      setMonths(monthsData);
    } catch (err) {
      console.error('Error fetching months:', err);
    } finally {
      setLoading(false);
    }
  };

  return { months, loading };
}
