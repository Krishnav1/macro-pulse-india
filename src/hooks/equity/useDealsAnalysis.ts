// Comprehensive hook for bulk & block deals analysis

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange, TimePeriodType, getSectorForStock } from '@/utils/financialYearUtils';

export interface Deal {
  id: number;
  date: string;
  symbol: string;
  stock_name: string;
  client_name: string;
  deal_type: 'buy' | 'sell';
  quantity: number;
  price: number; // avg_price for bulk, trade_price for block
  exchange: string;
  value: number; // calculated: quantity * price
  sector: string; // derived from symbol
}

export interface KPIData {
  totalBuying: number;
  totalSelling: number;
  netFlow: number;
  totalDeals: number;
  buyDeals: number;
  sellDeals: number;
  mostActiveStock: {
    symbol: string;
    stock_name: string;
    dealCount: number;
    totalValue: number;
  } | null;
}

export interface SectorData {
  sector: string;
  buyValue: number;
  sellValue: number;
  netFlow: number;
  dealCount: number;
  percentage: number;
}

export interface StockData {
  symbol: string;
  stock_name: string;
  sector: string;
  buyValue: number;
  sellValue: number;
  netFlow: number;
  dealCount: number;
  buyDeals: number;
  sellDeals: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  topBuyers: string[];
  topSellers: string[];
}

export interface InvestorData {
  client_name: string;
  totalValue: number;
  buyValue: number;
  sellValue: number;
  netFlow: number;
  dealCount: number;
  buyDeals: number;
  sellDeals: number;
  stocksTraded: number;
  preferredSectors: string[];
  avgDealSize: number;
  investorType: 'FII' | 'DII' | 'HNI' | 'Others';
}

export interface TrendData {
  date: string;
  buyValue: number;
  sellValue: number;
  netFlow: number;
  dealCount: number;
}

export interface RepeatActivity {
  investor: string;
  stock: string;
  dealCount: number;
  totalValue: number;
  dealType: 'buy' | 'sell';
  avgPrice: number;
  dates: string[];
}

export interface PriceImpact {
  symbol: string;
  stock_name: string;
  dealDate: string;
  dealType: 'buy' | 'sell';
  dealValue: number;
  priceChange7d: number; // Would need stock price data
  priceChange30d: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface UseDealsAnalysisResult {
  // Data
  bulkDeals: Deal[];
  blockDeals: Deal[];
  allDeals: Deal[];
  
  // KPIs
  kpiData: KPIData;
  
  // Analysis
  sectorData: SectorData[];
  stockData: StockData[];
  investorData: InvestorData[];
  trendData: TrendData[];
  repeatActivity: RepeatActivity[];
  
  // State
  loading: boolean;
  error: string | null;
  
  // Methods
  refreshData: () => void;
}

// Classify investor type based on name
function classifyInvestor(clientName: string): 'FII' | 'DII' | 'HNI' | 'Others' {
  const name = clientName.toLowerCase();
  
  // FII patterns
  if (name.includes('morgan') || name.includes('goldman') || name.includes('blackrock') || 
      name.includes('vanguard') || name.includes('fidelity') || name.includes('capital') ||
      name.includes('international') || name.includes('global') || name.includes('offshore')) {
    return 'FII';
  }
  
  // DII patterns
  if (name.includes('mutual fund') || name.includes('insurance') || name.includes('lic') ||
      name.includes('sbi') || name.includes('hdfc') || name.includes('icici') ||
      name.includes('aditya birla') || name.includes('reliance') || name.includes('nippon')) {
    return 'DII';
  }
  
  // HNI patterns (usually individual names or family offices)
  if (name.includes('family') || name.includes('trust') || name.includes('holdings') ||
      name.includes('investments') || name.includes('enterprises')) {
    return 'HNI';
  }
  
  return 'Others';
}

export function useDealsAnalysis(
  dateRange: DateRange,
  dealType: 'all' | 'bulk' | 'block' = 'all'
): UseDealsAnalysisResult {
  const [bulkDeals, setBulkDeals] = useState<Deal[]>([]);
  const [blockDeals, setBlockDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bulk deals
      const { data: bulkData, error: bulkError } = await supabase
        .from('bulk_deals')
        .select('*')
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false });

      if (bulkError) throw bulkError;

