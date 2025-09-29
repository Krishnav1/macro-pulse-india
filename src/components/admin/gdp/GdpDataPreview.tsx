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
                          ₹{(row.gdp_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gdp_current_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.pfce_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.pfce_current_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfce_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfcf_constant_price / 10000000).toFixed(1)}L Cr
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
                          ₹{(row.gdp_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.pfce_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfce_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.gfcf_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.exports_constant_price / 10000000).toFixed(1)}L Cr
                        </td>
                        <td className="text-right p-2">
                          ₹{(row.imports_constant_price / 10000000).toFixed(1)}L Cr
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
  );
};
