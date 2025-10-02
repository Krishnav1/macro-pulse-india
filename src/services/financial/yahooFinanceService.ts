// Yahoo Finance Service - Fetches live market data

import { YahooQuote } from '@/types/financial-markets.types';

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
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  
  const day = istTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  
  // Check if weekday (Monday-Friday)
  if (day === 0 || day === 6) return false;
  
  // Check if between 9:15 AM and 3:30 PM IST
  const currentMinutes = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  
  return currentMinutes >= marketOpen && currentMinutes <= marketClose;
}

/**
 * Fetch quote data from Yahoo Finance API
 * Uses yahoo-finance2 library
 */
export async function fetchYahooQuote(symbol: string): Promise<YahooQuote | null> {
  try {
    // Check cache first
    const cached = cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // For now, we'll use a simple fetch approach
    // In production, you'd use yahoo-finance2 npm package
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );

    if (!response.ok) {
      console.error(`Failed to fetch ${symbol}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) return null;

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    const yahooQuote: YahooQuote = {
      symbol: symbol,
      shortName: meta.symbol,
      longName: meta.longName || meta.symbol,
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketChange: meta.regularMarketPrice - meta.previousClose,
      regularMarketChangePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      regularMarketVolume: quote?.volume?.[0],
      marketCap: meta.marketCap,
      regularMarketTime: new Date(meta.regularMarketTime * 1000),
    };

    // Cache the result
    cache.set(symbol, { data: yahooQuote, timestamp: Date.now() });

    return yahooQuote;
  } catch (error) {
    console.error(`Error fetching Yahoo quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch multiple quotes in parallel
 */
export async function fetchMultipleQuotes(symbols: string[]): Promise<Map<string, YahooQuote>> {
  const results = new Map<string, YahooQuote>();

  const promises = symbols.map(async (symbol) => {
    const quote = await fetchYahooQuote(symbol);
    if (quote) {
      results.set(symbol, quote);
    }
  });

  await Promise.all(promises);
  return results;
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
