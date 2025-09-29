import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// GDP Value Data Interface - simplified structure
export interface GdpValueData {
  year: string;
  quarter: string;
  pfce: number;
  gfce: number;
  gfcf: number;
  changes_in_stocks: number;
  valuables: number;
  exports: number;
  imports: number;
  discrepancies: number;
  gdp: number;
}

// GDP Growth Data Interface - simplified structure
export interface GdpGrowthData {
  year: string;
  quarter: string;
  pfce: number;
  gfce: number;
  gfcf: number;
  changes_in_stocks: number;
  valuables: number;
  exports: number;
  imports: number;
  discrepancies: number;
  gdp: number;
}

// Annual GDP Value Data Interface - with both constant and current prices
export interface GdpAnnualValueData {
  year: string;
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

// Annual GDP Growth Data Interface - with both constant and current prices
export interface GdpAnnualGrowthData {
  year: string;
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
export type PriceType = 'constant' | 'current'; // Both constant and current prices
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
  const [annualValueData, setAnnualValueData] = useState<GdpAnnualValueData[]>([]);
  const [annualGrowthData, setAnnualGrowthData] = useState<GdpAnnualGrowthData[]>([]);
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

      // Clean the years and remove duplicates
      const uniqueFYs = [...new Set(data?.map((item: any) => item.year?.trim()) || [])]
        .filter(year => year) // Remove empty/null values
        .sort((a, b) => (b as string).localeCompare(a as string)) as string[]; // Sort newest to oldest
      
      setAvailableFYs(uniqueFYs);
    } catch (error) {
      console.error('Error fetching available FYs:', error);
    }
  };

  const fetchGdpData = async () => {
    setLoading(true);
    try {
      // For quarterly data (only constant prices available)
      if (viewType === 'quarterly' && priceType === 'constant') {
        let query = (supabase as any)
          .from(dataType === 'value' ? 'gdp_value' : 'gdp_growth')
          .select('*');

        // Filter by FY if selected
        if (selectedFY) {
          // Handle both formats: "2023-24" and "2023-24   " (with spaces)
          query = query.or(`year.eq.${selectedFY},year.eq.${selectedFY.padEnd(10)}`);
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
          
          // Handle year filtering with potential spaces
          const startYearStr = `${startYear}-${(startYear + 1).toString().slice(-2)}`;
          query = query.gte('year', startYearStr);
        }

        query = query.order('year', { ascending: false }).order('quarter', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Clean and process the data
        const cleanedData = (data || []).map(item => ({
          ...item,
          year: item.year?.trim(), // Remove any extra spaces
          // Map database fields to simplified interface
          pfce: item.pfce_constant_price || item.pfce || 0,
          gfce: item.gfce_constant_price || item.gfce || 0,
          gfcf: item.gfcf_constant_price || item.gfcf || 0,
          changes_in_stocks: item.changes_in_stocks_constant_price || item.changes_in_stocks || 0,
          valuables: item.valuables_constant_price || item.valuables || 0,
          exports: item.exports_constant_price || item.exports || 0,
          imports: item.imports_constant_price || item.imports || 0,
          discrepancies: item.discrepancies_constant_price || item.discrepancies || 0,
          gdp: item.gdp_constant_price || item.gdp || 0
        }));

        if (dataType === 'value') {
          setValueData(cleanedData as GdpValueData[]);
        } else {
          setGrowthData(cleanedData as GdpGrowthData[]);
        }
      } else {
        // For annual data (both constant and current prices available)
        let query = (supabase as any)
          .from(dataType === 'value' ? 'gdp_annual' : 'gdp_annual_growth')
          .select('*');

        // Apply timeframe filter
        if (timeframe !== 'all') {
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
          
          query = query.gte('year', startYear.toString());
        }

        query = query.order('year', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Clean the data
        const cleanedData = (data || []).map(item => ({
          ...item,
          year: item.year?.trim() // Remove any extra spaces
        }));

        if (dataType === 'value') {
          setAnnualValueData(cleanedData as GdpAnnualValueData[]);
        } else {
          setAnnualGrowthData(cleanedData as GdpAnnualGrowthData[]);
        }
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
    if (viewType === 'quarterly' && priceType === 'constant') {
      // Use quarterly data (only constant prices available)
      const data = dataType === 'value' ? valueData : growthData;
      
      return data.map(item => {
        const processedItem = { ...item };
        
        if (currency === 'usd' && dataType === 'value') {
          // Convert fields to USD
          processedItem.gdp = convertToUsd(item.gdp);
          processedItem.pfce = convertToUsd(item.pfce);
          processedItem.gfce = convertToUsd(item.gfce);
          processedItem.gfcf = convertToUsd(item.gfcf);
          processedItem.changes_in_stocks = convertToUsd(item.changes_in_stocks);
          processedItem.valuables = convertToUsd(item.valuables);
          processedItem.exports = convertToUsd(item.exports);
          processedItem.imports = convertToUsd(item.imports);
          processedItem.discrepancies = convertToUsd(item.discrepancies);
        }
        
        return processedItem;
      });
    } else {
      // Use annual data (both constant and current prices available)
      const data = dataType === 'value' ? annualValueData : annualGrowthData;
      
      return data.map(item => {
        const processedItem: any = {
          year: item.year,
          quarter: 'Annual',
          displayDate: item.year
        };
        
        // Get the correct field suffix based on price type
        const suffix = `_${priceType}_price${dataType === 'growth' ? '_growth' : ''}`;
        
        // Map the fields with proper naming
        processedItem.gdp = item[`gdp${suffix}`];
        processedItem.pfce = item[`pfce${suffix}`];
        processedItem.gfce = item[`gfce${suffix}`];
        processedItem.gfcf = item[`gfcf${suffix}`];
        processedItem.changes_in_stocks = item[`changes_in_stocks${suffix}`];
        processedItem.valuables = item[`valuables${suffix}`];
        processedItem.exports = item[`exports${suffix}`];
        processedItem.imports = item[`imports${suffix}`];
        processedItem.discrepancies = item[`discrepancies${suffix}`];
        
        // Apply currency conversion if needed
        if (currency === 'usd' && dataType === 'value') {
          processedItem.gdp = convertToUsd(processedItem.gdp);
          processedItem.pfce = convertToUsd(processedItem.pfce);
          processedItem.gfce = convertToUsd(processedItem.gfce);
          processedItem.gfcf = convertToUsd(processedItem.gfcf);
          processedItem.changes_in_stocks = convertToUsd(processedItem.changes_in_stocks);
          processedItem.valuables = convertToUsd(processedItem.valuables);
          processedItem.exports = convertToUsd(processedItem.exports);
          processedItem.imports = convertToUsd(processedItem.imports);
          processedItem.discrepancies = convertToUsd(processedItem.discrepancies);
        }
        
        return processedItem;
      });
    }
  };

  return {
    data: getProcessedData(),
    loading,
    availableFYs,
    refetch: fetchGdpData
  };
};
