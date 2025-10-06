import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Eye, DollarSign, IndianRupee } from 'lucide-react';
import { useGdpData, DataType, PriceType, CurrencyType, ViewType } from '@/hooks/useGdpData';
import { useUsdConversion } from '@/hooks/useUsdConversion';
import { useNavigate } from 'react-router-dom';

interface GdpMetricsProps {
  dataType: DataType;
  priceType: PriceType;
  currency: CurrencyType;
  viewType: ViewType;
  selectedFY: string | null;
  timeframe: string;
}

export const GdpMetrics = ({ dataType, priceType, currency, viewType, selectedFY, timeframe }: GdpMetricsProps) => {
  const navigate = useNavigate();
  const { data, loading } = useGdpData(dataType, priceType, currency, viewType, 'all', selectedFY);
  const { convertToUsd, getCurrencySymbol } = useUsdConversion();

  const displayData = useMemo(() => {
    if (!data?.length) {
      return {
        year: '2024-25',
        quarter: 'Annual',
        gdp: 0,
        pfce: 0,
        gfce: 0,
        gfcf: 0,
        exports: 0,
        imports: 0,
        valuables: 0,
        changes_in_stocks: 0,
        discrepancies: 0
      };
    }
    
    // Get the latest data point (last in array since we order by year ASC)
    return data[data.length - 1];
  }, [data]);

  const previousData = useMemo(() => {
    if (!data?.length || data.length < 2) {
      return null;
    }
    // Get the second to last data point for comparison
    return data[data.length - 2];
  }, [data]);

  const formatValue = (value: number, date?: string) => {
    if (dataType === 'growth') {
      return `${value.toFixed(1)}%`;
    }
    
    if (currency === 'usd' && date) {
      const usdValue = convertToUsd(value, date, 'trillion');
      return usdValue !== null ? `$${usdValue.toFixed(2)} Trillion` : `$0.00`;
    }
    
    return `${getCurrencySymbol(currency)}${(value / 100000).toFixed(2)} Trillion`;
  };

  const getActualChange = (current: number, field: string) => {
    if (!previousData) {
      return { value: '0.0', trend: 'neutral' as const };
    }
    
    const previous = previousData[field as keyof typeof previousData] as number;
    if (!previous || previous === 0) {
      return { value: '0.0', trend: 'neutral' as const };
    }
    
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  // Calculate changes for each component
  const gdpChange = getActualChange(displayData.gdp, 'gdp');
  const pfceChange = getActualChange(displayData.pfce, 'pfce');
  const gfceChange = getActualChange(displayData.gfce, 'gfce');
  const gfcfChange = getActualChange(displayData.gfcf, 'gfcf');
  const exportsChange = getActualChange(displayData.exports, 'exports');
  const importsChange = getActualChange(displayData.imports, 'imports');

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Loading metrics...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedFY ? `FY${selectedFY} Metrics` : 'Latest Metrics'}
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
                  {gdpChange.value}%
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {currency === 'inr' ? <IndianRupee className="h-5 w-5 text-primary" /> : <DollarSign className="h-5 w-5 text-primary" />}
              <div className="text-2xl font-bold">
                {formatValue(displayData.gdp, displayData.year)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {priceType === 'constant' ? 'Constant Prices' : 'Current Prices'} • {currency.toUpperCase()}
            </div>
          </div>

          {/* Components Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {/* PFCE (Consumption) */}
            <div className="p-3 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-muted-foreground">PFCE (C)</h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(pfceChange.trend)}
                  <span className={`text-xs ${getTrendColor(pfceChange.trend)}`}>
                    {pfceChange.value}%
                  </span>
                </div>
              </div>
              <div className="text-lg font-semibold">
                {formatValue(displayData.pfce, displayData.year)}
              </div>
            </div>

            {/* GFCE (Government) */}
            <div className="p-3 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-muted-foreground">GFCE (G)</h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(gfceChange.trend)}
                  <span className={`text-xs ${getTrendColor(gfceChange.trend)}`}>
                    {gfceChange.value}%
                  </span>
                </div>
              </div>
              <div className="text-lg font-semibold">
                {formatValue(displayData.gfce, displayData.year)}
              </div>
            </div>

            {/* GFCF (Investment) */}
            <div className="p-3 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-muted-foreground">GFCF (I)</h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(gfcfChange.trend)}
                  <span className={`text-xs ${getTrendColor(gfcfChange.trend)}`}>
                    {gfcfChange.value}%
                  </span>
                </div>
              </div>
              <div className="text-lg font-semibold">
                {formatValue(displayData.gfcf, displayData.year)}
              </div>
            </div>

            {/* Exports */}
            <div className="p-3 bg-card rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-muted-foreground">Exports (X)</h4>
                <div className="flex items-center gap-1">
                  {getTrendIcon(exportsChange.trend)}
                  <span className={`text-xs ${getTrendColor(exportsChange.trend)}`}>
                    {exportsChange.value}%
                  </span>
                </div>
              </div>
              <div className="text-lg font-semibold">
                {formatValue(displayData.exports, displayData.year)}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
      
      {/* View Full Insights Button - Modern Style */}
      <button 
        onClick={() => navigate('/indicators/real-gdp-growth/insights')}
        className="w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Eye className="h-4 w-4" />
        View Full Insights
      </button>
    </div>
  );
};
