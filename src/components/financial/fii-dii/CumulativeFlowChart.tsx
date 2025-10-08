import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CashProvisionalData } from '@/types/fii-dii';

interface CumulativeFlowChartProps {
  data: CashProvisionalData[];
}

export function CumulativeFlowChart({ data }: CumulativeFlowChartProps) {
  let fiiCumulative = 0;
  let diiCumulative = 0;

  const chartData = data.map(item => {
    fiiCumulative += item.fii_net;
    diiCumulative += item.dii_net;
    const netTotal = fiiCumulative + diiCumulative;

    return {
      month: item.month_name,
      fiiCumulative,
      diiCumulative,
      netTotal,
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
              dataKey="month" 
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
            <Legend 
              onClick={(e) => {
                // Toggle line visibility on legend click
                const chart = e.target as any;
                if (chart && chart.dataKey) {
                  // This will be handled by Recharts internally
                }
              }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="fiiCumulative"
              name="FII Cumulative"
              stroke="hsl(200, 98%, 39%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="diiCumulative"
              name="DII Cumulative"
              stroke="hsl(25, 95%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="netTotal"
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
