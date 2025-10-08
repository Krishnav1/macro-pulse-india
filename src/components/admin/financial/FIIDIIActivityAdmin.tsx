import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FIIDIIMonthlyUpload } from './FIIDIIMonthlyUpload';
import { FIIDIIDailyUpload } from './FIIDIIDailyUpload';
import { FIIDIIDerivativesUpload } from './FIIDIIDerivativesUpload';

export function FIIDIIActivityAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">FII/DII Activity Data Management</h2>
        <p className="text-muted-foreground mt-1">
          Upload and manage Foreign and Domestic Institutional Investment flows
        </p>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Data</TabsTrigger>
          <TabsTrigger value="daily">Daily Data</TabsTrigger>
          <TabsTrigger value="derivatives">Derivatives Data</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <FIIDIIMonthlyUpload />
        </TabsContent>

        <TabsContent value="daily">
          <FIIDIIDailyUpload />
        </TabsContent>

        <TabsContent value="derivatives">
          <FIIDIIDerivativesUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}
