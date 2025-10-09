import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search } from 'lucide-react';
import type { CashProvisionalData } from '@/types/fii-dii';
import { AdvancedFilters, FilterCriteria } from './AdvancedFilters';

type DatasetType = 'cash_provisional' | 'fii_cash' | 'dii_cash' | 'fii_fo_indices' | 'fii_fo_stocks' | 'dii_fo_indices' | 'dii_fo_stocks';

interface VirtualDataTableProps {
  data: any[];
  selectedDataset: DatasetType;
  onDatasetChange: (dataset: DatasetType) => void;
}

type SortField = 'date' | 'fii_net' | 'dii_net' | 'total';
type SortOrder = 'asc' | 'desc';

const ROW_HEIGHT = 48;
const VISIBLE_ROWS = 15;

export function VirtualDataTable({ data, selectedDataset, onDatasetChange }: VirtualDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [scrollTop, setScrollTop] = useState(0);
  const [filters, setFilters] = useState<FilterCriteria | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      const matchesSearch = item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.month_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Advanced filters
      if (filters) {
        if (filters.startDate && item.date < filters.startDate) return false;
        if (filters.endDate && item.date > filters.endDate) return false;
        if (filters.minFIINet !== null && item.fii_net < filters.minFIINet) return false;
        if (filters.maxFIINet !== null && item.fii_net > filters.maxFIINet) return false;
        if (filters.minDIINet !== null && item.dii_net < filters.minDIINet) return false;
        if (filters.maxDIINet !== null && item.dii_net > filters.maxDIINet) return false;
        
        const totalNet = item.fii_net + item.dii_net;
        if (filters.flowType === 'inflow' && totalNet <= 0) return false;
        if (filters.flowType === 'outflow' && totalNet >= 0) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'date':
          aVal = a.date;
          bVal = b.date;
          break;
        case 'fii_net':
          aVal = a.fii_net;
          bVal = b.fii_net;
          break;
        case 'dii_net':
          aVal = a.dii_net;
          bVal = b.dii_net;
          break;
        case 'total':
          aVal = a.fii_net + a.dii_net;
          bVal = b.fii_net + b.dii_net;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [data, searchTerm, sortField, sortOrder, filters]);

  // Virtual scrolling calculations
  const totalHeight = filteredAndSortedData.length * ROW_HEIGHT;
  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const endIndex = Math.min(startIndex + VISIBLE_ROWS + 5, filteredAndSortedData.length);
  const visibleData = filteredAndSortedData.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW_HEIGHT;

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 10000) {
      return `₹${(value / 1000).toFixed(1)}K Cr`;
    }
    return `₹${value.toFixed(0)} Cr`;
  };

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Detailed Flow Data ({filteredAndSortedData.length} records)</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedDataset}
              onChange={(e) => onDatasetChange(e.target.value as any)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background"
            >
              <option value="cash_provisional">Cash Provisional (FII+DII)</option>
              <option value="fii_cash">FII Cash (Equity+Debt)</option>
              <option value="dii_cash">DII Cash (Equity+Debt)</option>
            </select>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by date or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <AdvancedFilters
              onFilterChange={setFilters}
              onReset={() => setFilters(null)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="overflow-auto border rounded-lg"
          style={{ height: `${VISIBLE_ROWS * ROW_HEIGHT}px` }}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background z-10 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Date <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-right p-3 font-medium">
                    <button
                      onClick={() => handleSort('fii_net')}
                      className="flex items-center gap-1 ml-auto hover:text-primary"
                    >
                      FII Net <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">FII Buy</th>
                  <th className="text-right p-3 font-medium">FII Sell</th>
                  <th className="text-right p-3 font-medium">
                    <button
                      onClick={() => handleSort('dii_net')}
                      className="flex items-center gap-1 ml-auto hover:text-primary"
                    >
                      DII Net <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">DII Buy</th>
                  <th className="text-right p-3 font-medium">DII Sell</th>
                  <th className="text-right p-3 font-medium">
                    <button
                      onClick={() => handleSort('total')}
                      className="flex items-center gap-1 ml-auto hover:text-primary"
                    >
                      Total <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleData.map((row, idx) => {
                  const total = row.fii_net + row.dii_net;
                  return (
                    <tr
                      key={startIndex + idx}
                      className="border-b hover:bg-muted/50 transition-colors"
                      style={{ height: `${ROW_HEIGHT}px` }}
                    >
                      <td className="p-3 font-medium">{row.date}</td>
                      <td className="p-3 text-muted-foreground text-xs">{row.month_name}</td>
                      <td className={`p-3 text-right font-medium ${getValueColor(row.fii_net)}`}>
                        {formatValue(row.fii_net)}
                      </td>
                      <td className="p-3 text-right text-muted-foreground text-xs">
                        {formatValue(row.fii_gross_purchase)}
                      </td>
                      <td className="p-3 text-right text-muted-foreground text-xs">
                        {formatValue(row.fii_gross_sales)}
                      </td>
                      <td className={`p-3 text-right font-medium ${getValueColor(row.dii_net)}`}>
                        {formatValue(row.dii_net)}
                      </td>
                      <td className="p-3 text-right text-muted-foreground text-xs">
                        {formatValue(row.dii_gross_purchase)}
                      </td>
                      <td className="p-3 text-right text-muted-foreground text-xs">
                        {formatValue(row.dii_gross_sales)}
                      </td>
                      <td className={`p-3 text-right font-bold ${getValueColor(total)}`}>
                        {formatValue(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No data found matching your filters
          </div>
        )}
      </CardContent>
    </Card>
  );
}
