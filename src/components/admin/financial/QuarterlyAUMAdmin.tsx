// =====================================================
// QUARTERLY AUM ADMIN
// Admin interface for managing quarterly AUM data
// =====================================================

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, History } from 'lucide-react';
import { QuarterlyAUMUpload } from '../quarterly-aum/QuarterlyAUMUpload';
import { UploadHistory } from '../quarterly-aum/UploadHistory';

export function QuarterlyAUMAdmin() {
  return (
    <Tabs defaultValue="upload" className="space-y-6">
      <TabsList>
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Data
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Upload History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <QuarterlyAUMUpload />
      </TabsContent>

      <TabsContent value="history">
        <UploadHistory />
      </TabsContent>
    </Tabs>
  );
}
