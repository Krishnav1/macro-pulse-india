// Block Deals Table Component

import { useState, useMemo } from 'react';
import { ArrowUpDown, Shield } from 'lucide-react';
import type { BlockDeal } from '@/types/equity-markets.types';

interface BlockDealsTableProps {
  deals: BlockDeal[];
  loading: boolean;
}

type SortField = 'date' | 'symbol' | 'quantity' | 'trade_price';

export function BlockDealsTable({ deals, loading }: BlockDealsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

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
  }, [deals, sortField, sortOrder, searchTerm]);

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
      {/* Search */}
      <div className="dashboard-card">
        <input
          type="text"
          placeholder="Search by symbol, stock name, or client..."
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
                  onClick={() => handleSort('trade_price')}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Trade Price
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
              const value = ((deal.quantity || 0) * (deal.trade_price || 0)) / 10000000;
              
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
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <div className="text-sm text-foreground truncate max-w-[200px]">
                        {deal.client_name}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">
                      {deal.quantity?.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">
                      ₹{deal.trade_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm font-medium text-primary">
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
            No block deals found matching your criteria.
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredAndSortedDeals.length}</span> of{' '}
            <span className="font-semibold text-foreground">{deals.length}</span> block deals
          </div>
          <div className="text-sm text-muted-foreground">
            Total Value:{' '}
            <span className="font-semibold text-primary">
              ₹{(filteredAndSortedDeals.reduce((sum, d) => sum + ((d.quantity || 0) * (d.trade_price || 0)), 0) / 10000000).toFixed(2)} Cr
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="dashboard-card bg-primary/10 border-primary/20">
        <p className="text-sm text-foreground">
          <strong>Block Deals:</strong> Large transactions negotiated privately between parties, typically executed outside the regular market.
          These deals indicate significant institutional interest and can signal major position changes.
        </p>
      </div>
    </div>
  );
}
