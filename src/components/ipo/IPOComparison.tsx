// IPO Comparison Component - Compare up to 3 IPOs side by side

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IPOListing } from '@/types/ipo';
import { GitCompare, X, TrendingUp, TrendingDown, Calendar, DollarSign, Target, Building2 } from 'lucide-react';

interface IPOComparisonProps {
  ipos: IPOListing[];
}

export function IPOComparison({ ipos }: IPOComparisonProps) {
  const [open, setOpen] = useState(false);
  const [selectedIPOs, setSelectedIPOs] = useState<IPOListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIPOs = ipos.filter(ipo => 
    ipo.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const addIPO = (ipo: IPOListing) => {
    if (selectedIPOs.length < 3 && !selectedIPOs.find(i => i.id === ipo.id)) {
      setSelectedIPOs([...selectedIPOs, ipo]);
      setSearchQuery('');
    }
  };

  const removeIPO = (id: number) => {
    setSelectedIPOs(selectedIPOs.filter(ipo => ipo.id !== id));
  };

  const clearAll = () => {
    setSelectedIPOs([]);
    setSearchQuery('');
  };

  const MetricRow = ({ label, values, format = (v: any) => v, colorCode = false }: any) => (
    <div className="grid grid-cols-4 gap-4 py-3 border-b border-border">
      <div className="font-semibold text-sm text-muted-foreground">{label}</div>
      {selectedIPOs.map((ipo, idx) => {
        const value = values[idx];
        const isPositive = typeof value === 'number' && value > 0;
        const isNegative = typeof value === 'number' && value < 0;
        
        return (
          <div 
            key={ipo.id} 
            className={`text-sm font-medium ${
              colorCode && isPositive ? 'text-green-600 dark:text-green-400' :
              colorCode && isNegative ? 'text-red-600 dark:text-red-400' :
              'text-foreground'
            }`}
          >
            {format(value)}
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <GitCompare className="h-4 w-4" />
          Compare IPOs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            IPO Comparison Tool
          </DialogTitle>
          <DialogDescription>
            Select up to 3 IPOs to compare their performance metrics side by side
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* IPO Selection */}
          {selectedIPOs.length < 3 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search for IPO by company name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  
                  {searchQuery && filteredIPOs.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                      {filteredIPOs.map(ipo => (
                        <button
                          key={ipo.id}
                          onClick={() => addIPO(ipo)}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{ipo.company_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ipo.main_industry || ipo.sector} • {ipo.ipo_type === 'mainboard' ? 'Mainboard' : 'SME'}
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${
                            (ipo.current_gain_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(ipo.current_gain_percent || 0) >= 0 ? '+' : ''}{(ipo.current_gain_percent || 0).toFixed(2)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected IPOs */}
          {selectedIPOs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Selected IPOs ({selectedIPOs.length}/3)</h3>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              {/* IPO Headers */}
              <div className="grid grid-cols-4 gap-4">
                <div className="font-semibold text-sm text-muted-foreground">Metric</div>
                {selectedIPOs.map(ipo => (
                  <Card key={ipo.id} className="relative">
                    <button
                      onClick={() => removeIPO(ipo.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <CardContent className="pt-6 pb-4">
                      <div className="font-bold text-sm mb-1">{ipo.company_name}</div>
                      <div className="text-xs text-muted-foreground">{ipo.main_industry || ipo.sector}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                        ipo.ipo_type === 'mainboard' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                      }`}>
                        {ipo.ipo_type === 'mainboard' ? 'Mainboard' : 'SME'}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Table */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-0">
                    {/* Basic Info */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Basic Information
                      </h4>
                      <MetricRow 
                        label="Listing Date" 
                        values={selectedIPOs.map(ipo => ipo.listing_date)}
                        format={(v: string) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      />
                      <MetricRow 
                        label="Issue Size" 
                        values={selectedIPOs.map(ipo => ipo.issue_size)}
                        format={(v: number) => `₹${v?.toFixed(0)} Cr`}
                      />
                      <MetricRow 
                        label="Issue Price" 
                        values={selectedIPOs.map(ipo => ipo.issue_price)}
                        format={(v: number) => `₹${v?.toFixed(2)}`}
                      />
                      <MetricRow 
                        label="Market Cap" 
                        values={selectedIPOs.map(ipo => ipo.market_cap)}
                        format={(v: number) => v ? `₹${v.toFixed(0)} Cr` : '-'}
                      />
                    </div>

                    {/* Listing Day Performance */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Listing Day Performance
                      </h4>
                      <MetricRow 
                        label="Listing Open" 
                        values={selectedIPOs.map(ipo => ipo.listing_open)}
                        format={(v: number) => `₹${v?.toFixed(2)}`}
                      />
                      <MetricRow 
                        label="Listing Close" 
                        values={selectedIPOs.map(ipo => ipo.listing_close)}
                        format={(v: number) => `₹${v?.toFixed(2)}`}
                      />
                      <MetricRow 
                        label="Listing Gain" 
                        values={selectedIPOs.map(ipo => ipo.listing_gain_percent)}
                        format={(v: number) => `${v >= 0 ? '+' : ''}${v?.toFixed(2)}%`}
                        colorCode
                      />
                    </div>

                    {/* Current Performance */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Current Performance
                      </h4>
                      <MetricRow 
                        label="Current Price (LTP)" 
                        values={selectedIPOs.map(ipo => ipo.ltp)}
                        format={(v: number) => `₹${v?.toFixed(2)}`}
                      />
                      <MetricRow 
                        label="Current Gain" 
                        values={selectedIPOs.map(ipo => ipo.current_gain_percent)}
                        format={(v: number) => `${v >= 0 ? '+' : ''}${v?.toFixed(2)}%`}
                        colorCode
                      />
                      <MetricRow 
                        label="Returns from Issue" 
                        values={selectedIPOs.map(ipo => {
                          if (!ipo.ltp || !ipo.issue_price) return null;
                          return ((ipo.ltp - ipo.issue_price) / ipo.issue_price) * 100;
                        })}
                        format={(v: number) => v !== null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '-'}
                        colorCode
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Winner Highlight */}
              {selectedIPOs.length >= 2 && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-semibold text-foreground">Best Performer</div>
                        <div className="text-sm text-muted-foreground">
                          {(() => {
                            const best = selectedIPOs.reduce((prev, current) => 
                              (current.current_gain_percent || 0) > (prev.current_gain_percent || 0) ? current : prev
                            );
                            return `${best.company_name} with ${best.current_gain_percent?.toFixed(2)}% current gain`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedIPOs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search and select IPOs to start comparing</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
