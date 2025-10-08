import { useState, useEffect } from 'react';
import { useCashProvisionalData, useFIIDIIFinancialYears, useFIIDIIMonths } from '@/hooks/financial/useFIIDIIDataNew';
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

export default function FIIDIIActivityPage() {
  const [view, setView] = useState<'monthly' | 'daily' | 'quarterly'>('monthly');
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  const { years, loading: yearsLoading } = useFIIDIIFinancialYears();
  const { months } = useFIIDIIMonths(selectedFY);
  
  const { data: cashProvisionalData, loading } = useCashProvisionalData({
    view,
    financialYear: selectedFY,
    month: selectedMonth,
  });

  useEffect(() => {
    if (years.length > 0 && !selectedFY) {
      setSelectedFY(years[0]);
    }
  }, [years]);

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
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">FII/DII Activity</h1>
            
            <div className="flex items-center gap-3">
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

              <select
                value={view}
                onChange={(e) => setView(e.target.value as 'monthly' | 'daily' | 'quarterly')}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
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

          <TabsContent value="heatmap" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FlowHeatmapCalendar data={cashProvisionalData} type="total" />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ComparisonTools />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <VirtualDataTable data={cashProvisionalData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
