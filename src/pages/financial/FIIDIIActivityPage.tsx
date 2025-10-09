import { useState, useEffect, useMemo } from 'react';
import { useCashProvisionalData, useFIIDIIFinancialYears, useFIIDIIMonths, useFIIDIIQuarters, useFIICashData, useDIICashData, useFIIFOIndicesData, useFIIFOStocksData, useDIIFOIndicesData, useDIIFOStocksData } from '@/hooks/financial/useFIIDIIDataNew';
import { getQuarterFromMonth, aggregateToMonthly, getChartDescription, getKPILabels } from '@/utils/fii-dii-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FilterBreadcrumb } from '@/components/financial/fii-dii/FilterBreadcrumb';

export default function FIIDIIActivityPage() {
  const [view, setView] = useState<'yearly' | 'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [periodDisplay, setPeriodDisplay] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<'cash_provisional' | 'fii_cash' | 'dii_cash' | 'fii_fo_indices' | 'fii_fo_stocks' | 'dii_fo_indices' | 'dii_fo_stocks'>('cash_provisional');
  const [datasetLabel, setDatasetLabel] = useState<string>('Cash Provisional (FII+DII)');

  const { years, loading: yearsLoading } = useFIIDIIFinancialYears();
  const { quarters } = useFIIDIIQuarters(selectedFY);
  const { months } = useFIIDIIMonths(selectedFY);
  
  const { data: cashProvisionalData, loading } = useCashProvisionalData({
    financialYear: selectedFY,
    quarter: selectedQuarter,
    month: selectedMonth,
  });

  const { data: fiiCashData } = useFIICashData({
    financialYear: selectedFY,
    quarter: selectedQuarter,
    month: selectedMonth,
  });

  const { data: diiCashData } = useDIICashData({
    financialYear: selectedFY,
    quarter: selectedQuarter,
    month: selectedMonth,
  });

  // Fetch F&O data for data table
  const { data: fiiIndicesData } = useFIIFOIndicesData({ financialYear: selectedFY, quarter: selectedQuarter, month: selectedMonth });
  const { data: fiiStocksData } = useFIIFOStocksData({ financialYear: selectedFY, quarter: selectedQuarter, month: selectedMonth });
  const { data: diiIndicesData } = useDIIFOIndicesData({ financialYear: selectedFY, quarter: selectedQuarter, month: selectedMonth });
  const { data: diiStocksData } = useDIIFOStocksData({ financialYear: selectedFY, quarter: selectedQuarter, month: selectedMonth });

  // Get current dataset based on selection
  const currentTableData = selectedDataset === 'fii_cash' ? fiiCashData : 
                           selectedDataset === 'dii_cash' ? diiCashData :
                           selectedDataset === 'fii_fo_indices' ? fiiIndicesData :
                           selectedDataset === 'fii_fo_stocks' ? fiiStocksData :
                           selectedDataset === 'dii_fo_indices' ? diiIndicesData :
                           selectedDataset === 'dii_fo_stocks' ? diiStocksData :
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

  // Filter data based on selected date
  const filteredData = useMemo(() => {
    if (selectedDate) {
      return cashProvisionalData.filter(item => item.date === selectedDate);
    }
    return cashProvisionalData;
  }, [cashProvisionalData, selectedDate]);

  // Smart filter cascade - auto-detect quarter from month
  useEffect(() => {
    if (selectedMonth && !selectedQuarter) {
      const quarter = getQuarterFromMonth(selectedMonth);
      if (quarter) {
        setSelectedQuarter(quarter);
      }
    }
  }, [selectedMonth]);

  // Update period display based on selection
  useEffect(() => {
    if (selectedDate) {
      const dateObj = new Date(selectedDate);
      const day = dateObj.getDate();
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setPeriodDisplay(`${day} ${monthName}`);
    } else if (selectedMonth) {
      const quarter = getQuarterFromMonth(selectedMonth);
      setPeriodDisplay(`${selectedMonth} (${quarter})`);
    } else if (selectedQuarter) {
      setPeriodDisplay(`${selectedQuarter} ${selectedFY}`);
    } else if (selectedFY) {
      setPeriodDisplay(selectedFY);
    }
  }, [selectedFY, selectedQuarter, selectedMonth, selectedDate]);

  // Get available dates for selected month (trading days only)
  const availableDates = useMemo(() => {
    if (!selectedMonth || !cashProvisionalData.length) return [];
    return cashProvisionalData.map(item => ({
      value: item.date,
      label: new Date(item.date).getDate().toString(),
      fullDate: item.date
    }));
  }, [selectedMonth, cashProvisionalData]);

  // Determine granularity level
  const granularity = useMemo(() => {
    if (selectedDate) return 'daily';
    if (selectedMonth) return 'monthly';
    if (selectedQuarter) return 'quarterly';
    return 'yearly';
  }, [selectedDate, selectedMonth, selectedQuarter]);

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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">FII/DII Activity</h1>
                  <ContextualHelp data={filteredData} view={view} />
                </div>
                {periodDisplay && (
                  <p className="text-sm text-muted-foreground mt-1">{periodDisplay}</p>
                )}
                <div className="mt-2">
                  <FilterBreadcrumb
                    selectedFY={selectedFY}
                    selectedQuarter={selectedQuarter}
                    selectedMonth={selectedMonth}
                    selectedDate={selectedDate}
                    onClearFY={() => setSelectedFY('')}
                    onClearQuarter={() => setSelectedQuarter('')}
                    onClearMonth={() => setSelectedMonth('')}
                    onClearDate={() => setSelectedDate('')}
                  />
                </div>
              </div>
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
                    'dii_cash': 'DII Cash Only',
                    'fii_fo_indices': 'FII F&O Indices',
                    'fii_fo_stocks': 'FII F&O Stocks',
                    'dii_fo_indices': 'DII F&O Indices',
                    'dii_fo_stocks': 'DII F&O Stocks'
                  };
                  setDatasetLabel(labels[value]);
                }}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="cash_provisional">Cash Provisional</option>
                <option value="fii_cash">FII Cash</option>
                <option value="dii_cash">DII Cash</option>
                <option value="fii_fo_indices">FII F&O Indices</option>
                <option value="fii_fo_stocks">FII F&O Stocks</option>
                <option value="dii_fo_indices">DII F&O Indices</option>
                <option value="dii_fo_stocks">DII F&O Stocks</option>
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

              {quarters.length > 0 && (
                <select
                  value={selectedQuarter}
                  onChange={(e) => {
                    const newQuarter = e.target.value;
                    setSelectedQuarter(newQuarter);
                    if (newQuarter) {
                      setSelectedMonth(''); // Clear month when quarter selected
                    }
                    setSelectedDate(''); // Clear date when quarter changes
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  <option value="">All Quarters</option>
                  {quarters.map((quarter) => (
                    <option key={quarter} value={quarter}>
                      {quarter}
                    </option>
                  ))}
                </select>
              )}

              {months.length > 0 && (
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedDate(''); // Clear date when month changes
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  <option value="">All Months</option>
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                📊 Dataset: {datasetLabel} | Granularity: {granularity.charAt(0).toUpperCase() + granularity.slice(1)} | All values in ₹ Crore
              </p>
              {selectedDate && (
                <p className="text-xs text-muted-foreground">
                  Showing single day analysis. Other tabs show monthly context.
                </p>
              )}
            </div>
            <FIIDIIKPICards data={filteredData} view={selectedDate ? 'daily' : view} />
            {!selectedDate && (
              <MoneyFlowChart 
                data={filteredData}
                title={`FII vs DII Net Flow - ${periodDisplay}`}
                description={getChartDescription(selectedDate, selectedMonth, selectedQuarter, selectedFY)}
              />
            )}
            {!selectedDate && (
              <CumulativeFlowChart 
                data={filteredData}
                title={`Cumulative Flow - ${periodDisplay}`}
                description={getChartDescription(selectedDate, selectedMonth, selectedQuarter, selectedFY)}
              />
            )}
            {selectedDate && filteredData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Single Day Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">FII Net</p>
                          <p className="text-2xl font-bold text-blue-600">₹{filteredData[0].fii_net.toFixed(0)} Cr</p>
                        </div>
                        <div className="p-4 bg-orange-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">DII Net</p>
                          <p className="text-2xl font-bold text-orange-600">₹{filteredData[0].dii_net.toFixed(0)} Cr</p>
                        </div>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Flow</p>
                        <p className="text-2xl font-bold text-green-600">₹{(filteredData[0].fii_net + filteredData[0].dii_net).toFixed(0)} Cr</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>30-Day Context</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View Cash Market or F&O Market tabs to see detailed segment analysis for the selected month.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cash" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              💰 Cash Market: Delivery-based equity and debt transactions | Values in ₹ Crore
            </p>
            <SegmentBreakdown 
              financialYear={selectedFY} 
              quarter={selectedQuarter}
              month={selectedMonth}
            />
          </TabsContent>

          <TabsContent value="fo" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              📈 F&O Market: Index and stock derivatives (Futures & Options) | Values in ₹ Crore
            </p>
            <SegmentAnalysisTabs 
              financialYear={selectedFY} 
              quarter={selectedQuarter}
              month={selectedMonth}
              view={view} 
            />
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
