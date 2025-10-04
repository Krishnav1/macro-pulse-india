
// INDUSTRY KPI CARDS
// Key metrics for industry trends (similar to investor-behavior)
// =====================================================

import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface IndustryKPICardsProps {
  selectedQuarter?: string;
  selectedYear?: string;
  viewMode: 'quarter' | 'year';
}

interface QuarterMetrics {
  total_aum: number;
  total_aaum: number;
  equity_percentage: number;
  debt_percentage: number;
  hybrid_percentage: number;
  other_percentage: number;
  qoq_change: number | null;
  top_category: string;
  top_category_aum: number;
}

export function IndustryKPICards({ selectedQuarter, selectedYear, viewMode }: IndustryKPICardsProps) {
  const [metrics, setMetrics] = useState<QuarterMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const period = viewMode === 'quarter' ? selectedQuarter : selectedYear;
    if (!period) return;

    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Get subtotal rows for the selected period
        const { data, error } = await (supabase as any)
          .from('quarterly_aum_data')
          .select('*')
          .eq(viewMode === 'quarter' ? 'quarter_end_date' : 'fiscal_year', period)
          .ilike('category_display_name', '%- TOTAL')
          .not('category_display_name', 'ilike', '%Grand TOTAL%');

        // Get grand total
        const { data: totalData } = await (supabase as any)
          .from('quarterly_aum_data')
          .select('*')
          .eq(viewMode === 'quarter' ? 'quarter_end_date' : 'fiscal_year', period)
          .ilike('category_display_name', '%Grand TOTAL%')
          .maybeSingle();

        const totalAUM = totalData?.aum_crore || data.reduce((sum: number, row: any) => sum + parseFloat(row.aum_crore), 0);
        const totalAAUM = totalData?.aaum_crore || data.reduce((sum: number, row: any) => sum + parseFloat(row.aaum_crore), 0);

        // Calculate percentages
        const equityRow = data.find((r: any) => r.parent_category === 'Equity');
        const debtRow = data.find((r: any) => r.parent_category === 'Debt');
        const hybridRow = data.find((r: any) => r.parent_category === 'Hybrid');
        const otherRow = data.find((r: any) => r.parent_category === 'Other');

        const equityAUM = equityRow ? parseFloat(equityRow.aum_crore) : 0;
        const debtAUM = debtRow ? parseFloat(debtRow.aum_crore) : 0;
        const hybridAUM = hybridRow ? parseFloat(hybridRow.aum_crore) : 0;
        const otherAUM = otherRow ? parseFloat(otherRow.aum_crore) : 0;

        // Find top category
        const categories = [
          { name: 'Equity', aum: equityAUM },
          { name: 'Debt', aum: debtAUM },
          { name: 'Hybrid', aum: hybridAUM },
          { name: 'Other', aum: otherAUM }
        ].sort((a, b) => b.aum - a.aum);

        // Get QoQ change from grand total
        const qoqChange = totalData?.qoq_change_percent ? parseFloat(totalData.qoq_change_percent) : null;

        setMetrics({
          total_aum: totalAUM,
          total_aaum: totalAAUM,
          equity_percentage: (equityAUM / totalAUM) * 100,
          debt_percentage: (debtAUM / totalAUM) * 100,
          hybrid_percentage: (hybridAUM / totalAUM) * 100,
          other_percentage: (otherAUM / totalAUM) * 100,
          qoq_change: qoqChange,
          top_category: categories[0].name,
          top_category_aum: categories[0].aum
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedQuarter, selectedYear, viewMode]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No data available for selected quarter.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total AUM */}
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total AUM
          </CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ₹{(metrics.total_aum / 100000).toFixed(2)}L Cr
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quarter-end value
          </p>
        </CardContent>
      </Card>

      {/* Average AUM */}
      <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average AUM
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₹{(metrics.total_aaum / 100000).toFixed(2)}L Cr
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quarterly average
          </p>
        </CardContent>
      </Card>

      {/* QoQ Growth */}
      <Card className={`border-l-4 ${
        metrics.qoq_change && metrics.qoq_change >= 0 
          ? 'border-l-green-500' 
          : 'border-l-red-500'
      } hover:shadow-lg transition-shadow`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            QoQ Growth
          </CardTitle>
          {metrics.qoq_change && metrics.qoq_change >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            metrics.qoq_change && metrics.qoq_change >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {metrics.qoq_change ? `${metrics.qoq_change > 0 ? '+' : ''}${metrics.qoq_change.toFixed(2)}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Quarter-over-quarter
          </p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Category
          </CardTitle>
          <PieChart className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {metrics.top_category}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₹{(metrics.top_category_aum / 100000).toFixed(2)}L Cr
          </p>
        </CardContent>
      </Card>

      {/* Market Share */}
      <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Equity Share
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {metrics.equity_percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.debt_percentage.toFixed(1)}% Debt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
