// IPO Listing Table with sorting and color coding

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IPOListing } from '@/types/ipo';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface IPOListingTableProps {
  ipos: IPOListing[];
}

type SortField = 'company_name' | 'listing_date' | 'listing_gain_percent' | 'current_gain_percent' | 'market_cap';
type SortDirection = 'asc' | 'desc';

export function IPOListingTable({ ipos }: IPOListingTableProps) {
  const [sortField, setSortField] = useState<SortField>('listing_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedIPOs = [...ipos].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle null values
    if (aValue === null || aValue === undefined) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
    if (bValue === null || bValue === undefined) bValue = sortDirection === 'asc' ? Infinity : -Infinity;

    // String comparison for company name
    if (sortField === 'company_name') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Numeric comparison
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const getRowColor = (ipo: IPOListing) => {
    const gain = ipo.current_gain_percent || 0;
    if (gain > 50) return 'bg-green-100 dark:bg-green-950/30 border-l-4 border-l-green-500';
    if (gain > 0) return 'bg-green-50 dark:bg-green-950/10 border-l-4 border-l-green-400';
    if (gain < -20) return 'bg-red-100 dark:bg-red-950/30 border-l-4 border-l-red-500';
    if (gain < 0) return 'bg-red-50 dark:bg-red-950/10 border-l-4 border-l-red-400';
    return 'border-l-4 border-l-gray-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>IPO Listings</CardTitle>
        <CardDescription>
          Detailed listing with performance metrics (click column headers to sort)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th 
                  className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('company_name')}
                >
                  <div className="flex items-center gap-2">
                    Company
                    <SortIcon field="company_name" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                  Type
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('listing_date')}
                >
                  <div className="flex items-center gap-2">
                    Listing Date
                    <SortIcon field="listing_date" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
                  Issue Price
                </th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">
                  LTP
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('listing_gain_percent')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Listing Gain
                    <SortIcon field="listing_gain_percent" />
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('current_gain_percent')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Current Gain
                    <SortIcon field="current_gain_percent" />
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('market_cap')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Market Cap
                    <SortIcon field="market_cap" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedIPOs.map((ipo) => (
                <tr 
                  key={ipo.id} 
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${getRowColor(ipo)}`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-foreground">{ipo.company_name}</div>
                      {ipo.sector && (
                        <div className="text-xs text-muted-foreground">{ipo.sector}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ipo.ipo_type === 'mainboard' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    }`}>
                      {ipo.ipo_type === 'mainboard' ? 'Mainboard' : 'SME'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {new Date(ipo.listing_date).toLocaleDateString('en-IN', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    ₹{ipo.issue_price?.toFixed(2) || '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    ₹{ipo.ltp?.toFixed(2) || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {ipo.listing_gain_percent !== null ? (
                      <div className="flex items-center justify-end gap-1">
                        {ipo.listing_gain_percent >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          ipo.listing_gain_percent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {ipo.listing_gain_percent >= 0 ? '+' : ''}{ipo.listing_gain_percent.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {ipo.current_gain_percent !== null ? (
                      <div className="flex items-center justify-end gap-1">
                        {ipo.current_gain_percent >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`font-bold ${
                          ipo.current_gain_percent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {ipo.current_gain_percent >= 0 ? '+' : ''}{ipo.current_gain_percent.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {ipo.market_cap ? `₹${ipo.market_cap.toFixed(0)} Cr` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedIPOs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No IPO data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
