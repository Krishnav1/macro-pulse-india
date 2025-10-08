import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCashProvisionalData, useFIIDIIFinancialYears } from '@/hooks/financial/useFIIDIIDataNew';

export function ComparisonTools() {
  const [activeTab, setActiveTab] = useState('fy-comparison');
  const { years } = useFIIDIIFinancialYears();

  // Fetch data for last 3 FYs
  const fy1Data = useCashProvisionalData({ financialYear: years[0], view: 'monthly' });
  const fy2Data = useCashProvisionalData({ financialYear: years[1], view: 'monthly' });
  const fy3Data = useCashProvisionalData({ financialYear: years[2], view: 'monthly' });

  // FY Comparison - Monthly aggregation
  const fyComparison = Array.from({ length: 12 }, (_, i) => {
    const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    return {
      month: monthNames[i],
      [years[0]]: fy1Data.data[i]?.fii_net + fy1Data.data[i]?.dii_net || 0,
      [years[1]]: fy2Data.data[i]?.fii_net + fy2Data.data[i]?.dii_net || 0,
      [years[2]]: fy3Data.data[i]?.fii_net + fy3Data.data[i]?.dii_net || 0,
    };
  });

  // Quarter Comparison
  const quarterComparison = ['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
    const fy1Q = fy1Data.data.filter(d => d.quarter === `${quarter} ${years[0]}`);
    const fy2Q = fy2Data.data.filter(d => d.quarter === `${quarter} ${years[1]}`);
    const fy3Q = fy3Data.data.filter(d => d.quarter === `${quarter} ${years[2]}`);

    return {
      quarter,
      [years[0]]: fy1Q.reduce((sum, d) => sum + d.fii_net + d.dii_net, 0),
      [years[1]]: fy2Q.reduce((sum, d) => sum + d.fii_net + d.dii_net, 0),
      [years[2]]: fy3Q.reduce((sum, d) => sum + d.fii_net + d.dii_net, 0),
    };
  });

  // YoY Growth
  const yoyGrowth = fyComparison.map((item, idx) => {
    const current = Number(item[years[0]]) || 0;
    const previous = Number(item[years[1]]) || 0;
    const growth = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;
    
    return {
      month: item.month,
      growth: growth,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fy-comparison">FY Comparison</TabsTrigger>
            <TabsTrigger value="quarter-comparison">Quarter Comparison</TabsTrigger>
            <TabsTrigger value="yoy-growth">YoY Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="fy-comparison" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={fyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey={years[0]} stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={years[1]} stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={years[2]} stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="quarter-comparison" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={quarterComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
                />
                <Legend />
                <Bar dataKey={years[0]} fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey={years[1]} fill="#F97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey={years[2]} fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="yoy-growth" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={yoyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth']}
                />
                <Legend />
                <Bar dataKey="growth" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
