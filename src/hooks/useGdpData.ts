import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GdpValueData {
  id: number;
  year: string;
  quarter: string;
  pfce_constant_price: number;
  pfce_current_price: number;
  gfce_constant_price: number;
  gfce_current_price: number;
  gfcf_constant_price: number;
  gfcf_current_price: number;
  changes_in_stocks_constant_price: number;
  changes_in_stocks_current_price: number;
  valuables_constant_price: number;
  valuables_current_price: number;
  exports_constant_price: number;
  exports_current_price: number;
  imports_constant_price: number;
  imports_current_price: number;
  discrepancies_constant_price: number;
  discrepancies_current_price: number;
  gdp_constant_price: number;
  gdp_current_price: number;
}

export interface GdpGrowthData {
  id: number;
  year: string;
  quarter: string;
  pfce_constant_price_growth: number;
  pfce_current_price_growth: number;
  gfce_constant_price_growth: number;
  gfce_current_price_growth: number;
  gfcf_constant_price_growth: number;
  gfcf_current_price_growth: number;
  changes_in_stocks_constant_price_growth: number;
  changes_in_stocks_current_price_growth: number;
  valuables_constant_price_growth: number;
  valuables_current_price_growth: number;
  exports_constant_price_growth: number;
  exports_current_price_growth: number;
  imports_constant_price_growth: number;
  imports_current_price_growth: number;
  discrepancies_constant_price_growth: number;
  discrepancies_current_price_growth: number;
  gdp_constant_price_growth: number;
  gdp_current_price_growth: number;
}

export type DataType = 'value' | 'growth';
export type PriceType = 'constant' | 'current';
export type CurrencyType = 'inr' | 'usd';

export const useGdpData = (
  dataType: DataType,
  priceType: PriceType,
  currency: CurrencyType,
  timeframe: string = 'all',
  selectedFY: string | null = null
) => {
  const [valueData, setValueData] = useState<GdpValueData[]>([]);
  const [growthData, setGrowthData] = useState<GdpGrowthData[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableFYs, setAvailableFYs] = useState<string[]>([]);

  useEffect(() => {
    fetchGdpData();
    fetchAvailableFYs();
  }, [dataType, priceType, currency, timeframe, selectedFY]);

  const fetchAvailableFYs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('gdp_value')
        .select('year')
        .order('year', { ascending: false });

      if (error) throw error;

      const uniqueFYs = [...new Set(data?.map((item: any) => item.year) || [])] as string[];
      setAvailableFYs(uniqueFYs);
    } catch (error) {
      console.error('Error fetching available FYs:', error);
    }
  };

  const fetchGdpData = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from(dataType === 'value' ? 'gdp_value' : 'gdp_growth')
        .select('*');

      // Filter by FY if selected
      if (selectedFY) {
        query = query.eq('year', selectedFY);
      }

      // Apply timeframe filter for non-FY views
      if (!selectedFY && timeframe !== 'all') {
        const currentYear = new Date().getFullYear();
        let startYear = currentYear;
        
        switch (timeframe) {
          case '1Y':
            startYear = currentYear - 1;
            break;
          case '5Y':
            startYear = currentYear - 5;
            break;
          case '10Y':
            startYear = currentYear - 10;
            break;
        }
        
        query = query.gte('year', `${startYear}-${(startYear + 1).toString().slice(-2)}`);
      }

      query = query.order('year', { ascending: true }).order('quarter', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      if (dataType === 'value') {
        setValueData((data || []) as GdpValueData[]);
      } else {
        setGrowthData((data || []) as GdpGrowthData[]);
      }
    } catch (error) {
      console.error('Error fetching GDP data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert INR to USD (current rate as requested)
  const convertToUsd = (inrValue: number): number => {
    const usdRate = 86.69; // 1 USD = 86.69 INR
    return inrValue / usdRate;
  };

  // Get processed data based on currency
  const getProcessedData = () => {
    const data = dataType === 'value' ? valueData : growthData;
    
    if (currency === 'usd' && dataType === 'value') {
      // Convert INR crores to USD billions for value data
      return data.map(item => ({
        ...item,
        gdp_constant_price: convertToUsd(item.gdp_constant_price),
        gdp_current_price: convertToUsd(item.gdp_current_price),
        pfce_constant_price: convertToUsd(item.pfce_constant_price),
        pfce_current_price: convertToUsd(item.pfce_current_price),
        gfce_constant_price: convertToUsd(item.gfce_constant_price),
        gfce_current_price: convertToUsd(item.gfce_current_price),
        gfcf_constant_price: convertToUsd(item.gfcf_constant_price),
        gfcf_current_price: convertToUsd(item.gfcf_current_price),
        changes_in_stocks_constant_price: convertToUsd(item.changes_in_stocks_constant_price),
        changes_in_stocks_current_price: convertToUsd(item.changes_in_stocks_current_price),
        valuables_constant_price: convertToUsd(item.valuables_constant_price),
        valuables_current_price: convertToUsd(item.valuables_current_price),
        exports_constant_price: convertToUsd(item.exports_constant_price),
        exports_current_price: convertToUsd(item.exports_current_price),
        imports_constant_price: convertToUsd(item.imports_constant_price),
        imports_current_price: convertToUsd(item.imports_current_price),
        discrepancies_constant_price: convertToUsd(item.discrepancies_constant_price),
        discrepancies_current_price: convertToUsd(item.discrepancies_current_price),
      }));
    }
    
    return data;
  };

  return {
    data: getProcessedData(),
    loading,
    availableFYs,
    refetch: fetchGdpData
  };
};
