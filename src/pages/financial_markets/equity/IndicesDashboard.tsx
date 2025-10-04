// Indices Dashboard - Main equity markets overview page

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { IndexCard } from '@/components/equity/IndexCard';
import { MarketSummary } from '@/components/equity/MarketSummary';
import { IndexComparison } from '@/components/equity/IndexComparison';
import { useMarketIndices } from '@/hooks/equity/useMarketIndices';
import { NSESyncService } from '@/services/equity/nseSyncService';
import { useToast } from '@/hooks/use-toast';

export default function IndicesDashboard() {
  const { indices, loading, error, refresh } = useMarketIndices();
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await NSESyncService.syncIndices();
      if (result.success) {
        toast({
          title: 'Sync Successful',
          description: `Updated ${result.count} indices`,
        });
        refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast({
        title: 'Sync Failed',
        description: err instanceof Error ? err.message : 'Failed to sync data',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  // Calculate summary stats
  const gainers = indices.filter(i => (i.change_percent || 0) > 0).length;
  const losers = indices.filter(i => (i.change_percent || 0) < 0).length;
  const avgChange = indices.length > 0
    ? indices.reduce((sum, i) => sum + (i.change_percent || 0), 0) / indices.length
    : 0;

  // Major indices for comparison
  const majorIndices = indices.filter(i => 
    ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO', 'NIFTY PHARMA', 'NIFTY FMCG'].includes(i.name)
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
              Market Indices
            </h1>
            <p className="text-muted-foreground">
              Live tracking of all NSE indices with detailed analysis
            </p>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Market Summary */}
        <MarketSummary
          gainers={gainers}
          losers={losers}
          avgChange={avgChange}
          totalIndices={indices.length}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive">
            Error loading indices: {error}
          </div>
        )}

        {/* Index Comparison Chart */}
        {majorIndices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Index Comparison</h2>
            <IndexComparison indices={majorIndices} loading={loading} />
          </div>
        )}

        {/* All Indices Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">All Indices</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="dashboard-card animate-pulse">
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indices.map((index) => (
                <IndexCard key={index.id} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/financial-markets/equity-markets/bulk-deals"
            className="group dashboard-card hover:border-primary transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Bulk & Block Deals
                </h3>
                <p className="text-sm text-muted-foreground">Track institutional activity</p>
              </div>
            </div>
          </Link>

          <Link
            to="/financial-markets/fii-dii-activity"
            className="group dashboard-card hover:border-primary transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  FII/DII Activity
                </h3>
                <p className="text-sm text-muted-foreground">Foreign & domestic flows</p>
              </div>
            </div>
          </Link>

          <Link
            to="/financial-markets/equity-markets/sector-analysis"
            className="group dashboard-card hover:border-primary transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
                <TrendingDown className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Sector Analysis
                </h3>
                <p className="text-sm text-muted-foreground">Detailed sector performance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/financial-markets/equity-markets/comparison"
            className="group dashboard-card hover:border-primary transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Compare Indices
                </h3>
                <p className="text-sm text-muted-foreground">Side-by-side comparison</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> Data is updated every 15 minutes during market hours (9:15 AM - 3:30 PM IST).
            Click on any index to view detailed constituent analysis, gainers, losers, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
