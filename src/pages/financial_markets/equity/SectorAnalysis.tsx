// Sector Analysis Page - Detailed sector performance analysis

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { useSectorData } from '@/hooks/financial/useSectorData';

const SECTORS = [
  { name: 'IT', symbol: '^CNXIT', color: 'from-blue-500 to-blue-600' },
  { name: 'Banking', symbol: '^NSEBANK', color: 'from-green-500 to-green-600' },
  { name: 'Auto', symbol: '^CNXAUTO', color: 'from-purple-500 to-purple-600' },
  { name: 'Pharma', symbol: '^CNXPHARMA', color: 'from-pink-500 to-pink-600' },
  { name: 'FMCG', symbol: '^CNXFMCG', color: 'from-yellow-500 to-yellow-600' },
  { name: 'Metal', symbol: '^CNXMETAL', color: 'from-gray-500 to-gray-600' },
  { name: 'Energy', symbol: '^CNXENERGY', color: 'from-orange-500 to-orange-600' },
  { name: 'Realty', symbol: '^CNXREALTY', color: 'from-red-500 to-red-600' },
  { name: 'Financial Services', symbol: '^CNXFINANCE', color: 'from-indigo-500 to-indigo-600' },
  { name: 'Media', symbol: '^CNXMEDIA', color: 'from-cyan-500 to-cyan-600' },
  { name: 'PSU Bank', symbol: '^CNXPSUBANK', color: 'from-teal-500 to-teal-600' },
];

export default function SectorAnalysis() {
  const { sectors, loading } = useSectorData();

  const getSectorColor = (change: number) => {
    if (change >= 2) return 'bg-success/20 border-success text-success';
    if (change >= 0.5) return 'bg-success/10 border-success/50 text-success';
    if (change >= -0.5) return 'bg-muted border-border text-muted-foreground';
    if (change >= -2) return 'bg-destructive/10 border-destructive/50 text-destructive';
    return 'bg-destructive/20 border-destructive text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      <CompactMarketTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/financial-markets/equity-markets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Equity Markets
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Sector Analysis
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of all major sectors with performance metrics
          </p>
        </div>

        {/* Sector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {SECTORS.map((sector) => {
            const sectorData = sectors.find((s: any) => s.symbol === sector.symbol) as any;
            const change = sectorData?.change || 0;
            const isPositive = change >= 0;

            return (
              <div
                key={sector.symbol}
                className={`dashboard-card border-2 transition-all hover:scale-105 cursor-pointer ${getSectorColor(change)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{sector.name}</h3>
                    <p className="text-xs opacity-70">{sector.symbol}</p>
                  </div>
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold mb-1">
                      {sectorData?.last?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
                      <span className="opacity-70">
                        ({isPositive ? '+' : ''}{sectorData?.variation?.toFixed(2) || '0.00'})
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="dashboard-card bg-success/5 border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="text-xs text-muted-foreground">Outperforming</div>
            </div>
            <div className="text-2xl font-bold text-success">
              {sectors.filter((s: any) => (s.change || 0) > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Sectors in green</div>
          </div>

          <div className="dashboard-card bg-destructive/5 border-destructive/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-xs text-muted-foreground">Underperforming</div>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {sectors.filter((s: any) => (s.change || 0) < 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Sectors in red</div>
          </div>

          <div className="dashboard-card bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Avg Change</div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {sectors.length > 0
                ? (sectors.reduce((sum: number, s: any) => sum + (s.change || 0), 0) / sectors.length).toFixed(2)
                : '0.00'}%
            </div>
            <div className="text-sm text-muted-foreground">Market sentiment</div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="dashboard-card bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-3">Sector Rotation Analysis</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Market Leadership:</strong>{' '}
              {sectors.length > 0 && (
                <>
                  {(sectors as any[]).sort((a, b) => (b.change || 0) - (a.change || 0))[0]?.index || 'N/A'} is leading with{' '}
                  {(sectors as any[]).sort((a, b) => (b.change || 0) - (a.change || 0))[0]?.change?.toFixed(2) || '0.00'}% gain.
                </>
              )}
            </p>
            <p>
              <strong className="text-foreground">Sector Breadth:</strong>{' '}
              {sectors.filter((s: any) => (s.change || 0) > 0).length} out of {sectors.length} sectors are positive,
              indicating {sectors.filter((s: any) => (s.change || 0) > 0).length > sectors.length / 2 ? 'broad-based' : 'selective'} market movement.
            </p>
            <p>
              <strong className="text-foreground">Rotation Signal:</strong>{' '}
              Monitor sector performance for rotation opportunities. Strong sectors may continue momentum while weak sectors could offer value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
