// Sector Analysis Component

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IPOListing, SectorPerformance } from '@/types/ipo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

interface SectorAnalysisProps {
  ipos: IPOListing[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function SectorAnalysis({ ipos }: SectorAnalysisProps) {
  const sectorData = useMemo(() => {
    const sectors: Record<string, SectorPerformance> = {};

    ipos.forEach(ipo => {
      const sector = ipo.main_industry || ipo.sector || 'Others';
      
      if (!sectors[sector]) {
        sectors[sector] = {
          sector,
          ipoCount: 0,
          totalIssueSize: 0,
          avgListingGain: 0,
          avgCurrentGain: 0,
          successRate: 0,
          bestPerformer: '',
          worstPerformer: '',
        };
      }

      sectors[sector].ipoCount++;
      sectors[sector].totalIssueSize += ipo.issue_size || 0;
    });

    // Calculate averages and find best/worst performers
    Object.keys(sectors).forEach(sector => {
      const sectorIPOs = ipos.filter(ipo => (ipo.main_industry || ipo.sector || 'Others') === sector);
      
      const listingGains = sectorIPOs
        .filter(ipo => ipo.listing_gain_percent !== null)
        .map(ipo => ipo.listing_gain_percent!);
      
      const currentGains = sectorIPOs
        .filter(ipo => ipo.current_gain_percent !== null)
        .map(ipo => ipo.current_gain_percent!);

      sectors[sector].avgListingGain = listingGains.length > 0
        ? listingGains.reduce((sum, gain) => sum + gain, 0) / listingGains.length
        : 0;

      sectors[sector].avgCurrentGain = currentGains.length > 0
        ? currentGains.reduce((sum, gain) => sum + gain, 0) / currentGains.length
        : 0;

      sectors[sector].successRate = currentGains.length > 0
        ? (currentGains.filter(gain => gain > 0).length / currentGains.length) * 100
        : 0;

      // Find best and worst performers
      const sortedByCurrentGain = sectorIPOs
        .filter(ipo => ipo.current_gain_percent !== null)
        .sort((a, b) => (b.current_gain_percent || 0) - (a.current_gain_percent || 0));

      sectors[sector].bestPerformer = sortedByCurrentGain[0]?.company_name || '-';
      sectors[sector].worstPerformer = sortedByCurrentGain[sortedByCurrentGain.length - 1]?.company_name || '-';
    });

    return Object.values(sectors).sort((a, b) => b.avgCurrentGain - a.avgCurrentGain);
  }, [ipos]);

  const pieChartData = sectorData.map(sector => ({
    name: sector.sector,
    value: sector.ipoCount,
  }));

  const barChartData = sectorData.map(sector => ({
    sector: sector.sector.length > 15 ? sector.sector.substring(0, 15) + '...' : sector.sector,
    listingGain: sector.avgListingGain,
    currentGain: sector.avgCurrentGain,
  }));

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Number of IPOs by main industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Performance</CardTitle>
            <CardDescription>Average gains by main industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="sector" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="listingGain" name="Listing Gain %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="currentGain" name="Current Gain %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sector Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Industry-wise Performance Details</CardTitle>
          <CardDescription>Comprehensive industry analysis with top performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Main Industry</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-muted-foreground">IPO Count</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Total Issue Size</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Avg Listing Gain</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Avg Current Gain</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Success Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Best Performer</th>
                </tr>
              </thead>
              <tbody>
                {sectorData.map((sector, index) => (
                  <tr key={sector.sector} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">{sector.sector}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {sector.ipoCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ₹{sector.totalIssueSize.toFixed(0)} Cr
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {sector.avgListingGain >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`font-semibold ${
                          sector.avgListingGain >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sector.avgListingGain >= 0 ? '+' : ''}{sector.avgListingGain.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {sector.avgCurrentGain >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`font-bold ${
                          sector.avgCurrentGain >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sector.avgCurrentGain >= 0 ? '+' : ''}{sector.avgCurrentGain.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${
                        sector.successRate >= 50 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {sector.successRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {sector.bestPerformer.length > 25 
                        ? sector.bestPerformer.substring(0, 25) + '...' 
                        : sector.bestPerformer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
