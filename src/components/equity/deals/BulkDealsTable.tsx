// Bulk Deals Table Component

import { useState, useMemo } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { BulkDeal } from '@/types/equity-markets.types';

interface BulkDealsTableProps {
  deals: BulkDeal[];
  loading: boolean;
}

type SortField = 'date' | 'symbol' | 'quantity' | 'avg_price';

export function BulkDealsTable({ deals, loading }: BulkDealsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.stock_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by deal type
    if (dealTypeFilter !== 'all') {
      filtered = filtered.filter(deal => deal.deal_type === dealTypeFilter);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) aVal = sortOrder === 'asc' ? Infinity : -Infinity;
      if (bVal === null || bVal === undefined) bVal = sortOrder === 'asc' ? Infinity : -Infinity;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [deals, sortField, sortOrder, searchTerm, dealTypeFilter]);

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by symbol, stock name, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
          <div className="flex gap-2">
            {(['all', 'buy', 'sell'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDealTypeFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dealTypeFilter === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type === 'all' ? 'All' : type === 'buy' ? 'Buy' : 'Sell'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Date
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
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
                <span className="text-sm font-semibold text-muted-foreground">Client Name</span>
              </th>
              <th className="text-center py-3 px-4">
                <span className="text-sm font-semibold text-muted-foreground">Type</span>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('quantity')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quantity
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort('avg_price')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Avg Price
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <span className="text-sm font-semibold text-muted-foreground">Value (Cr)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDeals.map((deal) => {
              const isBuy = deal.deal_type === 'buy';
              const value = ((deal.quantity || 0) * (deal.avg_price || 0)) / 10000000;
              
              return (
                <tr key={deal.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-sm text-foreground">
                      {new Date(deal.date).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{deal.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {deal.stock_name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-foreground truncate max-w-[200px]">
                      {deal.client_name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isBuy 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isBuy ? 'Buy' : 'Sell'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">
                      {deal.quantity?.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">
                      ₹{deal.avg_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`text-sm font-medium ${isBuy ? 'text-success' : 'text-destructive'}`}>
                      ₹{value.toFixed(2)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAndSortedDeals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No bulk deals found matching your criteria.
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredAndSortedDeals.length}</span> of{' '}
          <span className="font-semibold text-foreground">{deals.length}</span> bulk deals
        </div>
      </div>
    </div>
  );
}
