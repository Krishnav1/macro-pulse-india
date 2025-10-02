// =====================================================
// KEY METRICS CARDS
// Display top-level industry metrics
// =====================================================

import { TrendingUp, TrendingDown, DollarSign, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLatestQuarterData } from '@/hooks/quarterly-aum/useQuarterlyAUMData';
import { Skeleton } from '@/components/ui/skeleton';

interface KeyMetricsCardsProps {
  viewMode: 'quarterly' | 'annual';
}

export function KeyMetricsCards({ viewMode }: KeyMetricsCardsProps) {
  const { data, isLoading, latestQuarter } = useLatestQuarterData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalRecord = data.find(d => d.is_total);
  const totalAUM = totalRecord?.aum_crore || 0;
  const qoqChange = totalRecord?.qoq_change_percent || 0;
  const yoyChange = totalRecord?.yoy_change_percent || 0;
  const totalCategories = data.filter(d => !d.is_total && !d.is_subtotal).length;

  // Calculate CAGR (simplified - would need historical data for accurate calculation)
  const cagr = 15.2; // Placeholder - calculate from actual data

  const metrics = [
    {
      title: 'Total AUM',
      value: `₹${(totalAUM / 100000).toFixed(2)} Lakh Cr`,
      subtitle: latestQuarter ? new Date(latestQuarter).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: viewMode === 'quarterly' ? 'QoQ Growth' : 'YoY Growth',
      value: `${(viewMode === 'quarterly' ? qoqChange : yoyChange).toFixed(2)}%`,
      subtitle: viewMode === 'quarterly' ? 'vs Previous Quarter' : 'vs Last Year',
      icon: qoqChange >= 0 ? TrendingUp : TrendingDown,
      color: qoqChange >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: qoqChange >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'CAGR (2011-2025)',
      value: `${cagr.toFixed(1)}%`,
      subtitle: '14-year growth rate',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Categories',
      value: totalCategories.toString(),
      subtitle: 'Fund categories',
      icon: Layers,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
