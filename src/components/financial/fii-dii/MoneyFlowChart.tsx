import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CashProvisionalData } from '@/types/fii-dii';

interface MoneyFlowChartProps {
  data: CashProvisionalData[];
  title?: string;
  description?: string;
}

export function MoneyFlowChart({ data, title, description }: MoneyFlowChartProps) {
  const chartData = data.map((item) => {
    const date = new Date(item.date);
    const day = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    
    return {
      date: day,
      dateLabel: `${day} ${monthShort}`,
      fullDate: item.date,
      fiiNet: item.fii_net,
      diiNet: item.dii_net,
      total: item.fii_net + item.dii_net,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'FII vs DII Net Flow Comparison'}</CardTitle>
        <CardDescription>{description || 'Net investment flows (₹ Crores)'}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="dateLabel" 
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
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  const dataPoint = payload[0].payload;
                  if (dataPoint.fullDate) {
                    return new Date(dataPoint.fullDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                  }
                }
                return value;
              }}
              formatter={(value: number, name: string) => [`₹${Number(value).toFixed(0)} Cr`, name]}
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
