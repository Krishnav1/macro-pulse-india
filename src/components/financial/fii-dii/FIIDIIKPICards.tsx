import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { CashProvisionalData } from '@/types/fii-dii';

interface FIIDIIKPICardsProps {
  data: CashProvisionalData[];
  view: 'monthly' | 'daily' | 'quarterly';
}

export function FIIDIIKPICards({ data, view }: FIIDIIKPICardsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const fiiNetFlow = latestData.fii_net;
  const diiNetFlow = latestData.dii_net;
  const totalNetFlow = fiiNetFlow + diiNetFlow;
  const fiiDiiDifference = fiiNetFlow - diiNetFlow;

  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const fiiChange = previousData ? calculateChange(fiiNetFlow, previousData.fii_net) : 0;
  const diiChange = previousData ? calculateChange(diiNetFlow, previousData.dii_net) : 0;
  const totalChange = previousData ? calculateChange(totalNetFlow, previousData.fii_net + previousData.dii_net) : 0;

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 10000) {
      return `₹${(value / 1000).toFixed(1)}K Cr`;
    }
    return `₹${value.toFixed(0)} Cr`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <ArrowRight className="h-3 w-3" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* FII Net Flow */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">FII Net Flow</p>
            <p className={`text-2xl font-bold ${getChangeColor(fiiNetFlow)}`}>
              {formatValue(fiiNetFlow)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor(fiiChange)}`}>
              {getChangeIcon(fiiChange)}
              <span>{Math.abs(fiiChange).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DII Net Flow */}
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">DII Net Flow</p>
            <p className={`text-2xl font-bold ${getChangeColor(diiNetFlow)}`}>
              {formatValue(diiNetFlow)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor(diiChange)}`}>
              {getChangeIcon(diiChange)}
              <span>{Math.abs(diiChange).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Inflow (Total) */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Net Inflow (Total)</p>
            <p className={`text-2xl font-bold ${getChangeColor(totalNetFlow)}`}>
              {formatValue(totalNetFlow)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor(totalChange)}`}>
              {getChangeIcon(totalChange)}
              <span>{Math.abs(totalChange).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FII-DII Difference */}
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">FII-DII Difference</p>
            <p className={`text-2xl font-bold ${getChangeColor(fiiDiiDifference)}`}>
              {formatValue(fiiDiiDifference)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fiiDiiDifference > 0 ? 'FII Dominant' : fiiDiiDifference < 0 ? 'DII Dominant' : 'Balanced'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
