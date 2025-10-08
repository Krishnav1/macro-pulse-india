import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFIICashData, useDIICashData } from '@/hooks/financial/useFIIDIIDataNew';

interface SegmentBreakdownProps {
  financialYear: string;
}

export function SegmentBreakdown({ financialYear }: SegmentBreakdownProps) {
  const [activeTab, setActiveTab] = useState('equity-debt');

  const { data: fiiCashData } = useFIICashData({ financialYear });
  const { data: diiCashData } = useDIICashData({ financialYear });

  // Get last 6 months of data
  const last6MonthsFII = fiiCashData.slice(-6);
  const last6MonthsDII = diiCashData.slice(-6);

  // Equity vs Debt breakdown - combine FII and DII by matching months
  const equityDebtData = last6MonthsFII.map((fiiItem) => {
    const diiItem = last6MonthsDII.find(d => d.month_name === fiiItem.month_name);
    const monthShort = fiiItem.month_name.split(' ')[0]; // "September 2025" -> "September"
    
    return {
      month: monthShort,
      fiiEquity: fiiItem.equity_net,
      fiiDebt: fiiItem.debt_net,
      diiEquity: diiItem?.equity_net || 0,
      diiDebt: diiItem?.debt_net || 0,
    };
  });

  // FII breakdown
  const fiiBreakdown = last6MonthsFII.map(item => {
    const monthShort = item.month_name.split(' ')[0];
    return {
      month: monthShort,
      equity: item.equity_net,
      debt: item.debt_net,
    };
  });

  // DII breakdown
  const diiBreakdown = last6MonthsDII.map(item => {
    const monthShort = item.month_name.split(' ')[0];
    return {
      month: monthShort,
      equity: item.equity_net,
      debt: item.debt_net,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segment Breakdown Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equity-debt">Equity vs Debt</TabsTrigger>
            <TabsTrigger value="fii-breakdown">FII Breakdown</TabsTrigger>
            <TabsTrigger value="dii-breakdown">DII Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="equity-debt" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={equityDebtData}>
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
                <Bar dataKey="fiiEquity" name="FII Equity" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fiiDebt" name="FII Debt" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diiEquity" name="DII Equity" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diiDebt" name="DII Debt" fill="#84CC16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="fii-breakdown" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={fiiBreakdown}>
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
                <Bar dataKey="equity" name="Equity Net" fill="#6366F1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="debt" name="Debt Net" fill="#14B8A6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="dii-breakdown" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={diiBreakdown}>
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
                <Bar dataKey="equity" name="Equity Net" fill="#F97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="debt" name="Debt Net" fill="#84CC16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
