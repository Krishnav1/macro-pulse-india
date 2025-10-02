// Yahoo Finance Proxy Service - Uses CORS proxy for production
// This solves the CORS issue when calling Yahoo Finance from browser

import { YahooQuote } from '@/types/financial-markets.types';

// Use a CORS proxy for production
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const YAHOO_API_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

interface YahooChartResponse {
  chart: {
    result?: Array<{
      meta: {
        symbol: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
      indicators: {
        quote: Array<{
          volume?: number[];
        }>;
      };
    }>;
    error?: {
      code: string;
      description: string;
    };
  };
}

// Cache for quotes (15 seconds)
const quoteCache = new Map<string, { data: YahooQuote; timestamp: number }>();
const CACHE_DURATION = 15000; // 15 seconds

export async function fetchYahooQuoteWithProxy(symbol: string): Promise<YahooQuote | null> {
  // Check cache first
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const url = `${YAHOO_API_BASE}${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: YahooChartResponse = await response.json();

    if (data.chart.error) {
      console.error(`Yahoo Finance error for ${symbol}:`, data.chart.error);
      return null;
    }

    const result = data.chart.result?.[0];
    if (!result) {
      return null;
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;

    if (!currentPrice || !previousClose) {
      return null;
    }

    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    const quote: YahooQuote = {
      symbol: meta.symbol,
      regularMarketPrice: currentPrice,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketVolume: result.indicators.quote[0]?.volume?.[0],
      regularMarketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : undefined,
    };

    // Cache the result
    quoteCache.set(symbol, { data: quote, timestamp: Date.now() });

    return quote;
  } catch (error) {
    console.error(`Error fetching Yahoo quote for ${symbol}:`, error);
    return null;
  }
}

export async function fetchMultipleQuotesWithProxy(symbols: string[]): Promise<Map<string, YahooQuote>> {
  const results = new Map<string, YahooQuote>();

  // Fetch all quotes in parallel
  const promises = symbols.map(async (symbol) => {
    const quote = await fetchYahooQuoteWithProxy(symbol);
    if (quote) {
      results.set(symbol, quote);
    }
  });

  await Promise.all(promises);

  return results;
}

// Market hours detection (9:15 AM - 3:30 PM IST)
export function isMarketHours(): boolean {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const day = istTime.getDay();

  // Check if it's a weekday (Monday = 1, Friday = 5)
  if (day === 0 || day === 6) {
    return false;
  }

  // Market hours: 9:15 AM to 3:30 PM
  const marketStart = 9 * 60 + 15; // 9:15 AM in minutes
  const marketEnd = 15 * 60 + 30; // 3:30 PM in minutes
  const currentTime = hours * 60 + minutes;

  return currentTime >= marketStart && currentTime <= marketEnd;
}
