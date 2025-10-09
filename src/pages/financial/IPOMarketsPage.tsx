// IPO Markets Page - Mainboard & SME IPO Analysis

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useIPOData, useIPOYears } from '@/hooks/useIPOData';
import { useIPOStats } from '@/hooks/useIPOStats';
import { IPOFilters } from '@/types/ipo';
import { PerformanceDashboard } from '@/components/ipo/PerformanceDashboard';
import { IPOListingsWithFilters } from '@/components/ipo/IPOListingsWithFilters';
import { SectorAnalysis } from '@/components/ipo/SectorAnalysis';
import { TimelineAnalysis } from '@/components/ipo/TimelineAnalysis';
import { IPOComparison } from '@/components/ipo/IPOComparison';

export default function IPOMarketsPage() {
  const [filters, setFilters] = useState<IPOFilters>({
    ipoType: 'all',
    year: 'all',
  });

  const { data: ipos, loading, error } = useIPOData(filters);
  const { years, loading: yearsLoading } = useIPOYears();
  const stats = useIPOStats(ipos);

  // Auto-select latest year on mount
  useEffect(() => {
    if (!yearsLoading && years.length > 0 && filters.year === 'all') {
      setFilters(prev => ({ ...prev, year: years[0] }));
    }
  }, [years, yearsLoading]);

  const mainboardIPOs = ipos.filter(ipo => ipo.ipo_type === 'mainboard');
  const smeIPOs = ipos.filter(ipo => ipo.ipo_type === 'sme');

  if (loading || yearsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading IPO data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>Error loading IPO data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">IPO Markets</h1>
                <p className="text-xs text-muted-foreground">Mainboard & SME IPO Performance Analysis</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <IPOComparison ipos={ipos} />
              
              <select
                value={filters.ipoType}
                onChange={(e) => setFilters(prev => ({ ...prev, ipoType: e.target.value as any }))}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All IPOs</option>
                <option value="mainboard">Mainboard</option>
                <option value="sme">SME</option>
              </select>
              
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value === 'all' ? 'all' : parseInt(e.target.value) }))}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Key Metrics - 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total IPOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalIPOs}</div>
                  <p className="text-xs text-muted-foreground">{mainboardIPOs.length} MB, {smeIPOs.length} SME</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Issue Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-foreground">₹{(stats.totalIssueSize / 1000).toFixed(1)}K Cr</div>
                  <p className="text-xs text-muted-foreground">Capital raised</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Avg Current Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {stats.avgCurrentReturn >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className={`text-2xl font-bold ${stats.avgCurrentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.avgCurrentReturn >= 0 ? '+' : ''}{stats.avgCurrentReturn.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Current performance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-indigo-500" />
                <div>
                  <div className={`text-2xl font-bold ${stats.successRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.successRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Positive gains</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceDashboard stats={stats} />
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <IPOListingsWithFilters ipos={ipos} />
          </TabsContent>

          {/* Sectors Tab */}
          <TabsContent value="sectors" className="space-y-6">
            <SectorAnalysis ipos={ipos} />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <TimelineAnalysis ipos={ipos} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
