// NSE Data Service - Fetches data from Supabase Edge Function

const EDGE_FUNCTION_URL = 'https://fhcddkfgqhwwfvqymqow.supabase.co/functions/v1/fetch-nse-data';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoY2Rka2ZncWh3d2Z2cXltcW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2OTI4NzMsImV4cCI6MjA0MzI2ODg3M30.4i_9vJi-Qr0wqbhVYhf8SLwUGGPVJXz8_Gv3FqQxz6E';

interface NSEResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class NSEDataService {
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();
  private static CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Fetch data from NSE via Edge Function
   */
  private static async fetchFromNSE(endpoint: string, params?: Record<string, string>): Promise<any> {
    const cacheKey = `${endpoint}-${JSON.stringify(params || {})}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`Using cached data for ${endpoint}`);
      return cached.data;
    }

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ endpoint, params }),
      });

      const result: NSEResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch NSE data');
      }

      // Cache the result
      this.cache.set(cacheKey, { data: result.data, timestamp: Date.now() });

      return result.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all market indices
   */
  static async getAllIndices() {
    return this.fetchFromNSE('allIndices');
  }

  /**
   * Get index constituents (stocks in an index)
   */
  static async getIndexConstituents(indexSymbol: string) {
    return this.fetchFromNSE('equity-stockIndices', { index: indexSymbol });
  }

  /**
   * Get stock quote
   */
  static async getStockQuote(symbol: string) {
    return this.fetchFromNSE('quote-equity', { symbol });
  }

  /**
   * Get top gainers
   */
  static async getGainers() {
    return this.fetchFromNSE('live-analysis-variations', { index: 'gainers' });
  }

  /**
   * Get top losers
   */
  static async getLosers() {
    return this.fetchFromNSE('live-analysis-variations', { index: 'losers' });
  }

  /**
   * Get most active stocks by volume
   */
  static async getMostActive() {
    return this.fetchFromNSE('live-analysis-volume-gainers');
  }

  /**
   * Get bulk deals for a date range
   */
  static async getBulkDeals(fromDate: string, toDate: string) {
    return this.fetchFromNSE('historical/bulk-deals', { from: fromDate, to: toDate });
  }

  /**
   * Get block deals for a date range
   */
  static async getBlockDeals(fromDate: string, toDate: string) {
    return this.fetchFromNSE('historical/block-deals', { from: fromDate, to: toDate });
  }

  /**
   * Get FII/DII activity
   */
  static async getFIIDIIActivity() {
    return this.fetchFromNSE('fiidiiTradeReact');
  }

  /**
   * Get 52-week high stocks
   */
  static async get52WeekHigh() {
    return this.fetchFromNSE('live-analysis-variations', { index: '52wHigh' });
  }

  /**
   * Get 52-week low stocks
   */
  static async get52WeekLow() {
    return this.fetchFromNSE('live-analysis-variations', { index: '52wLow' });
  }

  /**
   * Get pre-open market data
   */
  static async getPreOpenMarket() {
    return this.fetchFromNSE('market-data-pre-open', { key: 'ALL' });
  }

  /**
   * Clear cache (useful for manual refresh)
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Format date for NSE API (DD-MM-YYYY)
   */
  static formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Get today's date in NSE format
   */
  static getTodayDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * Get date N days ago in NSE format
   */
  static getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date);
  }
}
