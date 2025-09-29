import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GdpValueRow,
  GdpGrowthRow,
  GdpAnnualValueRow,
  GdpAnnualGrowthRow
} from './GdpAdminTypes';

interface GdpDataPreviewProps {
  valueData: GdpValueRow[];
  growthData: GdpGrowthRow[];
  annualValueData: GdpAnnualValueRow[];
  annualGrowthData: GdpAnnualGrowthRow[];
  loading: boolean;
}

export const GdpDataPreview: React.FC<GdpDataPreviewProps> = ({
  valueData,
  growthData,
  annualValueData,
  annualGrowthData,
  loading
}) => {
  return (
    <div className="space-y-4">
      {/* Sample Data Explanation */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">📊 Data Format & Conversion Example</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Input Data Format (Excel):</h4>
              <div className="bg-white p-3 rounded border">
                <p><strong>Raw Value:</strong> 33,012,921 (in Crore)</p>
                <p className="text-muted-foreground">This is how data appears in your Excel files</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Display Format (Dashboard):</h4>
              <div className="bg-white p-3 rounded border">
                <p><strong>Converted Value:</strong> ₹330.12 Trillion</p>
                <p className="text-muted-foreground">Calculation: 33,012,921 ÷ 100,000 = 330.12</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-green-800"><strong>Conversion Rule:</strong> 1 Lakh Crore = 1 Trillion | Divide by 100,000 to convert Crore to Trillion</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="annual-value-preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="annual-value-preview">Annual Value</TabsTrigger>
          <TabsTrigger value="annual-growth-preview">Annual Growth</TabsTrigger>
          <TabsTrigger value="value-preview">Quarterly Value</TabsTrigger>
          <TabsTrigger value="growth-preview">Quarterly Growth</TabsTrigger>
        </TabsList>

      <TabsContent value="annual-value-preview">
        <Card>
          <CardHeader>
            <CardTitle>Recent Annual Value Data ({annualValueData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading data...</div>
            ) : annualValueData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No annual value data available. Upload an Excel file to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">GDP (Constant)</th>
                      <th className="text-right p-2">GDP (Current)</th>
                      <th className="text-right p-2">PFCE (Constant)</th>
                      <th className="text-right p-2">PFCE (Current)</th>
                      <th className="text-right p-2">GFCE (Constant)</th>
                      <th className="text-right p-2">GFCF (Constant)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annualValueData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{row.year}</td>
                        <td className="text-right p-2">
                          ₹{(row.gdp_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gdp_current_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.pfce_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.pfce_current_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfce_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfcf_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="annual-growth-preview">
        <Card>
          <CardHeader>
            <CardTitle>Recent Annual Growth Data ({annualGrowthData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading data...</div>
            ) : annualGrowthData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No annual growth data available. Upload an Excel file to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">GDP Growth (Constant)</th>
                      <th className="text-right p-2">GDP Growth (Current)</th>
                      <th className="text-right p-2">PFCE Growth (Constant)</th>
                      <th className="text-right p-2">PFCE Growth (Current)</th>
                      <th className="text-right p-2">GFCE Growth (Constant)</th>
                      <th className="text-right p-2">GFCF Growth (Constant)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annualGrowthData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{row.year}</td>
                        <td className="text-right p-2">
                          {row.gdp_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.gdp_current_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.pfce_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.pfce_current_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.gfce_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.gfcf_constant_price_growth.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="value-preview">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quarterly Value Data ({valueData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading data...</div>
            ) : valueData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No value data available. Upload an Excel file to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-left p-2">Quarter</th>
                      <th className="text-right p-2">GDP</th>
                      <th className="text-right p-2">PFCE</th>
                      <th className="text-right p-2">GFCE</th>
                      <th className="text-right p-2">GFCF</th>
                      <th className="text-right p-2">Exports</th>
                      <th className="text-right p-2">Imports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valueData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{row.year}</td>
                        <td className="p-2">{row.quarter}</td>
                        <td className="text-right p-2">
                          ₹{(row.gdp_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.pfce_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfce_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfcf_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.exports_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.imports_constant_price / 100000).toFixed(2)} Trillion
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="growth-preview">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quarterly Growth Data ({growthData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading data...</div>
            ) : growthData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No growth data available. Upload an Excel file to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-left p-2">Quarter</th>
                      <th className="text-right p-2">GDP Growth</th>
                      <th className="text-right p-2">PFCE Growth</th>
                      <th className="text-right p-2">GFCE Growth</th>
                      <th className="text-right p-2">GFCF Growth</th>
                      <th className="text-right p-2">Exports Growth</th>
                      <th className="text-right p-2">Imports Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{row.year}</td>
                        <td className="p-2">{row.quarter}</td>
                        <td className="text-right p-2">
                          {row.gdp_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.pfce_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.gfce_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.gfcf_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.exports_constant_price_growth.toFixed(1)}%
                        </td>
                        <td className="text-right p-2">
                          {row.imports_constant_price_growth.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  );
};
