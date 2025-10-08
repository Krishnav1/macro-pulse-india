import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  CashProvisionalData, 
  FIICashData, 
  FIIFOIndicesData, 
  FIIFOStocksData,
  DIICashData,
  DIIFOIndicesData,
  DIIFOStocksData,
  ViewType 
} from '@/types/fii-dii';

interface UseFIIDIIDataOptions {
  view?: ViewType;
  financialYear?: string;
  month?: string;
  quarter?: string;
  startDate?: string;
  endDate?: string;
}

// =====================================================
// Hook 1: Cash Provisional Data
// =====================================================
export function useCashProvisionalData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<CashProvisionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('fii_dii_cash_provisional')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as CashProvisionalData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching cash provisional data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 2: FII Cash Data
// =====================================================
export function useFIICashData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<FIICashData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('fii_cash_data')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as FIICashData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching FII cash data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 3: FII F&O Indices Data
// =====================================================
export function useFIIFOIndicesData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<FIIFOIndicesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('fii_fo_indices_data')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as FIIFOIndicesData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching FII F&O indices data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 4: FII F&O Stocks Data
// =====================================================
export function useFIIFOStocksData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<FIIFOStocksData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('fii_fo_stocks_data')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as FIIFOStocksData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching FII F&O stocks data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 5: DII Cash Data
// =====================================================
export function useDIICashData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<DIICashData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('dii_cash_data')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as DIICashData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching DII cash data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 6: DII F&O Indices Data
// =====================================================
export function useDIIFOIndicesData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<DIIFOIndicesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('dii_fo_indices_data')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as DIIFOIndicesData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching DII F&O indices data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 7: DII F&O Stocks Data
// =====================================================
export function useDIIFOStocksData(options: UseFIIDIIDataOptions = {}) {
  const [data, setData] = useState<DIIFOStocksData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [options.view, options.financialYear, options.month, options.quarter, options.startDate, options.endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('dii_fo_stocks_data')
        .select('*')
        .order('date', { ascending: true });

      if (options.financialYear) {
        query = query.eq('financial_year', options.financialYear);
      }

      if (options.quarter) {
        query = query.eq('quarter', options.quarter);
      }

      if (options.month) {
        query = query.eq('month_name', options.month);
      }

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data: result, error: dbError } = await query;

      if (dbError) throw dbError;
      setData((result || []) as DIIFOStocksData[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching DII F&O stocks data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// =====================================================
// Hook 8: Get Available Financial Years
// =====================================================
export function useFIIDIIFinancialYears() {
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('fii_dii_cash_provisional')
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

// =====================================================
// Hook 9: Get Available Months for FY
// =====================================================
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
        .from('fii_dii_cash_provisional')
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

      // Remove duplicates
      const uniqueMonths = monthsData.filter((month, index, self) =>
        index === self.findIndex(m => m.label === month.label)
      );

      setMonths(uniqueMonths);
    } catch (err) {
      console.error('Error fetching months:', err);
    } finally {
      setLoading(false);
    }
  };

  return { months, loading };
}

// =====================================================
// Hook 10: Get Available Quarters for FY
// =====================================================
export function useFIIDIIQuarters(financialYear?: string) {
  const [quarters, setQuarters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (financialYear) {
      fetchQuarters();
    }
  }, [financialYear]);

  const fetchQuarters = async () => {
    try {
      let query = (supabase as any)
        .from('fii_dii_cash_provisional')
        .select('quarter')
        .order('quarter', { ascending: true });

      if (financialYear) {
        query = query.eq('financial_year', financialYear);
      }

      const { data, error } = await query;

      if (error) throw error;

      const uniqueQuarters = [...new Set((data as any[])?.map(d => d.quarter) || [])];
      setQuarters(uniqueQuarters as string[]);
    } catch (err) {
      console.error('Error fetching quarters:', err);
    } finally {
      setLoading(false);
    }
  };

  return { quarters, loading };
}
