import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CashProvisionalUpload } from './fii-dii/CashProvisionalUpload';
import { FIICashUpload } from './fii-dii/FIICashUpload';
import { FIIFOIndicesUpload } from './fii-dii/FIIFOIndicesUpload';
import { FIIFOStocksUpload } from './fii-dii/FIIFOStocksUpload';
import { DIICashUpload } from './fii-dii/DIICashUpload';
import { DIIFOIndicesUpload } from './fii-dii/DIIFOIndicesUpload';
import { DIIFOStocksUpload } from './fii-dii/DIIFOStocksUpload';

export function FIIDIIActivityAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">FII/DII Activity Data Management</h2>
        <p className="text-muted-foreground mt-1">
          Upload and manage Foreign and Domestic Institutional Investment flows across all segments
        </p>
      </div>

      <Tabs defaultValue="cash-provisional" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 gap-1">
          <TabsTrigger value="cash-provisional" className="text-xs">Cash Provisional</TabsTrigger>
          <TabsTrigger value="fii-cash" className="text-xs">FII Cash</TabsTrigger>
          <TabsTrigger value="fii-fo-indices" className="text-xs">FII F&O Indices</TabsTrigger>
          <TabsTrigger value="fii-fo-stocks" className="text-xs">FII F&O Stocks</TabsTrigger>
          <TabsTrigger value="dii-cash" className="text-xs">DII Cash</TabsTrigger>
          <TabsTrigger value="dii-fo-indices" className="text-xs">DII F&O Indices</TabsTrigger>
          <TabsTrigger value="dii-fo-stocks" className="text-xs">DII F&O Stocks</TabsTrigger>
        </TabsList>

        <TabsContent value="cash-provisional">
          <CashProvisionalUpload />
        </TabsContent>

        <TabsContent value="fii-cash">
          <FIICashUpload />
        </TabsContent>

        <TabsContent value="fii-fo-indices">
          <FIIFOIndicesUpload />
        </TabsContent>

        <TabsContent value="fii-fo-stocks">
          <FIIFOStocksUpload />
        </TabsContent>

        <TabsContent value="dii-cash">
          <DIICashUpload />
        </TabsContent>

        <TabsContent value="dii-fo-indices">
          <DIIFOIndicesUpload />
        </TabsContent>

        <TabsContent value="dii-fo-stocks">
          <DIIFOStocksUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}
