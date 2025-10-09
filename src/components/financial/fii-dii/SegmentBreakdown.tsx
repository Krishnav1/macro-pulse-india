import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFIICashData, useDIICashData } from '@/hooks/financial/useFIIDIIDataNew';

interface SegmentBreakdownProps {
  financialYear: string;
  quarter?: string;
  month?: string;
}

export function SegmentBreakdown({ financialYear, quarter, month }: SegmentBreakdownProps) {
  const [activeTab, setActiveTab] = useState('equity-debt');

  const { data: fiiCashData } = useFIICashData({ financialYear, quarter, month });
  const { data: diiCashData } = useDIICashData({ financialYear, quarter, month });

  // Filter data based on selection - use ALL available data for the selected period
  const filteredFIIData = fiiCashData;
  const filteredDIIData = diiCashData;

  // Determine data format based on selection
  const getDataLabel = () => {
    if (month) {
      return { xLabel: 'date', description: `${month} daily data` };
    } else if (quarter) {
      return { xLabel: 'month', description: `${quarter} monthly aggregates` };
    } else {
      return { xLabel: 'month', description: `${financialYear} monthly aggregates` };
    }
  };

  const dataInfo = getDataLabel();

  // Equity vs Debt breakdown - combine FII and DII by matching dates
  const equityDebtData = filteredFIIData.map((fiiItem, idx) => {
    const diiItem = filteredDIIData[idx];
    const date = new Date(fiiItem.date);
    const day = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    
    return {
      date: day,
      month: monthShort,
      fullDate: fiiItem.date,
      fiiEquity: Number(fiiItem.equity_net) || 0,
      fiiDebt: Number(fiiItem.debt_net) || 0,
      diiEquity: Number(diiItem?.equity_net) || 0,
      diiDebt: Number(diiItem?.debt_net) || 0,
    };
  });

  // FII breakdown
  const fiiBreakdown = filteredFIIData.map(item => {
    const date = new Date(item.date);
    const day = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    return {
      date: day,
      month: monthShort,
      fullDate: item.date,
      equity: Number(item.equity_net) || 0,
      debt: Number(item.debt_net) || 0,
    };
  });

  // DII breakdown
  const diiBreakdown = filteredDIIData.map(item => {
    const date = new Date(item.date);
    const day = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    return {
      date: day,
      month: monthShort,
      fullDate: item.date,
      equity: Number(item.equity_net) || 0,
      debt: Number(item.debt_net) || 0,
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
            <p className="text-sm text-muted-foreground mb-4">
              Combined FII & DII equity and debt flows ({dataInfo.description}) | Values in ₹ Crore
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={equityDebtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey={dataInfo.xLabel} 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                <Bar dataKey="fiiEquity" name="FII Equity" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fiiDebt" name="FII Debt" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diiEquity" name="DII Equity" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diiDebt" name="DII Debt" fill="#84CC16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Interpretation */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">📊 Understanding This Chart:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Positive bars (above 0):</strong> Net buying - money flowing INTO Indian markets</li>
                <li>• <strong>Negative bars (below 0):</strong> Net selling - money flowing OUT of Indian markets</li>
                <li>• <strong>FII Equity (Blue):</strong> Foreign investment in stocks</li>
                <li>• <strong>FII Debt (Teal):</strong> Foreign investment in bonds</li>
                <li>• <strong>DII Equity (Orange):</strong> Domestic institutional buying in stocks</li>
                <li>• <strong>DII Debt (Green):</strong> Domestic institutional buying in bonds</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="fii-breakdown" className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              FII equity vs debt breakdown ({dataInfo.description}) | Values in ₹ Crore
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={fiiBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={dataInfo.xLabel} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                <Bar dataKey="equity" name="Equity Net" fill="#6366F1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="debt" name="Debt Net" fill="#14B8A6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Interpretation */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">📊 FII Investment Pattern:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Equity (Blue):</strong> FII buying/selling in stock market</li>
                <li>• <strong>Debt (Teal):</strong> FII buying/selling in bond market</li>
                <li>• <strong>Positive = Buying:</strong> Foreign investors are confident</li>
                <li>• <strong>Negative = Selling:</strong> Foreign investors are cautious</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="dii-breakdown" className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              DII equity vs debt breakdown ({dataInfo.description}) | Values in ₹ Crore
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={diiBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={dataInfo.xLabel} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                <Bar dataKey="equity" name="Equity Net" fill="#F97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="debt" name="Debt Net" fill="#84CC16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Interpretation */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">📊 DII Investment Pattern:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Equity (Orange):</strong> DII buying/selling in stock market</li>
                <li>• <strong>Debt (Green):</strong> DII buying/selling in bond market</li>
                <li>• <strong>Positive = Buying:</strong> Domestic institutions are bullish</li>
                <li>• <strong>Negative = Selling:</strong> Domestic institutions are bearish</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
