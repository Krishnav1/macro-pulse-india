import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { MonthlyFIIDIIData } from '@/hooks/financial/useFIIDIIData';

interface AssetAllocationChartsProps {
  data: MonthlyFIIDIIData[];
}

const COLORS = {
  equity: 'hsl(200, 98%, 39%)',
  debt: 'hsl(142, 76%, 36%)',
  derivatives: 'hsl(280, 65%, 60%)',
};

export function AssetAllocationCharts({ data }: AssetAllocationChartsProps) {
  if (!data || data.length === 0) return null;

  const latestData = data[data.length - 1];

  const fiiData = [
    { name: 'Equity', value: Math.abs(latestData.fii_equity), color: COLORS.equity },
    { name: 'Debt', value: Math.abs(latestData.fii_debt), color: COLORS.debt },
    { name: 'Derivatives', value: Math.abs(latestData.fii_derivatives), color: COLORS.derivatives },
  ].filter(item => item.value > 0);

  const diiData = [
    { name: 'Equity', value: Math.abs(latestData.dii_equity), color: COLORS.equity },
    { name: 'Debt', value: Math.abs(latestData.dii_debt), color: COLORS.debt },
    { name: 'Derivatives', value: Math.abs(latestData.dii_derivatives), color: COLORS.derivatives },
  ].filter(item => item.value > 0);

  const fiiTotal = fiiData.reduce((sum, item) => sum + item.value, 0);
  const diiTotal = diiData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = (entry: any, total: number) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* FII Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>FII Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fiiData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => renderCustomLabel(entry, fiiTotal)}
              >
                {fiiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₹${value.toFixed(0)} Cr`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {fiiData.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-medium">
                  {((item.value / fiiTotal) * 100).toFixed(1)}% | ₹{item.value.toFixed(0)} Cr
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DII Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>DII Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={diiData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => renderCustomLabel(entry, diiTotal)}
              >
                {diiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₹${value.toFixed(0)} Cr`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {diiData.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-medium">
                  {((item.value / diiTotal) * 100).toFixed(1)}% | ₹{item.value.toFixed(0)} Cr
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
