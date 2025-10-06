// Sector Momentum Tracker - Track sector-wise buying/selling activity

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Deal } from '@/hooks/equity/useDealsAnalysis';
import { formatDealValue } from '@/utils/currencyFormatter';
import { getSectorForStock } from '@/utils/financialYearUtils';

interface SectorMomentumTrackerProps {
  deals: Deal[];
  loading: boolean;
}

interface SectorData {
  sector: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
  dealCount: number;
  momentum: 'bullish' | 'bearish' | 'neutral';
  momentumScore: number;
}

export function SectorMomentumTracker({ deals, loading }: SectorMomentumTrackerProps) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Aggregate by sector
  const sectorMap = new Map<string, SectorData>();

  deals.forEach(deal => {
    const sector = getSectorForStock(deal.symbol);
    
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, {
        sector,
        buyValue: 0,
        sellValue: 0,
        netValue: 0,
        dealCount: 0,
        momentum: 'neutral',
        momentumScore: 0
      });
    }

    const sectorData = sectorMap.get(sector)!;
    const isBuy = deal.deal_type?.toLowerCase() === 'buy';
    
    if (isBuy) {
      sectorData.buyValue += deal.value;
    } else {
      sectorData.sellValue += deal.value;
    }
    
    sectorData.dealCount++;
  });

  // Calculate momentum
  sectorMap.forEach(sector => {
    sector.netValue = sector.buyValue - sector.sellValue;
    const totalValue = sector.buyValue + sector.sellValue;
    
    if (totalValue > 0) {
      // Momentum score: -100 (all selling) to +100 (all buying)
      sector.momentumScore = ((sector.buyValue - sector.sellValue) / totalValue) * 100;
      
      if (sector.momentumScore > 20) {
        sector.momentum = 'bullish';
      } else if (sector.momentumScore < -20) {
        sector.momentum = 'bearish';
      } else {
        sector.momentum = 'neutral';
      }
    }
  });

  // Sort by absolute net value (most active sectors first)
  const sectors = Array.from(sectorMap.values())
    .sort((a, b) => Math.abs(b.netValue) - Math.abs(a.netValue));

  const getMomentumConfig = (momentum: 'bullish' | 'bearish' | 'neutral') => {
    switch (momentum) {
      case 'bullish':
        return {
          icon: TrendingUp,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-l-4 border-success',
          label: 'Bullish'
        };
      case 'bearish':
        return {
          icon: TrendingDown,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-l-4 border-destructive',
          label: 'Bearish'
        };
      case 'neutral':
        return {
          icon: Minus,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/30',
          borderColor: 'border-l-4 border-muted',
          label: 'Neutral'
        };
    }
  };

  // Calculate summary stats
  const bullishSectors = sectors.filter(s => s.momentum === 'bullish').length;
  const bearishSectors = sectors.filter(s => s.momentum === 'bearish').length;
  const neutralSectors = sectors.filter(s => s.momentum === 'neutral').length;

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sector Momentum Tracker</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Net buying/selling activity across sectors
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span className="text-muted-foreground">{bullishSectors} Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive"></div>
            <span className="text-muted-foreground">{bearishSectors} Bearish</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            <span className="text-muted-foreground">{neutralSectors} Neutral</span>
          </div>
        </div>
      </div>

      {/* Sectors List */}
      <div className="space-y-3">
        {sectors.length > 0 ? (
          sectors.map((sector, index) => {
            const config = getMomentumConfig(sector.momentum);
            const Icon = config.icon;
            const totalValue = sector.buyValue + sector.sellValue;

            return (
              <div
                key={sector.sector}
                className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{sector.sector}</div>
                      <div className="text-xs text-muted-foreground">
                        {sector.dealCount} deals • {formatDealValue(totalValue)} total
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Score: {sector.momentumScore.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Buy/Sell Breakdown */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Buying</div>
                    <div className="font-semibold text-success">
                      {formatDealValue(sector.buyValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Selling</div>
                    <div className="font-semibold text-destructive">
                      {formatDealValue(sector.sellValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Net Flow</div>
                    <div className={`font-semibold ${sector.netValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {sector.netValue >= 0 ? '+' : ''}{formatDealValue(sector.netValue)}
                    </div>
                  </div>
                </div>

                {/* Momentum Bar */}
                <div className="mt-3 relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 ${sector.netValue >= 0 ? 'bg-success left-1/2' : 'bg-destructive right-1/2'} transition-all duration-500`}
                    style={{ 
                      width: `${Math.min(Math.abs(sector.momentumScore) / 2, 50)}%` 
                    }}
                  ></div>
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-border"></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Minus className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No sector data available for the selected period
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Momentum Score:</strong> Ranges from -100 (all selling) to +100 (all buying)</p>
          <p><strong>Bullish:</strong> Score &gt; 20 (net buying dominates)</p>
          <p><strong>Bearish:</strong> Score &lt; -20 (net selling dominates)</p>
          <p><strong>Neutral:</strong> Score between -20 and 20 (balanced activity)</p>
        </div>
      </div>
    </div>
  );
}
