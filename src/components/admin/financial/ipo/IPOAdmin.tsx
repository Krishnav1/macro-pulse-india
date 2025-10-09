// IPO Admin Component - Manages Mainboard and SME IPO uploads

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket } from 'lucide-react';
import { MainboardIPOUpload } from './MainboardIPOUpload';
import { SMEIPOUpload } from './SMEIPOUpload';

export function IPOAdmin() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            IPO Markets Data Management
          </CardTitle>
          <CardDescription>
            Upload and manage Mainboard and SME IPO data with listing performance and current metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upload Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MainboardIPOUpload />
        <SMEIPOUpload />
      </div>

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Data Format Requirements:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li><strong>Date format:</strong> MM/DD/YYYY (e.g., 8/12/2025 = August 12, 2025) or YYYY-MM-DD</li>
              <li><strong>Excel dates:</strong> Automatically converts Excel serial numbers to proper dates</li>
              <li><strong>Numeric values:</strong> Can include ₹, Rs, Cr, % symbols (cleaned automatically)</li>
              <li><strong>Required fields:</strong> Company Name, Listing Date, Issue Price</li>
              <li><strong>Optional fields:</strong> Main Industry, Sector (helps with analysis)</li>
              <li><strong>File types:</strong> Excel (.xlsx, .xls) or CSV (.csv)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Upload Process:</h4>
            <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Download the appropriate template (Mainboard or SME)</li>
              <li>Fill in your IPO data following the template format</li>
              <li>Select the file to upload - preview will show detected years</li>
              <li>Optionally check "Delete existing data" to replace data for those years</li>
              <li>Click Upload button to process the data</li>
            </ol>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Tip:</strong> The system automatically detects years from listing dates and allows you to replace data year-wise. This prevents accidental deletion of other years' data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
