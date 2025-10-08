import { useState, useEffect } from 'react';
import { useCashProvisionalData, useFIIDIIFinancialYears, useFIIDIIMonths, useFIICashData, useDIICashData } from '@/hooks/financial/useFIIDIIDataNew';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FIIDIIKPICards } from '@/components/financial/fii-dii/FIIDIIKPICards';
import { MoneyFlowChart } from '@/components/financial/fii-dii/MoneyFlowChart';
import { AssetAllocationCharts } from '@/components/financial/fii-dii/AssetAllocationCharts';
import { CumulativeFlowChart } from '@/components/financial/fii-dii/CumulativeFlowChart';
import { VirtualDataTable } from '@/components/financial/fii-dii/VirtualDataTable';
import { LazyChartWrapper } from '@/components/financial/fii-dii/LazyChartWrapper';
import { SegmentBreakdown } from '@/components/financial/fii-dii/SegmentBreakdown';
import { FlowHeatmapCalendar } from '@/components/financial/fii-dii/FlowHeatmapCalendar';
import { ComparisonTools } from '@/components/financial/fii-dii/ComparisonTools';
import { SegmentAnalysisTabs } from '@/components/financial/fii-dii/SegmentAnalysisTabs';
import { ContextualHelp } from '@/components/financial/fii-dii/ContextualHelp';

export default function FIIDIIActivityPage() {
  const [view, setView] = useState<'yearly' | 'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [periodDisplay, setPeriodDisplay] = useState<string>('');
  const [periodBadge, setPeriodBadge] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<'cash_provisional' | 'fii_cash' | 'dii_cash'>('cash_provisional');

  const { years, loading: yearsLoading } = useFIIDIIFinancialYears();
  const { months } = useFIIDIIMonths(selectedFY);
  
  const { data: cashProvisionalData, loading } = useCashProvisionalData({
    financialYear: selectedFY,
    month: selectedMonth,
  });

  const { data: fiiCashData } = useFIICashData({
    financialYear: selectedFY,
    month: selectedMonth,
  });

  const { data: diiCashData } = useDIICashData({
    financialYear: selectedFY,
    month: selectedMonth,
  });

  // Get current dataset based on selection
  const currentTableData = selectedDataset === 'fii_cash' ? fiiCashData : 
                           selectedDataset === 'dii_cash' ? diiCashData : 
                           cashProvisionalData;

  // Set defaults on page load - latest data
  useEffect(() => {
    if (years.length > 0 && !selectedFY) {
      setSelectedFY(years[0]);
    }
  }, [years, selectedFY]);

  // Auto-select latest month when months are loaded
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      const latestMonth = months[months.length - 1]; // Last month is latest
      setSelectedMonth(latestMonth.label);
      setPeriodDisplay(latestMonth.label);
    }
  }, [months, selectedMonth]);

  // Update period display based on view and selection
  useEffect(() => {
    if (view === 'daily' && selectedDate) {
      setPeriodDisplay(selectedDate);
      setPeriodBadge('Daily');
    } else if (view === 'weekly' && selectedMonth) {
      setPeriodDisplay(`Week of ${selectedMonth}`);
      setPeriodBadge('Weekly');
    } else if (view === 'monthly' && selectedMonth) {
      setPeriodDisplay(selectedMonth);
      setPeriodBadge('Monthly');
    } else if (view === 'yearly' && selectedFY) {
      setPeriodDisplay(selectedFY);
      setPeriodBadge('Yearly');
    }
  }, [view, selectedFY, selectedMonth, selectedDate]);

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
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">FII/DII Activity</h1>
              {periodDisplay && (
                <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                  {periodDisplay}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="">Select FY</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {view === 'monthly' && months.length > 0 && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.label}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={view}
                onChange={(e) => setView(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <ContextualHelp data={cashProvisionalData} view={view} />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="data">Data Table</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FIIDIIKPICards data={cashProvisionalData} view={view} />
            <LazyChartWrapper type="money-flow" data={cashProvisionalData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LazyChartWrapper type="allocation" data={cashProvisionalData} />
            </div>
            <LazyChartWrapper type="cumulative" data={cashProvisionalData} />
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            <SegmentBreakdown financialYear={selectedFY} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <SegmentAnalysisTabs financialYear={selectedFY} view={view} />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FlowHeatmapCalendar data={cashProvisionalData} />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparisonTools />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <VirtualDataTable 
              data={currentTableData} 
              selectedDataset={selectedDataset}
              onDatasetChange={setSelectedDataset}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
