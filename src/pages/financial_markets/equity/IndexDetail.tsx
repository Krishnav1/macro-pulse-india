// Index Detail Page - Deep dive into individual index with tabs

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { useMarketIndices } from '@/hooks/equity/useMarketIndices';
import { useIndexConstituents } from '@/hooks/equity/useIndexConstituents';
import { IndexOverview } from '@/components/equity/detail/IndexOverview';
import { AllStocksTab } from '@/components/equity/detail/AllStocksTab';
import { GainersTab } from '@/components/equity/detail/GainersTab';
import { LosersTab } from '@/components/equity/detail/LosersTab';
import { MostActiveTab } from '@/components/equity/detail/MostActiveTab';

type TabType = 'overview' | 'all' | 'gainers' | 'losers' | 'active';

export default function IndexDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { indices, loading: indicesLoading } = useMarketIndices();
  
  // Find the index by slug
  const index = indices.find(i => 
    i.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug
  );

  const { constituents, stockPrices, loading: constituentsLoading } = useIndexConstituents(
    index?.name || ''
  );

  if (indicesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading index data...</p>
        </div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Index Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested index could not be found.</p>
          <Link to="/financial-markets/equity-markets/indices" className="text-primary hover:underline">
            Back to Indices
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = (index.change_percent || 0) >= 0;
  const gainers = stockPrices.filter(s => (s.change_percent || 0) > 0).length;
  const losers = stockPrices.filter(s => (s.change_percent || 0) < 0).length;

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'all' as TabType, label: 'All Stocks', icon: Users, count: stockPrices.length },
    { id: 'gainers' as TabType, label: 'Gainers', icon: TrendingUp, count: gainers },
    { id: 'losers' as TabType, label: 'Losers', icon: TrendingDown, count: losers },
    { id: 'active' as TabType, label: 'Most Active', icon: BarChart3 },
  ];

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

        {/* Index Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{index.name}</h1>
              <p className="text-muted-foreground">{index.symbol}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground mb-1">
                {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{index.change?.toFixed(2)} ({isPositive ? '+' : ''}{index.change_percent?.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="dashboard-card">
              <div className="text-xs text-muted-foreground mb-1">Open</div>
              <div className="text-lg font-semibold text-foreground">
                {index.open?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="dashboard-card">
              <div className="text-xs text-muted-foreground mb-1">High</div>
              <div className="text-lg font-semibold text-success">
                {index.high?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="dashboard-card">
              <div className="text-xs text-muted-foreground mb-1">Low</div>
              <div className="text-lg font-semibold text-destructive">
                {index.low?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="dashboard-card">
              <div className="text-xs text-muted-foreground mb-1">Prev Close</div>
              <div className="text-lg font-semibold text-foreground">
                {index.previous_close?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
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
          {activeTab === 'overview' && (
            <IndexOverview 
              index={index} 
              constituents={constituents}
              stockPrices={stockPrices}
              loading={constituentsLoading}
            />
          )}
          {activeTab === 'all' && (
            <AllStocksTab 
              stockPrices={stockPrices}
              loading={constituentsLoading}
            />
          )}
          {activeTab === 'gainers' && (
            <GainersTab 
              stockPrices={stockPrices.filter(s => (s.change_percent || 0) > 0)}
              loading={constituentsLoading}
            />
          )}
          {activeTab === 'losers' && (
            <LosersTab 
              stockPrices={stockPrices.filter(s => (s.change_percent || 0) < 0)}
              loading={constituentsLoading}
            />
          )}
          {activeTab === 'active' && (
            <MostActiveTab 
              stockPrices={stockPrices}
              loading={constituentsLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
