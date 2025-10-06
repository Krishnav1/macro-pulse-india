import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeRate {
  period_date: string;
  value: number;
}

export const useUsdConversion = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('indicator_series')
        .select('period_date, value')
        .eq('indicator_slug', 'inr_exchange_rate')
        .eq('component', 'USD')
        .order('period_date', { ascending: true });

      if (fetchError) {
        console.error('Error fetching exchange rates:', fetchError);
        throw fetchError;
      }

      setExchangeRates(data || []);
    } catch (err) {
      console.error('Error in useUsdConversion:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get exchange rate for a specific date using smart matching
   * 1. Exact date match
   * 2. Same month/year
   * 3. Closest date overall
   */
  const getExchangeRate = useMemo(() => {
    return (targetDate: string): number | null => {
      if (!exchangeRates.length) return null;

      const target = new Date(targetDate);
      const targetYear = target.getFullYear();
      const targetMonth = target.getMonth();

      // 1. Try exact date match
      const exactMatch = exchangeRates.find(rate => rate.period_date === targetDate);
      if (exactMatch) return exactMatch.value;

      // 2. Try same month/year
      const sameMonthYear = exchangeRates.find(rate => {
        const rateDate = new Date(rate.period_date);
        return rateDate.getFullYear() === targetYear && rateDate.getMonth() === targetMonth;
      });
      if (sameMonthYear) return sameMonthYear.value;

      // 3. Find closest date overall
      const targetTime = target.getTime();
      let closestRate = exchangeRates[0];
      let minDiff = Math.abs(new Date(exchangeRates[0].period_date).getTime() - targetTime);

      for (const rate of exchangeRates) {
        const diff = Math.abs(new Date(rate.period_date).getTime() - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestRate = rate;
        }
      }

      return closestRate.value;
    };
  }, [exchangeRates]);

  /**
   * Convert INR value to USD
   * @param inrValue - Value in INR crores
   * @param date - Date for exchange rate lookup
   * @param format - Output format: 'trillion' or 'billion'
   * @returns Converted value in USD
   */
  const convertToUsd = (
    inrValue: number,
    date: string,
    format: 'trillion' | 'billion' = 'trillion'
  ): number | null => {
    const rate = getExchangeRate(date);
    if (!rate) return null;

    // Convert INR crores to USD
    // 1 crore = 10 million INR
    // USD value = (INR crores * 10,000,000) / exchange_rate
    const usdValue = (inrValue * 10000000) / rate;

    if (format === 'trillion') {
      // Convert to trillions
      return usdValue / 1000000000000;
    } else {
      // Convert to billions
      return usdValue / 1000000000;
    }
  };

  /**
   * Format value for display based on currency
   * @param value - Numeric value
   * @param currency - 'inr' or 'usd'
   * @param date - Date for USD conversion (required if currency is 'usd')
   * @returns Formatted string
   */
  const formatValue = (
    value: number,
    currency: 'inr' | 'usd',
    date?: string
  ): string => {
    if (currency === 'inr') {
      // INR in Lakh Crores (1 Lakh Crore = 100,000 crores)
      const lakhCrores = value / 100000;
      return `₹${lakhCrores.toFixed(2)}`;
    } else {
      // USD in Trillions
      if (!date) return '$0.00';
      const usdValue = convertToUsd(value, date, 'trillion');
      if (usdValue === null) return '$0.00';
      return `$${usdValue.toFixed(2)}`;
    }
  };

  /**
   * Get unit label for display
   * @param currency - 'inr' or 'usd'
   * @returns Unit label string
   */
  const getUnitLabel = (currency: 'inr' | 'usd'): string => {
    return currency === 'inr' ? 'Lakh Crore' : 'Trillion';
  };

  /**
   * Get currency symbol
   * @param currency - 'inr' or 'usd'
   * @returns Currency symbol
   */
  const getCurrencySymbol = (currency: 'inr' | 'usd'): string => {
    return currency === 'inr' ? '₹' : '$';
  };

  return {
    exchangeRates,
    loading,
    error,
    getExchangeRate,
    convertToUsd,
    formatValue,
    getUnitLabel,
    getCurrencySymbol,
    refetch: fetchExchangeRates
  };
};
