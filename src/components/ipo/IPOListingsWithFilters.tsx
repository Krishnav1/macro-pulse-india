// IPO Listings with Search, Filter, and Progressive Loading

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IPOListing } from '@/types/ipo';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Search, Filter, X } from 'lucide-react';

interface IPOListingsWithFiltersProps {
  ipos: IPOListing[];
}

type SortField = 'company_name' | 'listing_date' | 'listing_gain_percent' | 'current_gain_percent' | 'market_cap';
type SortDirection = 'asc' | 'desc';

export function IPOListingsWithFilters({ ipos }: IPOListingsWithFiltersProps) {
  const [sortField, setSortField] = useState<SortField>('listing_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(10);

  // Get unique industries
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(ipos.map(ipo => ipo.main_industry || ipo.sector).filter(Boolean))];
    return uniqueIndustries.sort();
  }, [ipos]);

  // Filter IPOs
  const filteredIPOs = useMemo(() => {
    return ipos.filter(ipo => {
      const matchesSearch = ipo.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || 
        ipo.main_industry === selectedIndustry || 
        ipo.sector === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [ipos, searchQuery, selectedIndustry]);

  // Sort IPOs
  const sortedIPOs = useMemo(() => {
    return [...filteredIPOs].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (aValue === null || aValue === undefined) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bValue === null || bValue === undefined) bValue = sortDirection === 'asc' ? Infinity : -Infinity;

      if (sortField === 'company_name') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [filteredIPOs, sortField, sortDirection]);

  // Display limited IPOs
  const displayedIPOs = sortedIPOs.slice(0, displayCount);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const getRowColor = (ipo: IPOListing) => {
    const gain = ipo.current_gain_percent || 0;
    if (gain > 50) return 'bg-green-100 dark:bg-green-950/30 border-l-4 border-l-green-500 text-green-900 dark:text-green-100';
    if (gain > 0) return 'bg-green-50 dark:bg-green-950/10 border-l-4 border-l-green-400 text-green-900 dark:text-green-100';
    if (gain < -20) return 'bg-red-100 dark:bg-red-950/30 border-l-4 border-l-red-500 text-red-900 dark:text-red-100';
    if (gain < 0) return 'bg-red-50 dark:bg-red-950/10 border-l-4 border-l-red-400 text-red-900 dark:text-red-100';
    return 'border-l-4 border-l-gray-300 text-foreground';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('all');
    setDisplayCount(10);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>IPO Listings ({sortedIPOs.length})</CardTitle>
        <CardDescription>
          Detailed listing with performance metrics (click column headers to sort)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          {(searchQuery || selectedIndustry !== 'all') && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {displayedIPOs.length} of {sortedIPOs.length} IPOs</span>
          {filteredIPOs.length !== ipos.length && (
            <span className="text-primary">Filtered from {ipos.length} total</span>
          )}
        </div>

        {/* Table */}
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
                <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                  Main Industry
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
              {displayedIPOs.map((ipo) => (
                <tr 
                  key={ipo.id} 
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${getRowColor(ipo)}`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{ipo.company_name}</div>
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
                  <td className="py-3 px-4">
                    {ipo.main_industry ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {ipo.main_industry}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
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

          {displayedIPOs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No IPOs found matching your filters</p>
            </div>
          )}
        </div>

        {/* Load More Buttons */}
        {displayCount < sortedIPOs.length && (
          <div className="flex justify-center gap-3 pt-4">
            {displayCount < 50 && (
              <Button 
                variant="outline" 
                onClick={() => setDisplayCount(50)}
              >
                Show 50 IPOs
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setDisplayCount(sortedIPOs.length)}
            >
              Show All ({sortedIPOs.length})
            </Button>
          </div>
        )}

        {displayCount >= sortedIPOs.length && sortedIPOs.length > 10 && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDisplayCount(10)}
            >
              Show Less
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
