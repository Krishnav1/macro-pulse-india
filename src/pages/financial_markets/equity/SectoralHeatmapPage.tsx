// Sectoral Heatmap Page - Live sector performance visualization

import { useState } from 'react';
import { ArrowLeft, RefreshCw, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { SectorHeatmapGrid } from '@/components/financial/SectorHeatmapGrid';
import { MetricCard } from '@/components/financial/MetricCard';
import { useSectorData } from '@/hooks/financial/useSectorData';

export default function SectoralHeatmapPage() {
  const [useLiveData, setUseLiveData] = useState(true);
  const { sectors, loading, error, lastUpdated } = useSectorData(useLiveData);

  // Calculate summary stats
  const gainers = sectors.filter((s) => s.change_percent > 0).length;
  const losers = sectors.filter((s) => s.change_percent < 0).length;
  const avgChange =
    sectors.length > 0
      ? sectors.reduce((sum, s) => sum + s.change_percent, 0) / sectors.length
      : 0;
  const topGainer = sectors.reduce(
    (max, s) => (s.change_percent > max.change_percent ? s : max),
    sectors[0] || { sector_name: 'N/A', change_percent: 0 }
  );
  const topLoser = sectors.reduce(
    (min, s) => (s.change_percent < min.change_percent ? s : min),
    sectors[0] || { sector_name: 'N/A', change_percent: 0 }
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Market Ticker */}
      <CompactMarketTicker />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/financial-markets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Financial Markets
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
              Sectoral Heatmap
            </h1>
            <p className="text-muted-foreground">
              Live performance tracking of all major NSE sectors
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseLiveData(!useLiveData)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                useLiveData
                  ? 'bg-success/20 border-success/30 text-success'
                  : 'bg-muted border-border text-muted-foreground'
              }`}
            >
              {useLiveData ? 'Live Data' : 'Historical Data'}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Gainers"
            value={gainers}
            loading={loading}
            iconColor="text-success"
          />
          <MetricCard
            label="Losers"
            value={losers}
            loading={loading}
            iconColor="text-destructive"
          />
          <MetricCard
            label="Average Change"
            value={`${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`}
            loading={loading}
            iconColor={avgChange >= 0 ? 'text-success' : 'text-destructive'}
          />
          <MetricCard
            label="Last Updated"
            value={
              lastUpdated
                ? lastUpdated.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'
            }
            loading={loading}
            iconColor="text-primary"
          />
        </div>

        {/* Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium mb-1">How to read the heatmap:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong className="text-success">Dark Green:</strong> Strong gains (+3% or more)
              </li>
              <li>
                <strong className="text-success">Light Green:</strong> Moderate gains (+1% to +3%)
              </li>
              <li>
                <strong className="text-muted-foreground">Gray:</strong> Neutral (-1% to +1%)
              </li>
              <li>
                <strong className="text-destructive">Light Red:</strong> Moderate losses (-1% to -3%)
              </li>
              <li>
                <strong className="text-destructive">Dark Red:</strong> Strong losses (-3% or more)
              </li>
            </ul>
          </div>
        </div>

        {/* Top Performers */}
        {!loading && sectors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Top Gainer</div>
              <div className="text-2xl font-bold text-success">
                {topGainer.sector_name}
              </div>
              <div className="text-lg font-semibold text-success">
                +{topGainer.change_percent.toFixed(2)}%
              </div>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Top Loser</div>
              <div className="text-2xl font-bold text-destructive">
                {topLoser.sector_name}
              </div>
              <div className="text-lg font-semibold text-destructive">
                {topLoser.change_percent.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive">
            Error loading sector data: {error}
          </div>
        )}

        {/* Heatmap Grid */}
        <SectorHeatmapGrid sectors={sectors} loading={loading} />
      </div>
    </div>
  );
}
