import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CashProvisionalData } from '@/types/fii-dii';

interface MoneyFlowChartProps {
  data: CashProvisionalData[];
}

export function MoneyFlowChart({ data }: MoneyFlowChartProps) {
  const chartData = data.map(item => {
    const date = new Date(item.date);
    const day = date.getDate();
    const monthShort = item.month_name.split(' ')[0].substring(0, 3); // "Sep"
    
    return {
      date: day, // Just the day number
      label: `${day} ${monthShort}`, // "15 Sep"
      fiiNet: item.fii_net,
      diiNet: item.dii_net,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>FII vs DII Net Flow Comparison</CardTitle>
        <CardDescription>Monthly net investment flows (₹ Crores)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
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
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
            <Bar 
              dataKey="fiiNet" 
              name="FII Net Flow" 
              fill="hsl(200, 98%, 39%)" 
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="diiNet" 
              name="DII Net Flow" 
              fill="hsl(25, 95%, 50%)" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
