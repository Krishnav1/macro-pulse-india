import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyFIIDIIData, DerivativesFIIDIIData } from '@/hooks/financial/useFIIDIIData';

interface SegmentBreakdownTabsProps {
  dailyData: DailyFIIDIIData[];
  derivativesData: DerivativesFIIDIIData[];
}

export function SegmentBreakdownTabs({ dailyData, derivativesData }: SegmentBreakdownTabsProps) {
  // Aggregate cash market data
  const cashData = dailyData.filter(d => d.segment === 'Cash');
  const derivativesSegmentData = dailyData.filter(d => d.segment === 'Derivatives');

  const getCellColor = (value: number) => {
    if (value > 0) return 'bg-success/10 text-success';
    if (value < 0) return 'bg-destructive/10 text-destructive';
    return '';
  };

  return (
    <Tabs defaultValue="cash" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="cash">Cash Market</TabsTrigger>
        <TabsTrigger value="derivatives">Derivatives</TabsTrigger>
        <TabsTrigger value="indices-stocks">Indices vs Stocks</TabsTrigger>
      </TabsList>

      {/* Cash Market Tab */}
      <TabsContent value="cash">
        <Card>
          <CardHeader>
            <CardTitle>Cash Market Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Equity Section */}
              <div>
                <h4 className="font-semibold mb-3">Equity</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Investor Type</th>
                        <th className="p-3 text-right">Gross Purchase</th>
                        <th className="p-3 text-right">Gross Sales</th>
                        <th className="p-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['FII', 'DII'].map(type => {
                        const record = cashData.find(d => d.investor_type === type && d.asset_class === 'Equity');
                        if (!record) return null;
                        return (
                          <tr key={type} className="border-b border-border">
                            <td className="p-3 font-medium">{type}</td>
                            <td className="p-3 text-right">₹{record.gross_purchase.toFixed(0)} Cr</td>
                            <td className="p-3 text-right">₹{record.gross_sales.toFixed(0)} Cr</td>
                            <td className={`p-3 text-right font-semibold ${getCellColor(record.net_purchase_sales)}`}>
                              ₹{record.net_purchase_sales.toFixed(0)} Cr
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Debt Section */}
              <div>
                <h4 className="font-semibold mb-3">Debt</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Investor Type</th>
                        <th className="p-3 text-right">Gross Purchase</th>
                        <th className="p-3 text-right">Gross Sales</th>
                        <th className="p-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['FII', 'DII'].map(type => {
                        const record = cashData.find(d => d.investor_type === type && d.asset_class === 'Debt');
                        if (!record) return null;
                        return (
                          <tr key={type} className="border-b border-border">
                            <td className="p-3 font-medium">{type}</td>
                            <td className="p-3 text-right">₹{record.gross_purchase.toFixed(0)} Cr</td>
                            <td className="p-3 text-right">₹{record.gross_sales.toFixed(0)} Cr</td>
                            <td className={`p-3 text-right font-semibold ${getCellColor(record.net_purchase_sales)}`}>
                              ₹{record.net_purchase_sales.toFixed(0)} Cr
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Derivatives Tab */}
      <TabsContent value="derivatives">
        <Card>
          <CardHeader>
            <CardTitle>Derivatives Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Futures Section */}
              <div>
                <h4 className="font-semibold mb-3">Futures</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Investor Type</th>
                        <th className="p-3 text-right">Gross Purchase</th>
                        <th className="p-3 text-right">Gross Sales</th>
                        <th className="p-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['FII', 'DII'].map(type => {
                        const record = derivativesSegmentData.find(d => d.investor_type === type && d.asset_class === 'Futures');
                        if (!record) return null;
                        return (
                          <tr key={type} className="border-b border-border">
                            <td className="p-3 font-medium">{type}</td>
                            <td className="p-3 text-right">₹{record.gross_purchase.toFixed(0)} Cr</td>
                            <td className="p-3 text-right">₹{record.gross_sales.toFixed(0)} Cr</td>
                            <td className={`p-3 text-right font-semibold ${getCellColor(record.net_purchase_sales)}`}>
                              ₹{record.net_purchase_sales.toFixed(0)} Cr
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Options Section */}
              <div>
                <h4 className="font-semibold mb-3">Options</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Investor Type</th>
                        <th className="p-3 text-right">Gross Purchase</th>
                        <th className="p-3 text-right">Gross Sales</th>
                        <th className="p-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['FII', 'DII'].map(type => {
                        const record = derivativesSegmentData.find(d => d.investor_type === type && d.asset_class === 'Options');
                        if (!record) return null;
                        return (
                          <tr key={type} className="border-b border-border">
                            <td className="p-3 font-medium">{type}</td>
                            <td className="p-3 text-right">₹{record.gross_purchase.toFixed(0)} Cr</td>
                            <td className="p-3 text-right">₹{record.gross_sales.toFixed(0)} Cr</td>
                            <td className={`p-3 text-right font-semibold ${getCellColor(record.net_purchase_sales)}`}>
                              ₹{record.net_purchase_sales.toFixed(0)} Cr
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Indices vs Stocks Tab */}
      <TabsContent value="indices-stocks">
        <Card>
          <CardHeader>
            <CardTitle>Indices vs Stocks Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FII Activity */}
              <div>
                <h4 className="font-semibold mb-3">FII Activity</h4>
                <div className="space-y-4">
                  {['Indices', 'Stocks'].map(marketType => (
                    <div key={marketType}>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{marketType}</p>
                      <div className="space-y-2">
                        {['Futures', 'Options'].map(instrument => {
                          const record = derivativesData.find(
                            d => d.investor_type === 'FII' && 
                                 d.market_type === marketType && 
                                 d.instrument === instrument
                          );
                          if (!record) return null;
                          return (
                            <div key={instrument} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="text-sm">{instrument}</span>
                              <span className={`text-sm font-semibold ${getCellColor(record.net_purchase_sales)}`}>
                                ₹{record.net_purchase_sales.toFixed(0)} Cr
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DII Activity */}
              <div>
                <h4 className="font-semibold mb-3">DII Activity</h4>
                <div className="space-y-4">
                  {['Indices', 'Stocks'].map(marketType => (
                    <div key={marketType}>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{marketType}</p>
                      <div className="space-y-2">
                        {['Futures', 'Options'].map(instrument => {
                          const record = derivativesData.find(
                            d => d.investor_type === 'DII' && 
                                 d.market_type === marketType && 
                                 d.instrument === instrument
                          );
                          if (!record) return null;
                          return (
                            <div key={instrument} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="text-sm">{instrument}</span>
                              <span className={`text-sm font-semibold ${getCellColor(record.net_purchase_sales)}`}>
                                ₹{record.net_purchase_sales.toFixed(0)} Cr
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
