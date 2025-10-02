// =====================================================
// INVESTOR BEHAVIOR ADMIN
// Wrapper component for investor behavior admin interface
// =====================================================

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestorBehaviorUpload } from '../investor-behavior/InvestorBehaviorUpload';
import { UploadHistory } from '../investor-behavior/UploadHistory';

export function InvestorBehaviorAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Investor Behavior Data</h2>
        <p className="text-muted-foreground">
          Manage age group + holding period AUM distribution data
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <InvestorBehaviorUpload />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <UploadHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
