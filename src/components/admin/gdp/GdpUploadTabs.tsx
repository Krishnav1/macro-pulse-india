import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { DataType, UploadStatus } from './GdpAdminTypes';
import { processExcelFile } from './GdpDataProcessor';

interface GdpUploadTabsProps {
  uploading: boolean;
  uploadStatus: UploadStatus | null;
  setUploading: (uploading: boolean) => void;
  setUploadStatus: (status: UploadStatus | null | ((prev: UploadStatus | null) => UploadStatus | null)) => void;
  fetchGdpData: () => void;
}

export const GdpUploadTabs: React.FC<GdpUploadTabsProps> = ({
  uploading,
  uploadStatus,
  setUploading,
  setUploadStatus,
  fetchGdpData
}) => {
  const downloadTemplate = (type: DataType) => {
    const templateUrl = `/templates/gdp_${type.replace('-', '_')}_template.csv`;
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = `gdp_${type.replace('-', '_')}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: DataType) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return;
    }
    
    processExcelFile(file, type, setUploading, setUploadStatus, fetchGdpData);
  };

  return (
    <>
      {/* Upload Tabs */}
      <Tabs defaultValue="annual-value" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="annual-value">Annual Value</TabsTrigger>
          <TabsTrigger value="annual-growth">Annual Growth</TabsTrigger>
          <TabsTrigger value="value">Quarterly Value</TabsTrigger>
          <TabsTrigger value="growth">Quarterly Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="annual-value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Annual GDP Value Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with annual GDP value data in INR crores (both constant and current prices)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('annual-value')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Annual Value Template
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'annual-value')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annual-growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Annual GDP Growth Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with annual GDP growth data in percentages (both constant and current prices)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('annual-growth')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Annual Growth Template
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'annual-growth')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Quarterly GDP Value Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with quarterly GDP value data in INR crores (constant prices only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('value')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Value Template
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'value')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Quarterly GDP Growth Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with quarterly GDP growth data in percentages (constant prices only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('growth')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Growth Template
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'growth')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Status */}
      {uploadStatus && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-muted-foreground">
                  {uploadStatus.processed} / {uploadStatus.total}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(uploadStatus.processed / uploadStatus.total) * 100}%` }}
                />
              </div>
            </div>
            
            {uploadStatus.errors.length > 0 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Issues found:</span>
                </div>
                <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {uploadStatus.errors.slice(0, 10).map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {uploadStatus.errors.length > 10 && (
                    <div>... and {uploadStatus.errors.length - 10} more</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};
