import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CashProvisionalData } from '@/types/fii-dii';

interface FlowHeatmapCalendarProps {
  data: CashProvisionalData[];
  type: 'fii' | 'dii' | 'total';
}

export function FlowHeatmapCalendar({ data, type }: FlowHeatmapCalendarProps) {
  const getValue = (item: CashProvisionalData) => {
    switch (type) {
      case 'fii':
        return item.fii_net;
      case 'dii':
        return item.dii_net;
      case 'total':
        return item.fii_net + item.dii_net;
    }
  };

  const getColor = (value: number) => {
    const absValue = Math.abs(value);
    if (value > 0) {
      if (absValue > 15000) return 'bg-green-700';
      if (absValue > 10000) return 'bg-green-600';
      if (absValue > 5000) return 'bg-green-500';
      if (absValue > 2000) return 'bg-green-400';
      return 'bg-green-300';
    } else if (value < 0) {
      if (absValue > 15000) return 'bg-red-700';
      if (absValue > 10000) return 'bg-red-600';
      if (absValue > 5000) return 'bg-red-500';
      if (absValue > 2000) return 'bg-red-400';
      return 'bg-red-300';
    }
    return 'bg-gray-300 dark:bg-gray-700';
  };

  // Group by month
  const monthlyData = data.reduce((acc, item) => {
    const month = item.month_name;
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, CashProvisionalData[]>);

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 10000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const getTitle = () => {
    switch (type) {
      case 'fii':
        return 'FII Flow Heatmap';
      case 'dii':
        return 'DII Flow Heatmap';
      case 'total':
        return 'Total Flow Heatmap';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>Daily flow intensity visualization (₹ Crores)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(monthlyData).map(([month, items]) => (
            <div key={month}>
              <h4 className="text-sm font-medium mb-2">{month}</h4>
              <div className="grid grid-cols-7 gap-1">
                {items.map((item, idx) => {
                  const value = getValue(item);
                  const day = new Date(item.date).getDate();
                  return (
                    <div
                      key={idx}
                      className={`${getColor(value)} h-12 rounded flex flex-col items-center justify-center text-xs font-medium text-white hover:scale-110 transition-transform cursor-pointer`}
                      title={`${item.date}: ${formatValue(value)} Cr`}
                    >
                      <span>{day}</span>
                      <span className="text-[10px]">{formatValue(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-700 rounded"></div>
            <span>High Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>Low Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span>Low Outflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-700 rounded"></div>
            <span>High Outflow</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
