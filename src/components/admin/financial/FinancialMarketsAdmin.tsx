// Financial Markets Admin Panel - Main Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, PieChart, DollarSign, Globe, Rocket, BarChart3 } from 'lucide-react';
import { MarketBreadthUpload } from './MarketBreadthUpload';
import { MutualFundUpload } from './MutualFundUpload';
import { FIIDIIUpload } from './FIIDIIUpload';
import { IPOUpload } from './IPOUpload';
import { SectorMetricsUpload } from './SectorMetricsUpload';

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
      <Tabs defaultValue="market-breadth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="market-breadth" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Market Breadth</span>
          </TabsTrigger>
          <TabsTrigger value="mutual-funds" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Mutual Funds</span>
          </TabsTrigger>
          <TabsTrigger value="fii-dii" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">FII/DII</span>
          </TabsTrigger>
          <TabsTrigger value="ipo" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">IPO Data</span>
          </TabsTrigger>
          <TabsTrigger value="sector-metrics" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Sector Metrics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market-breadth">
          <MarketBreadthUpload />
        </TabsContent>

        <TabsContent value="mutual-funds">
          <MutualFundUpload />
        </TabsContent>

        <TabsContent value="fii-dii">
          <FIIDIIUpload />
        </TabsContent>

        <TabsContent value="ipo">
          <IPOUpload />
        </TabsContent>

        <TabsContent value="sector-metrics">
          <SectorMetricsUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}
