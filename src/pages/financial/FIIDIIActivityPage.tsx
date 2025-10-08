import { useState, useEffect } from 'react';
import { useFIIDIIData, useFIIDIIFinancialYears, useFIIDIIMonths } from '@/hooks/financial/useFIIDIIData';
import { FIIDIIKPICards } from '@/components/financial/fii-dii/FIIDIIKPICards';
import { MoneyFlowChart } from '@/components/financial/fii-dii/MoneyFlowChart';
import { AssetAllocationCharts } from '@/components/financial/fii-dii/AssetAllocationCharts';
import { CumulativeFlowChart } from '@/components/financial/fii-dii/CumulativeFlowChart';
import { SegmentBreakdownTabs } from '@/components/financial/fii-dii/SegmentBreakdownTabs';

export default function FIIDIIActivityPage() {
  const [view, setView] = useState<'monthly' | 'daily' | 'quarterly'>('monthly');
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const { years, loading: yearsLoading } = useFIIDIIFinancialYears();
  const { months } = useFIIDIIMonths(selectedFY);
  
  const { monthlyData, dailyData, derivativesData, loading, fetchDerivativesData } = useFIIDIIData({
    view,
    financialYear: selectedFY,
    month: selectedMonth,
  });

  useEffect(() => {
    if (years.length > 0 && !selectedFY) {
      setSelectedFY(years[0]);
    }
  }, [years]);

  useEffect(() => {
    if (view === 'daily' && dailyData.length > 0) {
      const latestDate = dailyData[dailyData.length - 1]?.date;
      if (latestDate) {
        fetchDerivativesData(latestDate);
      }
    }
  }, [view, dailyData]);

  if (loading || yearsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FII/DII data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">FII/DII Activity</h1>
            
            <div className="flex items-center gap-3">
              {/* Month Selector (only for daily view) */}
              {view === 'daily' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}

              {/* FY Selector */}
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <select
                value={view}
                onChange={(e) => setView(e.target.value as 'monthly' | 'daily' | 'quarterly')}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <FIIDIIKPICards data={monthlyData} view={view} />

        {/* Money Flow Comparison Chart */}
        <MoneyFlowChart data={monthlyData} />

        {/* Asset Allocation Charts */}
        <AssetAllocationCharts data={monthlyData} />

        {/* Cumulative Flow Trend */}
        <CumulativeFlowChart data={monthlyData} />

        {/* Segment Breakdown Tabs */}
        {(view === 'daily' && dailyData.length > 0) && (
          <SegmentBreakdownTabs dailyData={dailyData} derivativesData={derivativesData} />
        )}
      </div>
    </div>
  );
}
