// Indices Dashboard - Main equity markets overview page

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, BarChart3, Clock, ChevronDown } from 'lucide-react';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { useMarketIndices } from '@/hooks/equity/useMarketIndices';

export default function IndicesDashboard() {
  const { indices, loading, error, lastUpdated } = useMarketIndices();

  // Calculate summary stats
  const gainers = indices.filter(i => (i.change_percent || 0) > 0).length;
  const losers = indices.filter(i => (i.change_percent || 0) < 0).length;
  const avgChange = indices.length > 0
    ? indices.reduce((sum, i) => sum + (i.change_percent || 0), 0) / indices.length
    : 0;

  // Top performers
  const topGainers = [...indices]
    .filter(i => i.change_percent && i.change_percent > 0)
    .sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))
    .slice(0, 5);
  
  const topLosers = [...indices]
    .filter(i => i.change_percent && i.change_percent < 0)
    .sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))
    .slice(0, 5);

  // Top 10 indices by market cap (using last_price as proxy)
  const top10Indices = [...indices]
    .sort((a, b) => (b.last_price || 0) - (a.last_price || 0))
    .slice(0, 10);

  const [showAllIndices, setShowAllIndices] = useState(false);

  // Format last updated time
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Market Ticker */}
      <CompactMarketTicker />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header with Last Updated */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-1">
              Market Indices
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last Updated: {formatTime(lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* Compact Market Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-success/10 border border-success/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Advancing</span>
            </div>
            <div className="text-2xl font-bold text-success">{gainers}</div>
            <div className="text-xs text-muted-foreground">Indices in green</div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Declining</span>
            </div>
            <div className="text-2xl font-bold text-destructive">{losers}</div>
            <div className="text-xs text-muted-foreground">Indices in red</div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg Change</span>
            </div>
            <div className={`text-2xl font-bold ${avgChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">Market sentiment</div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{indices.length}</div>
            <div className="text-xs text-muted-foreground">Indices tracked</div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4 text-destructive text-sm">
            Error loading indices: {error}
          </div>
        )}

        {/* Market Analysis Section */}
        {!loading && indices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Top Gainers */}
            <div className="dashboard-card">
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Top 5 Gainers
              </h3>
              <div className="space-y-2">
                {topGainers.map((index) => (
                  <div key={index.id} className="flex items-center justify-between p-2 bg-success/5 rounded-lg">
                    <Link
                      to={`/financial-markets/equity-markets/index/${index.symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {index.name}
                    </Link>
                    <div className="text-right">
                      <div className="text-sm font-bold text-success">
                        +{index.change_percent?.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="dashboard-card">
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Top 5 Losers
              </h3>
              <div className="space-y-2">
                {topLosers.map((index) => (
                  <div key={index.id} className="flex items-center justify-between p-2 bg-destructive/5 rounded-lg">
                    <Link
                      to={`/financial-markets/equity-markets/index/${index.symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {index.name}
                    </Link>
                    <div className="text-right">
                      <div className="text-sm font-bold text-destructive">
                        {index.change_percent?.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Indices Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              {showAllIndices ? 'All Indices' : 'Top 10 Indices'}
            </h2>
            {indices.length > 10 && (
              <button
                onClick={() => setShowAllIndices(!showAllIndices)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {showAllIndices ? 'Show Less' : `Show All ${indices.length} Indices`}
                <ChevronDown className={`h-4 w-4 transition-transform ${showAllIndices ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="dashboard-card animate-pulse">
              <div className="h-96 bg-muted rounded"></div>
            </div>
          ) : (
            <div className="dashboard-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Index</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Last Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Change</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Change %</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Open</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">High</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Low</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Prev Close</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">52W High</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">52W Low</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllIndices ? indices : top10Indices).map((index) => {
                    const isPositive = (index.change_percent || 0) >= 0;
                    return (
                      <tr key={index.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/financial-markets/equity-markets/index/${index.symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {index.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">
                          {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{index.change?.toFixed(2)}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{index.change_percent?.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {index.open?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-success">
                          {index.high?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-destructive">
                          {index.low?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {index.previous_close?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {index.year_high?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {index.year_low?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/financial-markets/equity-markets/bulk-deals"
            className="group bg-card border border-border hover:border-primary rounded-lg p-3 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Bulk & Block Deals</h3>
            </div>
            <p className="text-xs text-muted-foreground">Institutional activity</p>
          </Link>

          <Link
            to="/financial-markets/fii-dii-activity"
            className="group bg-card border border-border hover:border-primary rounded-lg p-3 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold text-foreground">FII/DII Activity</h3>
            </div>
            <p className="text-xs text-muted-foreground">Foreign & domestic flows</p>
          </Link>

          <Link
            to="/financial-markets/equity-markets/comparison"
            className="group bg-card border border-border hover:border-primary rounded-lg p-3 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-foreground">Compare Indices</h3>
            </div>
            <p className="text-xs text-muted-foreground">Side-by-side comparison</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
