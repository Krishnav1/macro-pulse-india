import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load chart components
const MoneyFlowChart = lazy(() => import('./MoneyFlowChart').then(m => ({ default: m.MoneyFlowChart })));
const CumulativeFlowChart = lazy(() => import('./CumulativeFlowChart').then(m => ({ default: m.CumulativeFlowChart })));
const AssetAllocationCharts = lazy(() => import('./AssetAllocationCharts').then(m => ({ default: m.AssetAllocationCharts })));

interface LazyChartWrapperProps {
  type: 'money-flow' | 'cumulative' | 'allocation';
  data: any;
}

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LazyChartWrapper({ type, data }: LazyChartWrapperProps) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      {type === 'money-flow' && <MoneyFlowChart data={data} />}
      {type === 'cumulative' && <CumulativeFlowChart data={data} />}
      {type === 'allocation' && <AssetAllocationCharts data={data} />}
    </Suspense>
  );
}
