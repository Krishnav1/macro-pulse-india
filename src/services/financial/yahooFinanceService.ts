// Yahoo Finance Service - Fetches live market data
// Now uses CORS proxy to avoid browser blocking

import { YahooQuote } from '@/types/financial-markets.types';
import { 
  fetchYahooQuoteWithProxy, 
  fetchMultipleQuotesWithProxy,
  isMarketHours as checkMarketHours 
} from './yahooFinanceProxy';

// Sector symbol mapping (NSE symbols)
export const SECTOR_SYMBOLS = {
  it: '^CNXIT',
  bank: '^NSEBANK',
  auto: '^CNXAUTO',
  pharma: '^CNXPHARMA',
  fmcg: '^CNXFMCG',
  metal: '^CNXMETAL',
  energy: '^CNXENERGY',
  realty: '^CNXREALTY',
  financial: '^CNXFINANCE',
  media: '^CNXMEDIA',
  'psu-bank': '^CNXPSUBANK',
} as const;

// Major indices
export const MAJOR_INDICES = {
  nifty50: '^NSEI',
  sensex: '^BSESN',
  niftyBank: '^NSEBANK',
  niftyIT: '^CNXIT',
  niftyNext50: '^NSMIDCP',
  bse500: '^BSESN', // Using SENSEX as proxy
} as const;

// Currency pairs
export const CURRENCY_PAIRS = {
  'USD-INR': 'INR=X',
  'EUR-INR': 'EURINR=X',
  'GBP-INR': 'GBPINR=X',
  'JPY-INR': 'JPYINR=X',
} as const;

// Cache for Yahoo Finance data (15 seconds)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15000; // 15 seconds

/**
 * Check if market is currently open (9:15 AM - 3:30 PM IST, Mon-Fri)
 */
export function isMarketHours(): boolean {
  return checkMarketHours();
}

/**
 * Fetch quote data from Yahoo Finance API
 * Now uses CORS proxy to avoid browser blocking
 */
export async function fetchYahooQuote(symbol: string): Promise<YahooQuote | null> {
  return fetchYahooQuoteWithProxy(symbol);
}

/**
 * Fetch multiple quotes in parallel
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<Map<string, YahooQuote>> {
  return fetchMultipleQuotesWithProxy(symbols);
}

/**
 * Fetch all sector quotes
 */
export async function fetchSectorQuotes(): Promise<Map<string, YahooQuote>> {
  const symbols = Object.values(SECTOR_SYMBOLS);
  return fetchMultipleQuotes(symbols);
}

/**
 * Fetch major indices quotes
 */
export async function fetchIndicesQuotes(): Promise<Map<string, YahooQuote>> {
  const symbols = Object.values(MAJOR_INDICES);
  return fetchMultipleQuotes(symbols);
}

/**
 * Fetch currency quotes
 */
export async function fetchCurrencyQuotes(): Promise<Map<string, YahooQuote>> {
  const symbols = Object.values(CURRENCY_PAIRS);
  return fetchMultipleQuotes(symbols);
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}
