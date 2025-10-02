// Financial Markets Type Definitions

export interface LiveMarketPrice {
  id: number;
  symbol: string;
  name: string | null;
  price: number | null;
  change: number | null;
  change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
  category: 'index' | 'stock' | 'currency' | 'commodity' | null;
  timestamp: string;
}

export interface SectorData {
  id: number;
  date: string;
  sector_name: string;
  sector_slug: string;
  nse_symbol: string | null;
  bse_symbol: string | null;
  price: number | null;
  change_percent: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  market_cap: number | null;
  updated_at: string;
}

export interface MarketBreadth {
  id: number;
  date: string;
  exchange: 'NSE' | 'BSE';
  advances: number | null;
  declines: number | null;
  unchanged: number | null;
  high_52w: number | null;
  low_52w: number | null;
  above_50dma: number | null;
  above_200dma: number | null;
  total_stocks: number | null;
  updated_at: string;
}

export interface MutualFundAMC {
  id: number;
  amc_code: string;
  amc_name: string;
  total_aum: number | null;
  num_schemes: number | null;
  market_share: number | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MutualFundScheme {
  id: number;
  scheme_code: string;
  amc_id: number;
  scheme_name: string;
  category: string | null;
  sub_category: string | null;
  aum: number | null;
  nav: number | null;
  returns_1y: number | null;
  returns_3y: number | null;
  returns_5y: number | null;
  expense_ratio: number | null;
  fund_manager: string | null;
  risk_grade: string | null;
  created_at: string;
  updated_at: string;
}

export interface FIIDIIFlow {
  id: number;
  date: string;
  fii_equity_buy: number | null;
  fii_equity_sell: number | null;
  fii_equity_net: number | null;
  dii_equity_buy: number | null;
  dii_equity_sell: number | null;
  dii_equity_net: number | null;
  fii_debt_buy: number | null;
  fii_debt_sell: number | null;
  fii_debt_net: number | null;
  updated_at: string;
}

export interface IPOData {
  id: number;
  company_name: string;
  issue_size: string | null;
  price_band: string | null;
  sector: string | null;
  open_date: string | null;
  close_date: string | null;
  listing_date: string | null;
  qib_subscription: number | null;
  nii_subscription: number | null;
  retail_subscription: number | null;
  total_subscription: number | null;
  listing_gain_percent: number | null;
  current_price: number | null;
  status: 'upcoming' | 'open' | 'closed' | 'listed' | null;
  created_at: string;
  updated_at: string;
}

export interface CurrencyRate {
  id: number;
  date: string;
  from_currency: string;
  to_currency: string;
  rate: number | null;
  timestamp: string;
}

export interface FinancialCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  order_index: number | null;
  is_active: boolean;
  created_at: string;
}

export interface DailyMarketData {
  id: number;
  date: string;
  symbol: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  adj_close: number | null;
}

// Yahoo Finance API Response Types
export interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  regularMarketTime?: Date;
}

// Sector Heatmap specific types
export interface SectorHeatmapData {
  sector_name: string;
  sector_slug: string;
  change_percent: number;
  price: number;
  market_cap: number;
  pe_ratio: number | null;
  pb_ratio: number | null;
}

// Helper type for sector color coding
export type SectorColorIntensity = 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';
