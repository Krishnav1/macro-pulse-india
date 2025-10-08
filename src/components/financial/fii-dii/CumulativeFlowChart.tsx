import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CashProvisionalData } from '@/types/fii-dii';
interface CumulativeFlowChartProps {
  data: CashProvisionalData[];
}

export function CumulativeFlowChart({ data }: CumulativeFlowChartProps) {
  const chartData = data.map((item, index) => {
    const cumulativeFII = data.slice(0, index + 1).reduce((sum, d) => sum + d.fii_net, 0);
    const cumulativeDII = data.slice(0, index + 1).reduce((sum, d) => sum + d.dii_net, 0);
    const date = new Date(item.date);
    const day = date.getDate();

    return {
      date: day,
      month: item.month_name,
      cumulativeFII,
      cumulativeDII,
      cumulativeTotal: cumulativeFII + cumulativeDII,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Money Flow Trend</CardTitle>
        <CardDescription>Running total of FII and DII investments (₹ Crores)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="cumulativeFII"
              name="FII Cumulative"
              stroke="hsl(200, 98%, 39%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeDII"
              name="DII Cumulative"
              stroke="hsl(25, 95%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeTotal"
              name="Net Total"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
