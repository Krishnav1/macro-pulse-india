import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CashProvisionalData } from '@/types/fii-dii';

interface AssetAllocationChartsProps {
  data: CashProvisionalData[];
}

const COLORS = ['hsl(200, 98%, 39%)', 'hsl(25, 95%, 53%)'];

export function AssetAllocationCharts({ data }: AssetAllocationChartsProps) {
  if (!data || data.length === 0) return null;

  const latestData = data[data.length - 1];

  const flowData = [
    { name: 'FII Net', value: Math.abs(latestData.fii_net), color: COLORS[0] },
    { name: 'DII Net', value: Math.abs(latestData.dii_net), color: COLORS[1] },
  ].filter(item => item.value > 0);

  const activityData = [
    { name: 'FII Gross', value: latestData.fii_gross_purchase + latestData.fii_gross_sales, color: COLORS[0] },
    { name: 'DII Gross', value: latestData.dii_gross_purchase + latestData.dii_gross_sales, color: COLORS[1] },
  ].filter(item => item.value > 0);

  const flowTotal = flowData.reduce((sum, item) => sum + item.value, 0);
  const activityTotal = activityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Net Flow Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={flowData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${((entry.value / flowTotal) * 100).toFixed(0)}%`}
              >
                {flowData.map((entry, index) => (
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
            {flowData.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-medium">
                  {((item.value / flowTotal) * 100).toFixed(1)}% | ₹{item.value.toFixed(0)} Cr
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gross Activity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${((entry.value / activityTotal) * 100).toFixed(0)}%`}
              >
                {activityData.map((entry, index) => (
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
            {activityData.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-medium">
                  {((item.value / activityTotal) * 100).toFixed(1)}% | ₹{item.value.toFixed(0)} Cr
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
