// All Stocks Tab - Shows all stocks in the index

import { useState, useMemo } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { StockPrice } from '@/types/equity-markets.types';

interface AllStocksTabProps {
  stockPrices: StockPrice[];
  loading: boolean;
}

type SortField = 'symbol' | 'ltp' | 'change_percent' | 'volume' | 'delivery_percent';
type SortOrder = 'asc' | 'desc';

export function AllStocksTab({ stockPrices, loading }: AllStocksTabProps) {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stockPrices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) aVal = 0;
      if (bVal === null || bVal === undefined) bVal = 0;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [stockPrices, sortField, sortOrder, searchTerm]);

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="dashboard-card">
        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Symbol
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-semibold text-muted-foreground">Name</span>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('ltp')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  LTP
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('change_percent')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change %
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('volume')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Volume
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('delivery_percent')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Delivery %
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStocks.map((stock) => {
              const isPositive = (stock.change_percent || 0) >= 0;
              return (
                <tr key={stock.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{stock.symbol}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {stock.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-medium text-foreground">
                      ₹{stock.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {isPositive ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-muted-foreground">
                      {stock.volume ? (stock.volume / 1000).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + 'K' : 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-muted-foreground">
                      {stock.delivery_percent?.toFixed(2) || 'N/A'}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedStocks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No stocks found matching your search.
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredAndSortedStocks.length}</span> of{' '}
          <span className="font-semibold text-foreground">{stockPrices.length}</span> stocks
        </div>
      </div>
    </div>
  );
}
