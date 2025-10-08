import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterCriteria) => void;
  onReset: () => void;
}

export interface FilterCriteria {
  startDate: string;
  endDate: string;
  minFIINet: number | null;
  maxFIINet: number | null;
  minDIINet: number | null;
  maxDIINet: number | null;
  flowType: 'all' | 'inflow' | 'outflow';
}

export function AdvancedFilters({ onFilterChange, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    startDate: '',
    endDate: '',
    minFIINet: null,
    maxFIINet: null,
    minDIINet: null,
    maxDIINet: null,
    flowType: 'all',
  });

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterCriteria = {
      startDate: '',
      endDate: '',
      minFIINet: null,
      maxFIINet: null,
      minDIINet: null,
      maxDIINet: null,
      flowType: 'all',
    };
    setFilters(resetFilters);
    onReset();
    setIsOpen(false);
  };

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 z-50 w-96 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Advanced Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* FII Net Flow Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">FII Net Flow (₹ Cr)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minFIINet || ''}
                    onChange={(e) => updateFilter('minFIINet', e.target.value ? Number(e.target.value) : null)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxFIINet || ''}
                    onChange={(e) => updateFilter('maxFIINet', e.target.value ? Number(e.target.value) : null)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* DII Net Flow Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">DII Net Flow (₹ Cr)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minDIINet || ''}
                    onChange={(e) => updateFilter('minDIINet', e.target.value ? Number(e.target.value) : null)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxDIINet || ''}
                    onChange={(e) => updateFilter('maxDIINet', e.target.value ? Number(e.target.value) : null)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Flow Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Flow Type</Label>
              <select
                value={filters.flowType}
                onChange={(e) => updateFilter('flowType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
              >
                <option value="all">All Flows</option>
                <option value="inflow">Inflows Only</option>
                <option value="outflow">Outflows Only</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleApply} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
