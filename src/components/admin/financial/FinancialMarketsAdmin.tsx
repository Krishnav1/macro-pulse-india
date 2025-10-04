// Financial Markets Admin Panel - Main Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, Users, Activity, PieChart } from 'lucide-react';
import MutualFundDataAdmin from './MutualFundDataAdmin';
import { QuarterlyAUMAdmin } from './QuarterlyAUMAdmin';
import { InvestorBehaviorAdmin } from './InvestorBehaviorAdmin';
import { EquityMarketsAdmin } from './EquityMarketsAdmin';

export function FinancialMarketsAdmin() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Financial Markets Data Management
          </CardTitle>
          <CardDescription>
            Upload and manage financial market data including market breadth, mutual funds, FII/DII flows, IPO data, and sector metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Upload Tabs */}
      <Tabs defaultValue="equity-markets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equity-markets" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Equity Markets</span>
          </TabsTrigger>
          <TabsTrigger value="quarterly-aum" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Quarterly AUM</span>
          </TabsTrigger>
          <TabsTrigger value="investor-behavior" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Investor Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="mutual-funds" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Mutual Funds</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quarterly-aum">
          <QuarterlyAUMAdmin />
        </TabsContent>

        <TabsContent value="investor-behavior">
          <InvestorBehaviorAdmin />
        </TabsContent>

        <TabsContent value="mutual-funds">
          <MutualFundDataAdmin />
        </TabsContent>

        <TabsContent value="equity-markets">
          <EquityMarketsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
