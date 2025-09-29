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
export type PriceType = 'constant'; // Only constant prices
export type CurrencyType = 'inr' | 'usd';
export type ViewType = 'annual' | 'quarterly';

export const useGdpData = (
  dataType: DataType,
  priceType: PriceType,
  currency: CurrencyType,
  viewType: ViewType = 'annual',
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
  }, [dataType, priceType, currency, viewType, timeframe, selectedFY]);

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

  // Get processed data based on currency and view type
  const getProcessedData = () => {
    const data = dataType === 'value' ? valueData : growthData;
    
    if (viewType === 'quarterly') {
      // Return quarterly data as-is (with currency conversion if needed)
      return data.map(item => {
        const processedItem = { ...item };
        
        if (currency === 'usd' && dataType === 'value') {
          // Convert only constant price fields to USD
          processedItem.gdp_constant_price = convertToUsd(item.gdp_constant_price);
          processedItem.pfce_constant_price = convertToUsd(item.pfce_constant_price);
          processedItem.gfce_constant_price = convertToUsd(item.gfce_constant_price);
          processedItem.gfcf_constant_price = convertToUsd(item.gfcf_constant_price);
          processedItem.changes_in_stocks_constant_price = convertToUsd(item.changes_in_stocks_constant_price);
          processedItem.valuables_constant_price = convertToUsd(item.valuables_constant_price);
          processedItem.exports_constant_price = convertToUsd(item.exports_constant_price);
          processedItem.imports_constant_price = convertToUsd(item.imports_constant_price);
          processedItem.discrepancies_constant_price = convertToUsd(item.discrepancies_constant_price);
        }
        
        return processedItem;
      });
    } else {
      // Annual view - aggregate quarterly data by year
      const yearlyData = new Map();
      
      data.forEach(item => {
        const year = item.year;
        
        if (!yearlyData.has(year)) {
          yearlyData.set(year, {
            year,
            quarter: 'Annual',
            gdp_constant_price: 0,
            pfce_constant_price: 0,
            gfce_constant_price: 0,
            gfcf_constant_price: 0,
            changes_in_stocks_constant_price: 0,
            valuables_constant_price: 0,
            exports_constant_price: 0,
            imports_constant_price: 0,
            discrepancies_constant_price: 0,
            // For growth data
            gdp_constant_price_growth: 0,
            pfce_constant_price_growth: 0,
            gfce_constant_price_growth: 0,
            gfcf_constant_price_growth: 0,
            changes_in_stocks_constant_price_growth: 0,
            valuables_constant_price_growth: 0,
            exports_constant_price_growth: 0,
            imports_constant_price_growth: 0,
            discrepancies_constant_price_growth: 0,
            quarterCount: 0
          });
        }
        
        const yearData = yearlyData.get(year);
        
        if (dataType === 'value') {
          // Sum quarterly values for annual total
          yearData.gdp_constant_price += item.gdp_constant_price || 0;
          yearData.pfce_constant_price += item.pfce_constant_price || 0;
          yearData.gfce_constant_price += item.gfce_constant_price || 0;
          yearData.gfcf_constant_price += item.gfcf_constant_price || 0;
          yearData.changes_in_stocks_constant_price += item.changes_in_stocks_constant_price || 0;
          yearData.valuables_constant_price += item.valuables_constant_price || 0;
          yearData.exports_constant_price += item.exports_constant_price || 0;
          yearData.imports_constant_price += item.imports_constant_price || 0;
          yearData.discrepancies_constant_price += item.discrepancies_constant_price || 0;
        } else {
          // Average quarterly growth rates for annual growth
          yearData.gdp_constant_price_growth += item.gdp_constant_price_growth || 0;
          yearData.pfce_constant_price_growth += item.pfce_constant_price_growth || 0;
          yearData.gfce_constant_price_growth += item.gfce_constant_price_growth || 0;
          yearData.gfcf_constant_price_growth += item.gfcf_constant_price_growth || 0;
          yearData.changes_in_stocks_constant_price_growth += item.changes_in_stocks_constant_price_growth || 0;
          yearData.valuables_constant_price_growth += item.valuables_constant_price_growth || 0;
          yearData.exports_constant_price_growth += item.exports_constant_price_growth || 0;
          yearData.imports_constant_price_growth += item.imports_constant_price_growth || 0;
          yearData.discrepancies_constant_price_growth += item.discrepancies_constant_price_growth || 0;
        }
        
        yearData.quarterCount++;
      });
      
      // Convert map to array and calculate averages for growth data
      const annualData = Array.from(yearlyData.values()).map(yearData => {
        if (dataType === 'growth' && yearData.quarterCount > 0) {
          // Average the growth rates
          yearData.gdp_constant_price_growth /= yearData.quarterCount;
          yearData.pfce_constant_price_growth /= yearData.quarterCount;
          yearData.gfce_constant_price_growth /= yearData.quarterCount;
          yearData.gfcf_constant_price_growth /= yearData.quarterCount;
          yearData.changes_in_stocks_constant_price_growth /= yearData.quarterCount;
          yearData.valuables_constant_price_growth /= yearData.quarterCount;
          yearData.exports_constant_price_growth /= yearData.quarterCount;
          yearData.imports_constant_price_growth /= yearData.quarterCount;
          yearData.discrepancies_constant_price_growth /= yearData.quarterCount;
        }
        
        // Apply currency conversion if needed
        if (currency === 'usd' && dataType === 'value') {
          yearData.gdp_constant_price = convertToUsd(yearData.gdp_constant_price);
          yearData.pfce_constant_price = convertToUsd(yearData.pfce_constant_price);
          yearData.gfce_constant_price = convertToUsd(yearData.gfce_constant_price);
          yearData.gfcf_constant_price = convertToUsd(yearData.gfcf_constant_price);
          yearData.changes_in_stocks_constant_price = convertToUsd(yearData.changes_in_stocks_constant_price);
          yearData.valuables_constant_price = convertToUsd(yearData.valuables_constant_price);
          yearData.exports_constant_price = convertToUsd(yearData.exports_constant_price);
          yearData.imports_constant_price = convertToUsd(yearData.imports_constant_price);
          yearData.discrepancies_constant_price = convertToUsd(yearData.discrepancies_constant_price);
        }
        
        return yearData;
      });
      
      // Sort by year
      return annualData.sort((a, b) => a.year.localeCompare(b.year));
    }
  };

  return {
    data: getProcessedData(),
    loading,
    availableFYs,
    refetch: fetchGdpData
  };
};
