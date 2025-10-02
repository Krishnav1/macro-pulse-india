// Sector Heatmap Grid Component - Visual heatmap of sector performance

import { SectorHeatmapData } from '@/types/financial-markets.types';
import { getSectorColorIntensity, getSectorColorClass, formatMarketCap } from '@/utils/financial/sectorUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SectorHeatmapGridProps {
  sectors: SectorHeatmapData[];
  loading?: boolean;
}

export function SectorHeatmapGrid({ sectors, loading }: SectorHeatmapGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(11)].map((_, i) => (
          <div key={i} className="bg-muted rounded-lg h-36 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (sectors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No sector data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sectors.map((sector) => {
        const intensity = getSectorColorIntensity(sector.change_percent);
        const colorClass = getSectorColorClass(intensity);
        const isPositive = sector.change_percent >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;

        return (
          <div
            key={sector.sector_slug}
            className={`rounded-lg border-2 p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${colorClass}`}
          >
            {/* Sector Name */}
            <div className="mb-4">
              <h3 className="font-bold text-base mb-1.5">{sector.sector_name}</h3>
              <div className="text-xs opacity-70 font-mono">
                {sector.price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* Change Percentage */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {isPositive ? '+' : ''}
                {sector.change_percent.toFixed(2)}%
              </span>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-1.5 text-xs opacity-70 border-t border-current/20 pt-3">
              {sector.market_cap > 0 && (
                <div className="font-medium">Cap: {formatMarketCap(sector.market_cap)}</div>
              )}
              <div className="flex justify-between gap-4">
                {sector.pe_ratio && (
                  <div>
                    <span className="opacity-60">PE:</span>{' '}
                    <span className="font-semibold">{sector.pe_ratio.toFixed(1)}</span>
                  </div>
                )}
                {sector.pb_ratio && (
                  <div>
                    <span className="opacity-60">PB:</span>{' '}
                    <span className="font-semibold">{sector.pb_ratio.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
