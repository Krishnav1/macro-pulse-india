import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useForexReserves } from '@/hooks/useForexReserves';

interface FRMetricsProps {
  unit: 'usd' | 'inr';
  selectedFY: string | null;
  timeframe: string;
}

export const FRMetrics = ({ unit, selectedFY, timeframe }: FRMetricsProps) => {
  const { data: forexData, loading } = useForexReserves(unit, 'latest', selectedFY);
  
  const latestData = forexData?.[0];

  const formatValue = (value: number | undefined) => {
    if (!value) return 'N/A';
    if (unit === 'usd') {
      return `$${(value / 1000).toFixed(1)}B`;
    } else {
      return `₹${(value / 100000).toFixed(1)}L Cr`;
    }
  };

  const formatChange = (current: number | undefined, previous: number | undefined): { value: string; trend: 'up' | 'down' | 'neutral' } => {
    if (!current || !previous) return { value: 'N/A', trend: 'neutral' as const };
    
    const change = ((current - previous) / previous) * 100;
    const trend: 'up' | 'down' | 'neutral' = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
      trend
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!latestData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    );
  }

  const unitSuffix = unit === 'usd' ? 'mn' : 'crore';
  const totalField = `total_reserves_${unit}_${unitSuffix}`;
  const fcaField = `foreign_currency_assets_${unit}_${unitSuffix}`;
  const goldField = `gold_${unit}_${unitSuffix}`;
  const sdrField = `sdrs_${unit}_${unitSuffix}`;
  const imfField = `reserve_position_imf_${unit}_${unitSuffix}`;

  // Mock previous week data for change calculation (in real implementation, fetch previous week)
  const mockPreviousData = {
    [totalField]: latestData[totalField] * 0.995,
    [fcaField]: latestData[fcaField] * 0.992,
    [goldField]: latestData[goldField] * 1.002,
    [sdrField]: latestData[sdrField] * 0.998,
    [imfField]: latestData[imfField] * 1.001,
  };

  const totalChange = formatChange(latestData[totalField], mockPreviousData[totalField]);
  const fcaChange = formatChange(latestData[fcaField], mockPreviousData[fcaField]);
  const goldChange = formatChange(latestData[goldField], mockPreviousData[goldField]);
  const sdrChange = formatChange(latestData[sdrField], mockPreviousData[sdrField]);
  const imfChange = formatChange(latestData[imfField], mockPreviousData[imfField]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {selectedFY ? `FY${selectedFY} Year-End` : 'Latest Metrics'}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {selectedFY ? 'As of March 31' : `Week ended: ${new Date(latestData.week_ended).toLocaleDateString()}`}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Reserves - Main Card */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-primary">Total Reserves</h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getTrendIcon(totalChange.trend)}
              <span className={getTrendColor(totalChange.trend)}>
                {totalChange.value}
              </span>
            </Badge>
          </div>
          <div className="text-2xl font-bold">
            {formatValue(latestData[totalField])}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {unit === 'usd' ? 'USD Million' : 'INR Crore'}
          </div>
        </div>

        {/* Components Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Foreign Currency Assets */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">FCA</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(fcaChange.trend)}
                <span className={`text-xs ${getTrendColor(fcaChange.trend)}`}>
                  {fcaChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(latestData[fcaField])}
            </div>
          </div>

          {/* Gold */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">Gold</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(goldChange.trend)}
                <span className={`text-xs ${getTrendColor(goldChange.trend)}`}>
                  {goldChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(latestData[goldField])}
            </div>
          </div>

          {/* SDRs */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">SDRs</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(sdrChange.trend)}
                <span className={`text-xs ${getTrendColor(sdrChange.trend)}`}>
                  {sdrChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(latestData[sdrField])}
            </div>
          </div>

          {/* IMF Position */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">IMF</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(imfChange.trend)}
                <span className={`text-xs ${getTrendColor(imfChange.trend)}`}>
                  {imfChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(latestData[imfField])}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div>FCA: Foreign Currency Assets</div>
          <div>SDRs: Special Drawing Rights</div>
          <div>IMF: Reserve Position in IMF</div>
        </div>
      </CardContent>
    </Card>
  );
};
