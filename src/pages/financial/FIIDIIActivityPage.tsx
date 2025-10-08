import { useState, useEffect, useMemo } from 'react';
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
  const [selectedDataset, setSelectedDataset] = useState<'cash_provisional' | 'fii_cash' | 'dii_cash'>('cash_provisional');
  const [datasetLabel, setDatasetLabel] = useState<string>('Cash Provisional (FII+DII)');

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
    if (selectedDate) {
      setPeriodDisplay(selectedDate);
    } else if (selectedMonth) {
      setPeriodDisplay(selectedMonth);
    } else if (selectedFY) {
      setPeriodDisplay(selectedFY);
    }
  }, [selectedFY, selectedMonth, selectedDate]);

  // Get available dates for selected month
  const availableDates = useMemo(() => {
    if (!selectedMonth || !cashProvisionalData.length) return [];
    return cashProvisionalData.map(item => ({
      value: item.date,
      label: new Date(item.date).getDate().toString(),
      fullDate: item.date
    }));
  }, [selectedMonth, cashProvisionalData]);

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
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">FII/DII Activity</h1>
                {periodDisplay && (
                  <p className="text-sm text-muted-foreground mt-1">{periodDisplay}</p>
                )}
              </div>
              <ContextualHelp data={cashProvisionalData} view={view} />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedDataset}
                onChange={(e) => {
                  const value = e.target.value as any;
                  setSelectedDataset(value);
                  const labels: Record<string, string> = {
                    'cash_provisional': 'Cash Provisional (FII+DII)',
                    'fii_cash': 'FII Cash Only',
                    'dii_cash': 'DII Cash Only'
                  };
                  setDatasetLabel(labels[value]);
                }}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="cash_provisional">All Markets</option>
                <option value="fii_cash">FII Cash</option>
                <option value="dii_cash">DII Cash</option>
              </select>

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

              {months.length > 0 && (
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

              {availableDates.length > 0 && (
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  <option value="">All Dates</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.fullDate}>
                      {date.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cash">Cash Market</TabsTrigger>
            <TabsTrigger value="fo">F&O Market</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="data">Data Table</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              📊 Dataset: {datasetLabel} | All values in ₹ Crore
            </p>
            <FIIDIIKPICards data={cashProvisionalData} view={view} />
            <MoneyFlowChart data={cashProvisionalData} />
            <CumulativeFlowChart data={cashProvisionalData} />
          </TabsContent>

          <TabsContent value="cash" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              💰 Cash Market: Delivery-based equity and debt transactions | Values in ₹ Crore
            </p>
            <SegmentBreakdown financialYear={selectedFY} />
          </TabsContent>

          <TabsContent value="fo" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              📈 F&O Market: Index and stock derivatives (Futures & Options) | Values in ₹ Crore
            </p>
            <SegmentAnalysisTabs financialYear={selectedFY} view={view} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              ⚖️ Market Comparison: Cash vs F&O activity analysis | Values in ₹ Crore
            </p>
            <ComparisonTools />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              🗓️ Calendar Heatmap: Daily flow intensity visualization | Values in ₹ Crore
            </p>
            <FlowHeatmapCalendar data={cashProvisionalData} />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              📋 Detailed Data Table | All values in ₹ Crore
            </p>
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
