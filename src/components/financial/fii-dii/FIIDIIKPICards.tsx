import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { CashProvisionalData } from '@/types/fii-dii';

interface FIIDIIKPICardsProps {
  data: CashProvisionalData[];
  view: 'yearly' | 'monthly' | 'weekly' | 'daily';
}

export function FIIDIIKPICards({ data, view }: FIIDIIKPICardsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate metrics based on view
  const getMetrics = () => {
    if (view === 'daily' && data.length === 1) {
      // Single day metrics
      const dayData = data[0];
      return {
        primary: dayData.fii_net,
        secondary: dayData.dii_net,
        total: dayData.fii_net + dayData.dii_net,
        difference: dayData.fii_net - dayData.dii_net,
        label1: 'FII Net',
        label2: 'DII Net',
        label3: 'Total Flow',
        label4: 'FII-DII Gap'
      };
    } else if (view === 'weekly') {
      // Weekly aggregation
      const weekTotal = data.reduce((sum, item) => sum + item.fii_net + item.dii_net, 0);
      const fiiWeekTotal = data.reduce((sum, item) => sum + item.fii_net, 0);
      const diiWeekTotal = data.reduce((sum, item) => sum + item.dii_net, 0);
      const dailyAvg = weekTotal / data.length;
      
      return {
        primary: weekTotal,
        secondary: dailyAvg,
        total: fiiWeekTotal,
        difference: diiWeekTotal,
        label1: 'Week Total',
        label2: 'Daily Avg',
        label3: 'FII Week',
        label4: 'DII Week'
      };
    } else if (view === 'monthly') {
      // Monthly aggregation
      const monthTotal = data.reduce((sum, item) => sum + item.fii_net + item.dii_net, 0);
      const fiiMonthTotal = data.reduce((sum, item) => sum + item.fii_net, 0);
      const diiMonthTotal = data.reduce((sum, item) => sum + item.dii_net, 0);
      const dailyAvg = monthTotal / data.length;
      
      return {
        primary: monthTotal,
        secondary: dailyAvg,
        total: fiiMonthTotal,
        difference: diiMonthTotal,
        label1: 'Month Total',
        label2: 'Daily Avg',
        label3: 'FII Month',
        label4: 'DII Month'
      };
    } else {
      // Yearly aggregation
      const yearTotal = data.reduce((sum, item) => sum + item.fii_net + item.dii_net, 0);
      const fiiYearTotal = data.reduce((sum, item) => sum + item.fii_net, 0);
      const diiYearTotal = data.reduce((sum, item) => sum + item.dii_net, 0);
      const monthlyAvg = yearTotal / 12;
      
      return {
        primary: yearTotal,
        secondary: monthlyAvg,
        total: fiiYearTotal,
        difference: diiYearTotal,
        label1: 'FY Total',
        label2: 'Monthly Avg',
        label3: 'FII Year',
        label4: 'DII Year'
      };
    }
  };

  const metrics = getMetrics();
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const fiiChange = previousData ? calculateChange(metrics.total, previousData.fii_net) : 0;
  const diiChange = previousData ? calculateChange(metrics.difference, previousData.dii_net) : 0;
  const totalChange = previousData ? calculateChange(metrics.primary, previousData.fii_net + previousData.dii_net) : 0;

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
      {/* Primary Metric */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{metrics.label1}</p>
            <p className={`text-2xl font-bold ${getChangeColor(metrics.primary)}`}>
              {formatValue(metrics.primary)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor(totalChange)}`}>
              {getChangeIcon(totalChange)}
              <span>{Math.abs(totalChange).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Metric */}
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{metrics.label2}</p>
            <p className={`text-2xl font-bold ${getChangeColor(metrics.secondary)}`}>
              {formatValue(metrics.secondary)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor(fiiChange)}`}>
              {getChangeIcon(fiiChange)}
              <span>{Math.abs(fiiChange).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Metric */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{metrics.label3}</p>
            <p className={`text-2xl font-bold ${getChangeColor(metrics.total)}`}>
              {formatValue(metrics.total)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${getChangeColor(diiChange)}`}>
              {getChangeIcon(diiChange)}
              <span>{Math.abs(diiChange).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difference Metric */}
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{metrics.label4}</p>
            <p className={`text-2xl font-bold ${getChangeColor(metrics.difference)}`}>
              {formatValue(metrics.difference)}
            </p>
            <p className="text-xs text-muted-foreground">
              {view === 'daily' ? 
                (metrics.difference > 0 ? 'FII Dominant' : metrics.difference < 0 ? 'DII Dominant' : 'Balanced') :
                `${data.length} ${view === 'weekly' ? 'days' : view === 'monthly' ? 'days' : 'months'}`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
