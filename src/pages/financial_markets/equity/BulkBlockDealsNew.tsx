// Redesigned Bulk & Block Deals Analysis Platform

import { useState } from 'react';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { DealsHeader } from '@/components/equity/deals/DealsHeader';
import { DealsKPICards } from '@/components/equity/deals/DealsKPICards';
import { DealsAnalysisTab } from '@/components/equity/deals/DealsAnalysisTab';
import { InvestorTrackerTab } from '@/components/equity/deals/InvestorTrackerTab';
import { BulkDealsTable } from '@/components/equity/deals/BulkDealsTable';
import { BlockDealsTable } from '@/components/equity/deals/BlockDealsTable';
import { useDealsAnalysis } from '@/hooks/equity/useDealsAnalysis';
import { 
  TimePeriodType, 
  getDateRangeFromPeriod, 
  getDefaultPeriod 
} from '@/utils/financialYearUtils';

type TabType = 'analysis' | 'investors' | 'bulk' | 'block';

export default function BulkBlockDealsNew() {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  
  // Default to latest complete month
  const defaultPeriod = getDefaultPeriod();
  const [periodType, setPeriodType] = useState<TimePeriodType>(defaultPeriod.type);
  const [periodValue, setPeriodValue] = useState<string>(defaultPeriod.value);
  
  // Get date range from current selection
  const dateRange = getDateRangeFromPeriod(periodType, periodValue);
  
  // Fetch data using the comprehensive hook
  const {
    bulkDeals,
    blockDeals,
    allDeals,
    kpiData,
    sectorData,
    stockData,
    investorData,
    trendData,
    repeatActivity,
    loading,
    error,
    refreshData
  } = useDealsAnalysis(dateRange, 'all');

  const tabs = [
    { 
      id: 'analysis' as TabType, 
      label: 'Analysis', 
      description: 'Market insights & trends'
    },
    { 
      id: 'investors' as TabType, 
      label: 'Investor Tracker', 
      description: 'Deep dive into investors'
    },
    { 
      id: 'bulk' as TabType, 
      label: 'Bulk Deals', 
      count: bulkDeals.length,
      description: 'Raw bulk deals data'
    },
    { 
      id: 'block' as TabType, 
      label: 'Block Deals', 
      count: blockDeals.length,
      description: 'Raw block deals data'
    },
  ];

  const handlePeriodChange = (type: TimePeriodType, value?: string) => {
    setPeriodType(type);
    setPeriodValue(value || '');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <CompactMarketTicker />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Data</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CompactMarketTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with Period Selector */}
        <DealsHeader
          periodType={periodType}
          periodValue={periodValue}
          dateRange={dateRange}
          onPeriodChange={handlePeriodChange}
        />

        {/* KPI Cards */}
        <DealsKPICards 
          kpiData={kpiData} 
          loading={loading}
          dateRange={dateRange}
        />

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start px-6 py-4 border-b-2 transition-colors whitespace-nowrap min-w-0 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-medium bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === tab.id 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.count.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {tab.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'analysis' && (
            <DealsAnalysisTab
              kpiData={kpiData}
              sectorData={sectorData}
              stockData={stockData}
              trendData={trendData}
              repeatActivity={repeatActivity}
              loading={loading}
              dateRange={dateRange}
              allDeals={allDeals}
            />
          )}
          
          {activeTab === 'investors' && (
            <InvestorTrackerTab
              investorData={investorData}
              allDeals={allDeals}
              loading={loading}
              dateRange={dateRange}
            />
          )}
          
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Bulk Deals ({bulkDeals.length.toLocaleString()})
                </h3>
                <div className="text-sm text-muted-foreground">
                  {dateRange.label}
                </div>
              </div>
              <BulkDealsTable deals={bulkDeals} loading={loading} />
            </div>
          )}
          
          {activeTab === 'block' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Block Deals ({blockDeals.length.toLocaleString()})
                </h3>
                <div className="text-sm text-muted-foreground">
                  {dateRange.label}
                </div>
              </div>
              <BlockDealsTable deals={blockDeals} loading={loading} />
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-primary/20 rounded-full mt-0.5">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div className="text-sm text-foreground">
              <p className="font-medium mb-1">Smart Money Analysis</p>
              <p className="text-muted-foreground">
                Track institutional activity and smart money movements. Bulk deals (&gt;0.5% equity) and 
                block deals (large private transactions) provide insights into institutional sentiment. 
                Data updates daily after market close (6 PM IST).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
