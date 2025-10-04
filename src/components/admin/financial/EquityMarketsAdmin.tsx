// Equity Markets Admin - Complete NSE Data Management

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Upload, History, Database, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { NSEDataSyncAdmin } from '@/components/admin/equity/NSEDataSyncAdmin';
import { NSEIndicesUpload } from './NSEIndicesUpload';
import { NSEStockPricesUpload } from './NSEStockPricesUpload';
import { NSEBulkDealsUpload } from './NSEBulkDealsUpload';
import { NSEBlockDealsUpload } from './NSEBlockDealsUpload';
import { NSEFIIDIIUpload } from './NSEFIIDIIUpload';
import { NSEMarketBreadthUpload } from './NSEMarketBreadthUpload';

export function EquityMarketsAdmin() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Equity Markets Data Management
          </CardTitle>
          <CardDescription>
            Sync NSE data automatically or upload manually. Includes indices, stock prices, bulk/block deals, FII/DII activity, and market breadth.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="auto-sync" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="auto-sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Auto Sync</span>
          </TabsTrigger>
          <TabsTrigger value="indices" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Indices</span>
          </TabsTrigger>
          <TabsTrigger value="stocks" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Stocks</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-deals" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Deals</span>
          </TabsTrigger>
          <TabsTrigger value="block-deals" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Block Deals</span>
          </TabsTrigger>
          <TabsTrigger value="fii-dii" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">FII/DII</span>
          </TabsTrigger>
          <TabsTrigger value="breadth" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Breadth</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Auto Sync */}
        <TabsContent value="auto-sync">
          <NSEDataSyncAdmin />
        </TabsContent>

        {/* Tab 2: Indices Upload */}
        <TabsContent value="indices">
          <NSEIndicesUpload />
        </TabsContent>

        {/* Tab 3: Stock Prices Upload */}
        <TabsContent value="stocks">
          <NSEStockPricesUpload />
        </TabsContent>

        {/* Tab 4: Bulk Deals Upload */}
        <TabsContent value="bulk-deals">
          <NSEBulkDealsUpload />
        </TabsContent>

        {/* Tab 5: Block Deals Upload */}
        <TabsContent value="block-deals">
          <NSEBlockDealsUpload />
        </TabsContent>

        {/* Tab 6: FII/DII Upload */}
        <TabsContent value="fii-dii">
          <NSEFIIDIIUpload />
        </TabsContent>

        {/* Tab 7: Market Breadth Upload */}
        <TabsContent value="breadth">
          <NSEMarketBreadthUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}