      // Fetch block deals
      const { data: blockData, error: blockError } = await supabase
        .from('block_deals')
        .select('*')
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false });

      if (blockError) throw blockError;

      // Transform bulk deals
      const transformedBulkDeals: Deal[] = (bulkData || []).map(deal => ({
        id: deal.id,
        date: deal.date,
        symbol: deal.symbol,
        stock_name: deal.stock_name || deal.symbol,
        client_name: deal.client_name || 'Unknown',
        deal_type: deal.deal_type === 'sell' ? 'sell' : 'buy',
        quantity: deal.quantity || 0,
        price: deal.avg_price || 0,
        exchange: deal.exchange || 'NSE',
        value: (deal.quantity || 0) * (deal.avg_price || 0),
        sector: getSectorForStock(deal.symbol)
      }));

      // Transform block deals
      const transformedBlockDeals: Deal[] = (blockData || []).map(deal => ({
        id: deal.id,
        date: deal.date,
        symbol: deal.symbol,
        stock_name: deal.stock_name || deal.symbol,
        client_name: deal.client_name || 'Unknown',
        deal_type: deal.deal_type === 'sell' ? 'sell' : 'buy',
        quantity: deal.quantity || 0,
        price: deal.trade_price || 0,
        exchange: deal.exchange || 'NSE',
        value: (deal.quantity || 0) * (deal.trade_price || 0),
        sector: getSectorForStock(deal.symbol)
      }));

      setBulkDeals(transformedBulkDeals);
      setBlockDeals(transformedBlockDeals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange.startDate, dateRange.endDate]);

  // Combine deals based on dealType filter
  const allDeals = useMemo(() => {
    switch (dealType) {
      case 'bulk':
        return bulkDeals;
      case 'block':
        return blockDeals;
      case 'all':
      default:
        return [...bulkDeals, ...blockDeals].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }
  }, [bulkDeals, blockDeals, dealType]);

  // Calculate KPI data
  const kpiData = useMemo((): KPIData => {
    const buyDeals = allDeals.filter(d => d.deal_type === 'buy');
    const sellDeals = allDeals.filter(d => d.deal_type === 'sell');
    
    const totalBuying = buyDeals.reduce((sum, d) => sum + d.value, 0);
    const totalSelling = sellDeals.reduce((sum, d) => sum + d.value, 0);
    
    // Find most active stock
    const stockActivity = allDeals.reduce((acc, deal) => {
      if (!acc[deal.symbol]) {
        acc[deal.symbol] = {
          symbol: deal.symbol,
          stock_name: deal.stock_name,
          dealCount: 0,
          totalValue: 0
        };
      }
      acc[deal.symbol].dealCount++;
      acc[deal.symbol].totalValue += deal.value;
      return acc;
    }, {} as Record<string, any>);
    
    const mostActiveStock = Object.values(stockActivity)
      .sort((a: any, b: any) => b.dealCount - a.dealCount)[0] || null;

    return {
      totalBuying,
      totalSelling,
      netFlow: totalBuying - totalSelling,
      totalDeals: allDeals.length,
      buyDeals: buyDeals.length,
      sellDeals: sellDeals.length,
      mostActiveStock
    };
  }, [allDeals]);

  // Calculate sector data
  const sectorData = useMemo((): SectorData[] => {
    const sectorMap = allDeals.reduce((acc, deal) => {
      if (!acc[deal.sector]) {
        acc[deal.sector] = {
          sector: deal.sector,
          buyValue: 0,
          sellValue: 0,
          netFlow: 0,
          dealCount: 0,
          percentage: 0
        };
      }
      
      if (deal.deal_type === 'buy') {
        acc[deal.sector].buyValue += deal.value;
      } else {
        acc[deal.sector].sellValue += deal.value;
      }
      
      acc[deal.sector].dealCount++;
      acc[deal.sector].netFlow = acc[deal.sector].buyValue - acc[deal.sector].sellValue;
      
      return acc;
    }, {} as Record<string, SectorData>);

    const totalValue = Object.values(sectorMap).reduce((sum, s) => sum + s.buyValue + s.sellValue, 0);
    
    return Object.values(sectorMap)
      .map(sector => ({
        ...sector,
        percentage: totalValue > 0 ? ((sector.buyValue + sector.sellValue) / totalValue) * 100 : 0
      }))
      .sort((a, b) => (b.buyValue + b.sellValue) - (a.buyValue + a.sellValue));
  }, [allDeals]);

  // Calculate stock data
  const stockData = useMemo((): StockData[] => {
    const stockMap = allDeals.reduce((acc, deal) => {
      if (!acc[deal.symbol]) {
        acc[deal.symbol] = {
          symbol: deal.symbol,
          stock_name: deal.stock_name,
          sector: deal.sector,
          buyValue: 0,
          sellValue: 0,
          netFlow: 0,
          dealCount: 0,
          buyDeals: 0,
          sellDeals: 0,
          buyPriceSum: 0,
          sellPriceSum: 0,
          avgBuyPrice: 0,
          avgSellPrice: 0,
          buyers: new Set<string>(),
          sellers: new Set<string>(),
          topBuyers: [],
          topSellers: []
        };
      }
      
      const stock = acc[deal.symbol];
      stock.dealCount++;
      
      if (deal.deal_type === 'buy') {
        stock.buyValue += deal.value;
        stock.buyDeals++;
        stock.buyPriceSum += deal.price;
        stock.buyers.add(deal.client_name);
      } else {
        stock.sellValue += deal.value;
        stock.sellDeals++;
        stock.sellPriceSum += deal.price;
        stock.sellers.add(deal.client_name);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(stockMap)
      .map((stock: any) => ({
        symbol: stock.symbol,
        stock_name: stock.stock_name,
        sector: stock.sector,
        buyValue: stock.buyValue,
        sellValue: stock.sellValue,
        netFlow: stock.buyValue - stock.sellValue,
        dealCount: stock.dealCount,
        buyDeals: stock.buyDeals,
        sellDeals: stock.sellDeals,
        avgBuyPrice: stock.buyDeals > 0 ? stock.buyPriceSum / stock.buyDeals : 0,
        avgSellPrice: stock.sellDeals > 0 ? stock.sellPriceSum / stock.sellDeals : 0,
        topBuyers: Array.from(stock.buyers).slice(0, 5),
        topSellers: Array.from(stock.sellers).slice(0, 5)
      }))
      .sort((a, b) => (b.buyValue + b.sellValue) - (a.buyValue + a.sellValue));
  }, [allDeals]);

  // Calculate investor data
  const investorData = useMemo((): InvestorData[] => {
    const investorMap = allDeals.reduce((acc, deal) => {
      if (!acc[deal.client_name]) {
        acc[deal.client_name] = {
          client_name: deal.client_name,
          totalValue: 0,
          buyValue: 0,
          sellValue: 0,
          netFlow: 0,
          dealCount: 0,
          buyDeals: 0,
          sellDeals: 0,
          stocks: new Set<string>(),
          sectors: new Set<string>(),
          stocksTraded: 0,
          preferredSectors: [],
          avgDealSize: 0,
          investorType: classifyInvestor(deal.client_name)
        };
      }
      
      const investor = acc[deal.client_name];
      investor.totalValue += deal.value;
      investor.dealCount++;
      investor.stocks.add(deal.symbol);
      investor.sectors.add(deal.sector);
      
      if (deal.deal_type === 'buy') {
        investor.buyValue += deal.value;
        investor.buyDeals++;
      } else {
        investor.sellValue += deal.value;
        investor.sellDeals++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(investorMap)
      .map((investor: any) => ({
        client_name: investor.client_name,
        totalValue: investor.totalValue,
        buyValue: investor.buyValue,
        sellValue: investor.sellValue,
        netFlow: investor.buyValue - investor.sellValue,
        dealCount: investor.dealCount,
        buyDeals: investor.buyDeals,
        sellDeals: investor.sellDeals,
        stocksTraded: investor.stocks.size,
        preferredSectors: Array.from(investor.sectors).slice(0, 3),
        avgDealSize: investor.dealCount > 0 ? investor.totalValue / investor.dealCount : 0,
        investorType: investor.investorType
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [allDeals]);

  // Calculate trend data (daily aggregation)
  const trendData = useMemo((): TrendData[] => {
    const dateMap = allDeals.reduce((acc, deal) => {
      if (!acc[deal.date]) {
        acc[deal.date] = {
          date: deal.date,
          buyValue: 0,
          sellValue: 0,
          netFlow: 0,
          dealCount: 0
        };
      }
      
      acc[deal.date].dealCount++;
      if (deal.deal_type === 'buy') {
        acc[deal.date].buyValue += deal.value;
      } else {
        acc[deal.date].sellValue += deal.value;
      }
      acc[deal.date].netFlow = acc[deal.date].buyValue - acc[deal.date].sellValue;
      
      return acc;
    }, {} as Record<string, TrendData>);

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [allDeals]);

  // Calculate repeat activity
  const repeatActivity = useMemo((): RepeatActivity[] => {
    const activityMap = allDeals.reduce((acc, deal) => {
      const key = `${deal.client_name}|${deal.symbol}|${deal.deal_type}`;
      
      if (!acc[key]) {
        acc[key] = {
          investor: deal.client_name,
          stock: deal.symbol,
          dealCount: 0,
          totalValue: 0,
          dealType: deal.deal_type,
          priceSum: 0,
          avgPrice: 0,
          dates: []
        };
      }
      
      acc[key].dealCount++;
      acc[key].totalValue += deal.value;
      acc[key].priceSum += deal.price;
      acc[key].dates.push(deal.date);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(activityMap)
      .filter((activity: any) => activity.dealCount >= 2) // Only repeat activities
      .map((activity: any) => ({
        investor: activity.investor,
        stock: activity.stock,
        dealCount: activity.dealCount,
        totalValue: activity.totalValue,
        dealType: activity.dealType,
        avgPrice: activity.priceSum / activity.dealCount,
        dates: activity.dates.sort()
      }))
      .sort((a, b) => b.dealCount - a.dealCount)
      .slice(0, 20); // Top 20
  }, [allDeals]);

  return {
    bulkDeals,
    blockDeals,
    allDeals,
    kpiData,
    sectorData,
    stockData,
    investorData,
    trendData,
    repeatActivity,
    loading,
    error,
    refreshData: fetchData
  };
}
