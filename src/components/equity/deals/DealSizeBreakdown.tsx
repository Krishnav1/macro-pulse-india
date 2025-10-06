// Deal Size Breakdown Component - Shows distribution of deals by value categories

import { BarChart3, TrendingUp } from 'lucide-react';
import { Deal } from '@/hooks/equity/useDealsAnalysis';
import { formatDealValue } from '@/utils/currencyFormatter';

interface DealSizeBreakdownProps {
  deals: Deal[];
  loading: boolean;
}

interface SizeCategory {
  name: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export function DealSizeBreakdown({ deals, loading }: DealSizeBreakdownProps) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Define size categories
  const categories: SizeCategory[] = [
    {
      name: 'Micro',
      min: 0,
      max: 1000000, // < 10L
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      count: 0,
      totalValue: 0,
      percentage: 0
    },
    {
      name: 'Small',
      min: 1000000,
      max: 10000000, // 10L - 1Cr
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      count: 0,
      totalValue: 0,
      percentage: 0
    },
    {
      name: 'Medium',
      min: 10000000,
      max: 100000000, // 1Cr - 10Cr
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
      count: 0,
      totalValue: 0,
      percentage: 0
    },
    {
      name: 'Large',
      min: 100000000,
      max: Infinity, // > 10Cr
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      count: 0,
      totalValue: 0,
      percentage: 0
    }
  ];

  // Calculate distribution
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  deals.forEach(deal => {
    const category = categories.find(cat => deal.value >= cat.min && deal.value < cat.max);
    if (category) {
      category.count++;
      category.totalValue += deal.value;
    }
  });

  // Calculate percentages
  categories.forEach(cat => {
    cat.percentage = totalDeals > 0 ? (cat.count / totalDeals) * 100 : 0;
  });

  // Find dominant category
  const dominantCategory = categories.reduce((max, cat) => 
    cat.count > max.count ? cat : max
  , categories[0]);

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Deal Size Distribution</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{totalDeals}</span> deals
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.bgColor}`}></div>
                <span className="text-sm font-medium text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({category.min === 0 ? '< ₹10L' : 
                    category.max === Infinity ? '> ₹10Cr' :
                    `₹${(category.min / 100000).toFixed(0)}L - ₹${(category.max / 10000000).toFixed(0)}Cr`})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">
                  {category.count} deals
                </span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${category.bgColor} opacity-20 transition-all duration-500`}
                style={{ width: `${category.percentage}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className={`text-xs font-medium ${category.color}`}>
                  {formatDealValue(category.totalValue)}
                </span>
                {category === dominantCategory && category.count > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    Dominant
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Average Deal Size</div>
          <div className="text-lg font-bold text-foreground">
            {formatDealValue(totalValue / totalDeals || 0)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Largest Deal</div>
          <div className="text-lg font-bold text-primary">
            {formatDealValue(Math.max(...deals.map(d => d.value), 0))}
          </div>
        </div>
      </div>

      {/* Insight */}
      {dominantCategory.count > 0 && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{dominantCategory.percentage.toFixed(0)}%</span> of deals are in the{' '}
            <span className={`font-semibold ${dominantCategory.color}`}>{dominantCategory.name}</span> category,
            accounting for <span className="font-semibold text-foreground">{formatDealValue(dominantCategory.totalValue)}</span> in total value.
          </p>
        </div>
      )}
    </div>
  );
}
