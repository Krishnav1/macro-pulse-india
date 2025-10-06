// KPI Cards component for Bulk & Block Deals

import { TrendingUp, TrendingDown, BarChart3, Star } from 'lucide-react';
import { KPIData } from '@/hooks/equity/useDealsAnalysis';
import { DateRange } from '@/utils/financialYearUtils';

interface DealsKPICardsProps {
  kpiData: KPIData;
  loading: boolean;
  dateRange: DateRange;
}

export function DealsKPICards({ kpiData, loading, dateRange }: DealsKPICardsProps) {
  const formatValue = (value: number) => {
    if (value >= 10000000) { // 1 crore
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) { // 1 lakh
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toFixed(0)}`;
    }
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dashboard-card animate-pulse">
            <div className="h-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Buying',
      value: formatValue(kpiData.totalBuying),
      subtitle: `${formatNumber(kpiData.buyDeals)} deals`,
      icon: TrendingUp,
      iconColor: 'text-success',
      bgColor: 'bg-success/5',
      borderColor: 'border-success/20',
      trend: kpiData.totalBuying > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Total Selling',
      value: formatValue(kpiData.totalSelling),
      subtitle: `${formatNumber(kpiData.sellDeals)} deals`,
      icon: TrendingDown,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/5',
      borderColor: 'border-destructive/20',
      trend: kpiData.totalSelling > 0 ? 'negative' : 'neutral'
    },
    {
      title: 'Net Flow',
      value: formatValue(Math.abs(kpiData.netFlow)),
      subtitle: kpiData.netFlow >= 0 ? 'Net Buying' : 'Net Selling',
      icon: BarChart3,
      iconColor: kpiData.netFlow >= 0 ? 'text-success' : 'text-destructive',
      bgColor: kpiData.netFlow >= 0 ? 'bg-success/5' : 'bg-destructive/5',
      borderColor: kpiData.netFlow >= 0 ? 'border-success/20' : 'border-destructive/20',
      trend: kpiData.netFlow >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Most Active',
      value: kpiData.mostActiveStock?.symbol || 'N/A',
      subtitle: kpiData.mostActiveStock 
        ? `${formatNumber(kpiData.mostActiveStock.dealCount)} deals`
        : 'No data',
      icon: Star,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20',
      trend: 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className={`dashboard-card ${card.bgColor} ${card.borderColor} hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              
              {/* Trend Indicator */}
              {card.trend !== 'neutral' && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'positive' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {card.trend === 'positive' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {card.trend === 'positive' ? 'Bullish' : 'Bearish'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.title}
              </div>
              
              <div className={`text-xl font-bold ${
                card.trend === 'positive' ? 'text-success' :
                card.trend === 'negative' ? 'text-destructive' :
                'text-foreground'
              }`}>
                {card.value}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {card.subtitle}
              </div>
            </div>

            {/* Additional Info for Most Active Stock */}
            {index === 3 && kpiData.mostActiveStock && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {kpiData.mostActiveStock.stock_name}
                </div>
                <div className="text-xs font-medium text-primary">
                  {formatValue(kpiData.mostActiveStock.totalValue)} total value
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
