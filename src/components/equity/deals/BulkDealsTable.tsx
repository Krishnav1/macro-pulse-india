// Bulk Deals Table Component

import { useState, useMemo } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { Deal } from '@/hooks/equity/useDealsAnalysis';
import { formatDealValue, formatQuantity } from '@/utils/currencyFormatter';

interface BulkDealsTableProps {
  deals: Deal[];
  loading: boolean;
}

export function BulkDealsTable({ deals, loading }: BulkDealsTableProps) {
  const [sortField, setSortField] = useState<keyof Deal>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: keyof Deal) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (deal) =>
          deal.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deal.stock_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deal.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [deals, searchTerm, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="dashboard-card">
        <input
          type="text"
          placeholder="Search by symbol, stock name, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="py-3 px-4 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <span className="text-sm font-semibold text-muted-foreground">Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-left">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <span className="text-sm font-semibold text-muted-foreground">Stock</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-left">
                <button
                  onClick={() => handleSort('client_name')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <span className="text-sm font-semibold text-muted-foreground">Client</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-center">
                <span className="text-sm font-semibold text-muted-foreground">Type</span>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('quantity')}
                  className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
                >
                  <span className="text-sm font-semibold text-muted-foreground">Quantity</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
                >
                  <span className="text-sm font-semibold text-muted-foreground">Price (₹)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('value')}
                  className="flex items-center gap-1 ml-auto hover:text-primary transition-colors"
                >
                  <span className="text-sm font-semibold text-muted-foreground">Value</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDeals.map((deal, index) => {
              const isBuy = deal.deal_type?.toLowerCase() === 'buy';
              
              return (
                <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
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
                      {formatQuantity(deal.quantity || 0)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm text-foreground">
                      ₹{deal.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`text-sm font-medium ${isBuy ? 'text-success' : 'text-destructive'}`}>
                      {formatDealValue(deal.value)}
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

