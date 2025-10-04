// NSE Data Sync Service - Syncs NSE data to Supabase

import { supabase } from '@/integrations/supabase/client';
import { NSEDataService } from './nseDataService';
import type { NSEIndexData, NSEStockData, NSEBulkDeal, NSEBlockDeal } from '@/types/equity-markets.types';

export class NSESyncService {
  /**
   * Log sync activity
   */
  private static async logSync(
    syncType: string,
    status: 'success' | 'failed' | 'running',
    recordsProcessed: number | null = null,
    errorMessage: string | null = null,
    startedAt: string
  ) {
    try {
      await (supabase as any)
        .from('nse_sync_logs')
        .insert({
          sync_type: syncType,
          status,
          records_processed: recordsProcessed,
          error_message: errorMessage,
          started_at: startedAt,
          completed_at: status !== 'running' ? new Date().toISOString() : null,
        });
    } catch (error) {
      console.error('Error logging sync:', error);
    }
  }

  /**
   * Sync all market indices
   */
  static async syncIndices(): Promise<{ success: boolean; count: number; error?: string }> {
    const startedAt = new Date().toISOString();
    
    try {
      await this.logSync('indices', 'running', null, null, startedAt);

      const data = await NSEDataService.getAllIndices();
      
      if (!data || !data.data) {
        throw new Error('No indices data received');
      }

      const indices = data.data.map((item: NSEIndexData) => ({
        symbol: item.indexSymbol,
        name: item.index,
        last_price: item.last,
        change: item.variation,
        change_percent: item.percentChange,
        open: item.open,
        high: item.high,
        low: item.low,
        previous_close: item.previousClose,
        year_high: item.yearHigh,
        year_low: item.yearLow,
        timestamp: new Date().toISOString(),
      }));

      const { error } = await (supabase as any)
        .from('market_indices')
        .upsert(indices, { 
          onConflict: 'symbol,timestamp',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      await this.logSync('indices', 'success', indices.length, null, startedAt);

      return { success: true, count: indices.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logSync('indices', 'failed', null, errorMsg, startedAt);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Sync index constituents
   */
  static async syncIndexConstituents(indexSymbol: string): Promise<{ success: boolean; count: number; error?: string }> {
    const startedAt = new Date().toISOString();
    
    try {
      await this.logSync(`constituents_${indexSymbol}`, 'running', null, null, startedAt);

      const data = await NSEDataService.getIndexConstituents(indexSymbol);
      
      if (!data || !data.data) {
        throw new Error('No constituents data received');
      }

      const constituents = data.data.map((item: NSEStockData) => ({
        index_symbol: indexSymbol,
        stock_symbol: item.symbol,
        stock_name: item.identifier || item.symbol,
        sector: null, // Will be populated separately
      }));

      // Delete existing constituents for this index
      await (supabase as any)
        .from('index_constituents')
        .delete()
        .eq('index_symbol', indexSymbol);

      // Insert new constituents
      const { error } = await (supabase as any)
        .from('index_constituents')
        .insert(constituents);

      if (error) throw error;

      await this.logSync(`constituents_${indexSymbol}`, 'success', constituents.length, null, startedAt);

      return { success: true, count: constituents.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logSync(`constituents_${indexSymbol}`, 'failed', null, errorMsg, startedAt);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Sync stock prices for multiple symbols
   */
  static async syncStockPrices(symbols: string[]): Promise<{ success: boolean; count: number; error?: string }> {
    const startedAt = new Date().toISOString();
    
    try {
      await this.logSync('stock_prices', 'running', null, null, startedAt);

      const stockPrices = [];

      for (const symbol of symbols) {
        try {
          const data = await NSEDataService.getStockQuote(symbol);
          
          if (data && data.priceInfo) {
            stockPrices.push({
              symbol: data.info?.symbol || symbol,
              name: data.info?.companyName || symbol,
              open: data.priceInfo.open,
              high: data.priceInfo.intraDayHighLow?.max,
              low: data.priceInfo.intraDayHighLow?.min,
              ltp: data.priceInfo.lastPrice,
              previous_close: data.priceInfo.previousClose,
              change: data.priceInfo.change,
              change_percent: data.priceInfo.pChange,
              volume: data.preOpenMarket?.totalTradedVolume,
              value: data.preOpenMarket?.totalTradedValue,
              delivery_qty: data.securityWiseDP?.deliveryQuantity,
              delivery_percent: data.securityWiseDP?.deliveryToTradedQuantity,
              vwap: data.priceInfo.vwap,
              week_52_high: data.priceInfo.weekHighLow?.max,
              week_52_low: data.priceInfo.weekHighLow?.min,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err);
        }
      }

      if (stockPrices.length > 0) {
        const { error } = await (supabase as any)
          .from('stock_prices')
          .upsert(stockPrices, { 
            onConflict: 'symbol,timestamp',
            ignoreDuplicates: false 
          });

        if (error) throw error;
      }

      await this.logSync('stock_prices', 'success', stockPrices.length, null, startedAt);

      return { success: true, count: stockPrices.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logSync('stock_prices', 'failed', null, errorMsg, startedAt);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Sync bulk deals
   */
  static async syncBulkDeals(fromDate: string, toDate: string): Promise<{ success: boolean; count: number; error?: string }> {
    const startedAt = new Date().toISOString();
    
    try {
      await this.logSync('bulk_deals', 'running', null, null, startedAt);

      const data = await NSEDataService.getBulkDeals(fromDate, toDate);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('No bulk deals data received');
      }

      const bulkDeals = data.flatMap((item: NSEBulkDeal) => {
        const deals = [];
        
        if (item.buyQty > 0) {
          deals.push({
            date: item.tradeDate,
            symbol: item.symbol,
            stock_name: item.securityName,
            client_name: item.clientName,
            deal_type: 'buy',
            quantity: item.buyQty,
            avg_price: item.buyAvgPrice,
            exchange: item.exchange || 'NSE',
          });
        }
        
        if (item.sellQty > 0) {
          deals.push({
            date: item.tradeDate,
            symbol: item.symbol,
            stock_name: item.securityName,
            client_name: item.clientName,
            deal_type: 'sell',
            quantity: item.sellQty,
            avg_price: item.sellAvgPrice,
            exchange: item.exchange || 'NSE',
          });
        }
        
        return deals;
      });

      if (bulkDeals.length > 0) {
        const { error } = await (supabase as any)
          .from('bulk_deals')
          .upsert(bulkDeals, { 
            onConflict: 'date,symbol,client_name,deal_type',
            ignoreDuplicates: true 
          });

        if (error) throw error;
      }

      await this.logSync('bulk_deals', 'success', bulkDeals.length, null, startedAt);

      return { success: true, count: bulkDeals.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logSync('bulk_deals', 'failed', null, errorMsg, startedAt);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Sync block deals
   */
  static async syncBlockDeals(fromDate: string, toDate: string): Promise<{ success: boolean; count: number; error?: string }> {
    const startedAt = new Date().toISOString();
    
    try {
      await this.logSync('block_deals', 'running', null, null, startedAt);

      const data = await NSEDataService.getBlockDeals(fromDate, toDate);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('No block deals data received');
      }

      const blockDeals = data.map((item: NSEBlockDeal) => ({
        date: item.tradeDate,
        symbol: item.symbol,
        stock_name: item.securityName,
        client_name: item.clientName,
        quantity: item.dealQty,
        trade_price: item.dealPrice,
        exchange: item.exchange || 'NSE',
      }));

      if (blockDeals.length > 0) {
        const { error } = await (supabase as any)
          .from('block_deals')
          .upsert(blockDeals, { 
            onConflict: 'date,symbol,client_name,quantity',
            ignoreDuplicates: true 
          });

        if (error) throw error;
      }

      await this.logSync('block_deals', 'success', blockDeals.length, null, startedAt);

      return { success: true, count: blockDeals.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logSync('block_deals', 'failed', null, errorMsg, startedAt);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Sync FII/DII activity
   */
  static async syncFIIDII(): Promise<{ success: boolean; count: number; error?: string }> {
    const startedAt = new Date().toISOString();
    
    try {
      await this.logSync('fii_dii', 'running', null, null, startedAt);

      const data = await NSEDataService.getFIIDIIActivity();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('No FII/DII data received');
      }

      const activities = data.map((item: any) => ({
        date: item.date,
        category: item.category,
        buy_value: item.buyValue,
        sell_value: item.sellValue,
        net_value: item.netValue,
      }));

      if (activities.length > 0) {
        const { error } = await (supabase as any)
          .from('fii_dii_activity')
          .upsert(activities, { 
            onConflict: 'date,category',
            ignoreDuplicates: false 
          });

        if (error) throw error;
      }

      await this.logSync('fii_dii', 'success', activities.length, null, startedAt);

      return { success: true, count: activities.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.logSync('fii_dii', 'failed', null, errorMsg, startedAt);
      return { success: false, count: 0, error: errorMsg };
    }
  }

  /**
   * Full sync - all data types
   */
  static async fullSync(): Promise<{ success: boolean; results: any[] }> {
    const results = [];

    // Sync indices
    results.push({ type: 'indices', ...(await this.syncIndices()) });

    // Sync major index constituents
    const majorIndices = ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO'];
    for (const index of majorIndices) {
      results.push({ type: `constituents_${index}`, ...(await this.syncIndexConstituents(index)) });
    }

    // Sync bulk and block deals for today
    const today = NSEDataService.getTodayDate();
    results.push({ type: 'bulk_deals', ...(await this.syncBulkDeals(today, today)) });
    results.push({ type: 'block_deals', ...(await this.syncBlockDeals(today, today)) });

    // Sync FII/DII
    results.push({ type: 'fii_dii', ...(await this.syncFIIDII()) });

    const allSuccess = results.every(r => r.success);

    return { success: allSuccess, results };
  }
}
