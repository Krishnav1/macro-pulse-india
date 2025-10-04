// Equity Markets Type Definitions

export interface MarketIndex {
  id: number;
  symbol: string;
  name: string;
  last_price: number | null;
  change: number | null;
  change_percent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previous_close: number | null;
  year_high: number | null;
  year_low: number | null;
  volume: number | null;
  timestamp: string;
  updated_at: string;
}

export interface IndexConstituent {
  id: number;
  index_symbol: string;
  stock_symbol: string;
  stock_name: string | null;
  weightage: number | null;
  sector: string | null;
  updated_at: string;
}

export interface StockPrice {
  id: number;
  symbol: string;
  name: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  ltp: number | null;
  previous_close: number | null;
  change: number | null;
  change_percent: number | null;
  volume: number | null;
  value: number | null;
  delivery_qty: number | null;
  delivery_percent: number | null;
  vwap: number | null;
  week_52_high: number | null;
  week_52_low: number | null;
  timestamp: string;
  updated_at: string;
}

export interface BulkDeal {
  id: number;
  date: string;
  symbol: string;
  stock_name: string | null;
  client_name: string | null;
  deal_type: string | null;
  quantity: number | null;
  avg_price: number | null;
  exchange: string | null;
  created_at: string;
}

export interface BlockDeal {
  id: number;
  date: string;
  symbol: string;
  stock_name: string | null;
  client_name: string | null;
  quantity: number | null;
  trade_price: number | null;
  exchange: string | null;
  created_at: string;
}

export interface FIIDIIActivity {
  id: number;
  date: string;
  category: 'FII' | 'DII';
  buy_value: number | null;
  sell_value: number | null;
  net_value: number | null;
  created_at: string;
}

export interface MarketBreadthData {
  id: number;
  date: string;
  exchange: 'NSE' | 'BSE';
  advances: number | null;
  declines: number | null;
  unchanged: number | null;
  high_52w: number | null;
  low_52w: number | null;
  total_stocks: number | null;
  timestamp: string;
  updated_at: string;
}

export interface NSESyncLog {
  id: number;
  sync_type: string;
  status: 'success' | 'failed' | 'running';
  records_processed: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// NSE API Response Types
export interface NSEIndexData {
  key: string;
  index: string;
  indexSymbol: string;
  last: number;
  variation: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
  pe: number;
  pb: number;
  div: number;
}

export interface NSEStockData {
  symbol: string;
  identifier: string;
  open: number;
  dayHigh: number;
  dayLow: number;
  lastPrice: number;
  previousClose: number;
  change: number;
  pChange: number;
  totalTradedVolume: number;
  totalTradedValue: number;
  lastUpdateTime: string;
  yearHigh: number;
  yearLow: number;
  perChange365d: number;
  perChange30d: number;
}

export interface NSEBulkDeal {
  symbol: string;
  securityName: string;
  clientName: string;
  buyQty: number;
  buyAvgPrice: number;
  sellQty: number;
  sellAvgPrice: number;
  tradeDate: string;
  exchange: string;
}

export interface NSEBlockDeal {
  symbol: string;
  securityName: string;
  clientName: string;
  dealQty: number;
  dealPrice: number;
  tradeDate: string;
  exchange: string;
}

// UI Component Types
export interface IndexCardData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface StockTableRow {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  value: number;
  deliveryPercent: number;
  week52High: number;
  week52Low: number;
}

export interface DealAnalysis {
  symbol: string;
  stockName: string;
  totalBuyQty: number;
  totalSellQty: number;
  netQty: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  dealCount: number;
}

export interface InvestorActivity {
  investorName: string;
  totalDeals: number;
  buyDeals: number;
  sellDeals: number;
  totalValue: number;
  favoriteStocks: string[];
}

export interface SectorPerformance {
  sector: string;
  stockCount: number;
  avgChange: number;
  gainers: number;
  losers: number;
  totalVolume: number;
  marketCap: number;
}

// Chart Data Types
export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface FIIDIIChartData {
  date: string;
  fii_buy: number;
  fii_sell: number;
  fii_net: number;
  dii_buy: number;
  dii_sell: number;
  dii_net: number;
}

export interface MarketBreadthChartData {
  date: string;
  advances: number;
  declines: number;
  unchanged: number;
  advanceDeclineRatio: number;
}
