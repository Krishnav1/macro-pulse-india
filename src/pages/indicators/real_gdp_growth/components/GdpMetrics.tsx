import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { useGdpData, DataType, PriceType, CurrencyType, ViewType } from '@/hooks/useGdpData';

interface GdpMetricsProps {
  dataType: DataType;
  priceType: PriceType;
  currency: CurrencyType;
  viewType: ViewType;
  selectedFY: string | null;
  timeframe: string;
}

export const GdpMetrics = ({ dataType, priceType, currency, viewType, selectedFY, timeframe }: GdpMetricsProps) => {
  const { data: gdpData, loading } = useGdpData(dataType, priceType, currency, viewType, selectedFY ? timeframe : 'latest', selectedFY);
  
  // Get latest data or FY data
  const displayData = useMemo(() => {
    if (!gdpData?.length) return null;
    
    if (selectedFY) {
      // For FY view, get the latest quarter data
      return gdpData[gdpData.length - 1];
    }
    
    return gdpData[gdpData.length - 1];
  }, [gdpData, selectedFY]);

  const formatValue = (value: number | undefined) => {
    if (!value) return 'N/A';
    
    if (dataType === 'growth') {
      return `${value.toFixed(1)}%`;
    }
    
    if (currency === 'usd') {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else {
      return `₹${(value / 10000000).toFixed(1)}L Cr`;
    }
  };

  const formatChange = (current: number | undefined, previous: number | undefined): { value: string; trend: 'up' | 'down' | 'neutral' } => {
    if (!current || !previous) return { value: 'N/A', trend: 'neutral' as const };
    
    const change = current - previous;
    const trend: 'up' | 'down' | 'neutral' = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}${dataType === 'growth' ? 'pp' : '%'}`,
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

  if (!displayData) {
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

  // Get field names based on data structure (quarterly vs annual)
  const getFieldName = (component: string) => {
    if (viewType === 'quarterly' && priceType === 'constant') {
      // Quarterly data uses simple field names
      return component;
    } else {
      // Annual data uses suffixed field names
      const suffix = `_${priceType}_price${dataType === 'growth' ? '_growth' : ''}`;
      return `${component}${suffix}`;
    }
  };

  // Mock previous period data for change calculation
  const mockPreviousData = {
    gdp: displayData[getFieldName('gdp')] * (dataType === 'growth' ? 0.9 : 0.95),
    pfce: displayData[getFieldName('pfce')] * (dataType === 'growth' ? 0.92 : 0.96),
    gfce: displayData[getFieldName('gfce')] * (dataType === 'growth' ? 0.88 : 0.94),
    gfcf: displayData[getFieldName('gfcf')] * (dataType === 'growth' ? 0.85 : 0.93),
    exports: displayData[getFieldName('exports')] * (dataType === 'growth' ? 1.1 : 1.05),
    imports: displayData[getFieldName('imports')] * (dataType === 'growth' ? 1.08 : 1.03),
  };

  const gdpChange = formatChange(displayData[getFieldName('gdp')], mockPreviousData.gdp);
  const pfceChange = formatChange(displayData[getFieldName('pfce')], mockPreviousData.pfce);
  const gfceChange = formatChange(displayData[getFieldName('gfce')], mockPreviousData.gfce);
  const gfcfChange = formatChange(displayData[getFieldName('gfcf')], mockPreviousData.gfcf);
  const exportsChange = formatChange(displayData[getFieldName('exports')], mockPreviousData.exports);
  const importsChange = formatChange(displayData[getFieldName('imports')], mockPreviousData.imports);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedFY ? `FY${selectedFY} ${displayData.quarter}` : 'Latest Metrics'}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {selectedFY 
              ? `Financial Year ${selectedFY}` 
              : viewType === 'annual' 
                ? `Annual ${displayData.year}` 
                : `${displayData.year} ${displayData.quarter}`
            }
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Total GDP - Main Card */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-primary">
              Total GDP {dataType === 'growth' ? 'Growth' : 'Value'}
            </h3>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getTrendIcon(gdpChange.trend)}
              <span className={getTrendColor(gdpChange.trend)}>
                {gdpChange.value}
              </span>
            </Badge>
          </div>
          <div className="text-2xl font-bold">
            {formatValue(displayData[getFieldName('gdp')])}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {priceType === 'constant' ? 'Constant Prices' : 'Current Prices'} • {currency === 'usd' ? 'USD' : 'INR'}
          </div>
        </div>

        {/* GDP Formula Display */}
        <div className="p-3 bg-muted/50 rounded-lg border">
          <h4 className="text-sm font-medium mb-2">GDP Formula</h4>
          <div className="text-xs text-muted-foreground">
            GDP = C + G + I + ΔS + (X - M) + Discrepancies
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            C: Consumption, G: Government, I: Investment, ΔS: Stock Changes, X: Exports, M: Imports
          </div>
        </div>

        {/* Components Grid - 2x3 */}
        <div className="grid grid-cols-2 gap-3">
          {/* PFCE (Consumption) */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">PFCE (C)</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(pfceChange.trend)}
                <span className={`text-xs ${getTrendColor(pfceChange.trend)}`}>
                  {pfceChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(displayData[getFieldName('pfce')])}
            </div>
          </div>

          {/* GFCE (Government) */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">GFCE (G)</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(gfceChange.trend)}
                <span className={`text-xs ${getTrendColor(gfceChange.trend)}`}>
                  {gfceChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(displayData[getFieldName('gfce')])}
            </div>
          </div>

          {/* GFCF (Investment) */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">GFCF (I)</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(gfcfChange.trend)}
                <span className={`text-xs ${getTrendColor(gfcfChange.trend)}`}>
                  {gfcfChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(displayData[getFieldName('gfcf')])}
            </div>
          </div>

          {/* Exports */}
          <div className="p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-muted-foreground">Exports (X)</h4>
              <div className="flex items-center gap-1">
                {getTrendIcon(exportsChange.trend)}
                <span className={`text-xs ${getTrendColor(exportsChange.trend)}`}>
                  {exportsChange.value}
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold">
              {formatValue(displayData[getFieldName('exports')])}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div>PFCE: Private Final Consumption Expenditure</div>
          <div>GFCE: Government Final Consumption Expenditure</div>
          <div>GFCF: Gross Fixed Capital Formation</div>
        </div>
      </CardContent>
    </Card>
    
    {/* View Full Insights Button */}
    <Card>
      <CardContent className="pt-6">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            // Scroll to insights section
            const insightsSection = document.querySelector('[data-insights-section]');
            if (insightsSection) {
              insightsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Full Insights
        </Button>
      </CardContent>
    </Card>
    </div>
  );
};
