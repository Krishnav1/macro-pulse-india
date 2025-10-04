// =====================================================
// INDUSTRY TRENDS PAGE - REDESIGNED
// At-a-glance analysis with quarter selection
// =====================================================

import { useState, useEffect } from 'react';
import { TrendingUp, PieChart, BarChart3, Grid3x3, LineChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndustryKPICards } from '@/components/financial/industry-trends/IndustryKPICards';
import { CategoryDistributionChart } from '@/components/financial/industry-trends/CategoryDistributionChart';
import { AumAaumComparisonChart } from '@/components/financial/industry-trends/AumAaumComparisonChart';
import { QuarterlyTrendChart } from '@/components/financial/industry-trends/QuarterlyTrendChart';
import { useQuarterlyAUMData } from '@/hooks/quarterly-aum/useQuarterlyAUMData';
import { supabase } from '@/integrations/supabase/client';

export default function IndustryTrendsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('chart');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [availableQuarters, setAvailableQuarters] = useState<{ value: string; label: string }[]>([]);
  const { data: allData, isLoading } = useQuarterlyAUMData();

  // Get unique quarters and set latest as default
  useEffect(() => {
    const fetchQuarters = async () => {
      const { data, error } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('quarter_end_date, quarter_label')
        .order('quarter_end_date', { ascending: false });

      if (error) {
        console.error('Error fetching quarters:', error);
        return;
      }

      // Get unique quarters
      const uniqueQuarters = Array.from(
        new Map(data.map((item: any) => [item.quarter_end_date, item])).values()
      );

      const quarters = uniqueQuarters.map((q: any) => ({
        value: q.quarter_end_date,
        label: q.quarter_label
      }));

      setAvailableQuarters(quarters);
      if (quarters.length > 0 && !selectedQuarter) {
        setSelectedQuarter(quarters[0].value);
      }
    };

    fetchQuarters();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Row: Headline + Quarter Selector + View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Industry Trends
          </h1>
          <p className="text-sm text-muted-foreground">
            Mutual fund industry composition and growth analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quarter Selector */}
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading || availableQuarters.length === 0}
          >
            {availableQuarters.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-input rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm flex items-center gap-2 rounded-l-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-2 text-sm flex items-center gap-2 rounded-r-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              <LineChart className="h-4 w-4" />
              Chart
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <IndustryKPICards selectedQuarter={selectedQuarter} />

      {/* Charts Section - At a Glance */}
      <div className="space-y-6">
        {/* Top Row: Two Charts Side-by-Side */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5" />
                Category Distribution
              </CardTitle>
              <CardDescription>
                AUM breakdown by asset class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDistributionChart selectedQuarter={selectedQuarter} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                AUM vs AAUM Comparison
              </CardTitle>
              <CardDescription>
                Quarter-end vs average AUM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AumAaumComparisonChart selectedQuarter={selectedQuarter} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Full-Width Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Quarterly Trend Analysis
            </CardTitle>
            <CardDescription>
              Last 8 quarters AUM growth by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuarterlyTrendChart selectedQuarter={selectedQuarter} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
