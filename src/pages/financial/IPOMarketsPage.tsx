// IPO Markets Page - Mainboard & SME IPO Analysis

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useIPOData, useIPOYears } from '@/hooks/useIPOData';
import { useIPOStats } from '@/hooks/useIPOStats';
import { IPOFilters } from '@/types/ipo';
import { PerformanceDashboard } from '@/components/ipo/PerformanceDashboard';
import { IPOListingTable } from '@/components/ipo/IPOListingTable';
import { SectorAnalysis } from '@/components/ipo/SectorAnalysis';
import { TimelineAnalysis } from '@/components/ipo/TimelineAnalysis';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">IPO Markets</h1>
                <p className="text-sm text-muted-foreground mt-1">Mainboard & SME IPO Performance Analysis</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.ipoType}
                onChange={(e) => setFilters(prev => ({ ...prev, ipoType: e.target.value as any }))}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All IPOs</option>
                <option value="mainboard">Mainboard</option>
                <option value="sme">SME</option>
              </select>
              
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value === 'all' ? 'all' : parseInt(e.target.value) }))}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total IPOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-foreground">{stats.totalIPOs}</div>
                <Rocket className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {mainboardIPOs.length} Mainboard, {smeIPOs.length} SME
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issue Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-foreground">₹{(stats.totalIssueSize / 1000).toFixed(1)}K Cr</div>
                <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Combined capital raised</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Listing Gain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${stats.avgListingGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgListingGain >= 0 ? '+' : ''}{stats.avgListingGain.toFixed(2)}%
                </div>
                {stats.avgListingGain >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">First day returns</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Current Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${stats.avgCurrentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgCurrentReturn >= 0 ? '+' : ''}{stats.avgCurrentReturn.toFixed(2)}%
                </div>
                {stats.avgCurrentReturn >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Current performance</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${stats.successRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.successRate.toFixed(1)}%
                </div>
                <Target className="h-8 w-8 text-indigo-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Positive current gains</p>
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
            <IPOListingTable ipos={ipos} />
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
