// Bulk & Block Deals Page - Track institutional activity

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Building2 } from 'lucide-react';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { useBulkDeals } from '@/hooks/equity/useBulkDeals';
import { useBlockDeals } from '@/hooks/equity/useBlockDeals';
import { BulkDealsTable } from '@/components/equity/deals/BulkDealsTable';
import { BlockDealsTable } from '@/components/equity/deals/BlockDealsTable';
import { DealsAnalysis } from '@/components/equity/deals/DealsAnalysis';
import { InvestorTracker } from '@/components/equity/deals/InvestorTracker';

type TabType = 'bulk' | 'block' | 'analysis' | 'investors';

export default function BulkBlockDeals() {
  const [activeTab, setActiveTab] = useState<TabType>('bulk');
  const [daysFilter, setDaysFilter] = useState(7);

  const { deals: bulkDeals, loading: bulkLoading } = useBulkDeals(daysFilter);
  const { deals: blockDeals, loading: blockLoading } = useBlockDeals(daysFilter);

  const tabs = [
    { id: 'bulk' as TabType, label: 'Bulk Deals', icon: TrendingUp, count: bulkDeals.length },
    { id: 'block' as TabType, label: 'Block Deals', icon: TrendingDown, count: blockDeals.length },
    { id: 'analysis' as TabType, label: 'Analysis', icon: Building2 },
    { id: 'investors' as TabType, label: 'Investor Tracker', icon: Users },
  ];

  const totalBuyValue = bulkDeals
    .filter(d => d.deal_type === 'buy')
    .reduce((sum, d) => sum + ((d.quantity || 0) * (d.avg_price || 0)), 0);

  const totalSellValue = bulkDeals
    .filter(d => d.deal_type === 'sell')
    .reduce((sum, d) => sum + ((d.quantity || 0) * (d.avg_price || 0)), 0);

  return (
    <div className="min-h-screen bg-background">
      <CompactMarketTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/financial-markets/equity-markets/indices"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Indices
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Bulk & Block Deals
          </h1>
          <p className="text-muted-foreground">
            Track institutional activity and smart money movements
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="dashboard-card bg-success/5 border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="text-xs text-muted-foreground">Total Buying</div>
            </div>
            <div className="text-2xl font-bold text-success">
              ₹{(totalBuyValue / 10000000).toFixed(2)} Cr
            </div>
          </div>

          <div className="dashboard-card bg-destructive/5 border-destructive/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-xs text-muted-foreground">Total Selling</div>
            </div>
            <div className="text-2xl font-bold text-destructive">
              ₹{(totalSellValue / 10000000).toFixed(2)} Cr
            </div>
          </div>

          <div className="dashboard-card bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xs text-muted-foreground">Bulk Deals</div>
            </div>
            <div className="text-2xl font-bold text-primary">{bulkDeals.length}</div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground">Block Deals</div>
            </div>
            <div className="text-2xl font-bold text-foreground">{blockDeals.length}</div>
          </div>
        </div>

        {/* Days Filter */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Show data for:</span>
          <div className="flex gap-2">
            {[7, 15, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDaysFilter(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  daysFilter === days
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'bulk' && (
            <BulkDealsTable deals={bulkDeals} loading={bulkLoading} />
          )}
          {activeTab === 'block' && (
            <BlockDealsTable deals={blockDeals} loading={blockLoading} />
          )}
          {activeTab === 'analysis' && (
            <DealsAnalysis bulkDeals={bulkDeals} blockDeals={blockDeals} loading={bulkLoading || blockLoading} />
          )}
          {activeTab === 'investors' && (
            <InvestorTracker bulkDeals={bulkDeals} blockDeals={blockDeals} loading={bulkLoading || blockLoading} />
          )}
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> Bulk deals are transactions where the quantity traded is more than 0.5% of the company's equity.
            Block deals are large single transactions negotiated privately between parties. Data is updated daily after market close (6 PM IST).
          </p>
        </div>
      </div>
    </div>
  );
}
