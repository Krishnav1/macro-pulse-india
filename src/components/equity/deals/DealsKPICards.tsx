// KPI Cards component for Bulk & Block Deals - Compact Rectangular Design

import { TrendingUp, TrendingDown, BarChart3, Star } from 'lucide-react';
import { KPIData } from '@/hooks/equity/useDealsAnalysis';
import { DateRange } from '@/utils/financialYearUtils';
import { formatDealValue, formatQuantity } from '@/utils/currencyFormatter';

interface DealsKPICardsProps {
  kpiData: KPIData;
  loading: boolean;
  dateRange: DateRange;
}

export function DealsKPICards({ kpiData, loading, dateRange }: DealsKPICardsProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dashboard-card animate-pulse p-3">
            <div className="h-14 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Buying',
      value: formatDealValue(kpiData.totalBuying),
      subtitle: `${kpiData.buyDeals} deals`,
      icon: TrendingUp,
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-l-4 border-success',
      sentiment: 'Bullish'
    },
    {
      title: 'Total Selling',
      value: formatDealValue(kpiData.totalSelling),
      subtitle: `${kpiData.sellDeals} deals`,
      icon: TrendingDown,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-l-4 border-destructive',
      sentiment: 'Bearish'
    },
    {
      title: 'Net Flow',
      value: formatDealValue(Math.abs(kpiData.netFlow)),
      subtitle: kpiData.netFlow >= 0 ? 'Net Buying' : 'Net Selling',
      icon: BarChart3,
      iconColor: kpiData.netFlow >= 0 ? 'text-success' : 'text-destructive',
      bgColor: kpiData.netFlow >= 0 ? 'bg-success/10' : 'bg-destructive/10',
      borderColor: kpiData.netFlow >= 0 ? 'border-l-4 border-success' : 'border-l-4 border-destructive',
      sentiment: kpiData.netFlow >= 0 ? 'Bullish' : 'Bearish'
    },
    {
      title: 'Most Active',
      value: kpiData.mostActiveStock?.symbol || 'N/A',
      subtitle: kpiData.mostActiveStock 
        ? `${kpiData.mostActiveStock.dealCount} deals • ${formatDealValue(kpiData.mostActiveStock.totalValue)}`
        : 'No data',
      icon: Star,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-l-4 border-primary',
      sentiment: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className={`dashboard-card p-3 ${card.bgColor} ${card.borderColor} hover:shadow-lg transition-all duration-200 cursor-pointer group`}
          >
            {/* Compact Horizontal Layout */}
            <div className="flex items-center justify-between">
              {/* Left: Icon + Content */}
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${card.iconColor} bg-background/50`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    {card.title}
                  </div>
                  <div className={`text-lg font-bold ${card.iconColor} truncate`}>
                    {card.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {card.subtitle}
                  </div>
                </div>
              </div>
              
              {/* Right: Sentiment Badge */}
              {card.sentiment && (
                <div className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap ${
                  card.sentiment === 'Bullish' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {card.sentiment}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
