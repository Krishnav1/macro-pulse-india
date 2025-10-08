import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search } from 'lucide-react';
import type { CashProvisionalData } from '@/types/fii-dii';

interface FIIDIIDataTableProps {
  data: CashProvisionalData[];
}

type SortField = 'date' | 'fii_net' | 'dii_net' | 'total';
type SortOrder = 'asc' | 'desc';

export function FIIDIIDataTable({ data }: FIIDIIDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item =>
      item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.month_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  }, [data, searchTerm, sortField, sortOrder]);

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
        <div className="flex items-center justify-between">
          <CardTitle>Detailed Flow Data</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by date or month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
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
                <th className="text-right p-3 font-medium">FII Gross Buy</th>
                <th className="text-right p-3 font-medium">FII Gross Sell</th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('dii_net')}
                    className="flex items-center gap-1 ml-auto hover:text-primary"
                  >
                    DII Net <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-right p-3 font-medium">DII Gross Buy</th>
                <th className="text-right p-3 font-medium">DII Gross Sell</th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center gap-1 ml-auto hover:text-primary"
                  >
                    Total Net <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row, idx) => {
                const total = row.fii_net + row.dii_net;
                return (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{row.date}</td>
                    <td className="p-3 text-muted-foreground">{row.month_name}</td>
                    <td className={`p-3 text-right font-medium ${getValueColor(row.fii_net)}`}>
                      {formatValue(row.fii_net)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatValue(row.fii_gross_purchase)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatValue(row.fii_gross_sales)}
                    </td>
                    <td className={`p-3 text-right font-medium ${getValueColor(row.dii_net)}`}>
                      {formatValue(row.dii_net)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatValue(row.dii_gross_purchase)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
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
          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
