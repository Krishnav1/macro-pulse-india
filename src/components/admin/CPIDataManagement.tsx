import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { CPIDataManager } from './CPIDataManager';
import { CoreCPIUpload } from './CoreCPIUpload';

interface CPIDataManagementProps {
  seriesData: any[];
  isLoading?: boolean;
}

export const CPIDataManagement: React.FC<CPIDataManagementProps> = ({
  seriesData,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CPI Data Management
        </CardTitle>
        <CardDescription>
          Upload and manage CPI data using Excel files for comprehensive inflation analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpi-data" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cpi-data" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CPI Data Upload
            </TabsTrigger>
            <TabsTrigger value="core-cpi" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Core CPI Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cpi-data" className="mt-6">
            <CPIDataManager />
          </TabsContent>

          <TabsContent value="core-cpi" className="mt-6">
            <CoreCPIUpload />
          </TabsContent>
        </Tabs>

        {/* Current Data Display - Limited to 10 entries */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium">Current Data ({Math.min(seriesData.length, 10)} of {seriesData.length} entries shown)</h4>
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {seriesData.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No data entries yet. Upload data using the tabs above.
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {seriesData.slice(0, 10).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-muted-foreground">{entry.period_date || entry.date}</span>
                      <span className="font-semibold">{entry.value || entry.index_value}</span>
                      {entry.period_label && (
                        <span className="text-sm text-muted-foreground">({entry.period_label})</span>
                      )}
                      {entry.geography && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {entry.geography}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CPIDataManagement;
