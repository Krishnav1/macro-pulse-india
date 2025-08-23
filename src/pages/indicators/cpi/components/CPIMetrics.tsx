import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { useCpiSeries } from '@/hooks/useCpiSeries';
import { useCpiMetrics } from '@/hooks/useCpiMetrics';
import { useCpiComponents } from '@/hooks/useCpiComponents';
import { format } from 'date-fns';

interface CPIMetricsProps {
  geography: 'rural' | 'urban' | 'combined';
}

export const CPIMetrics = ({ geography }: CPIMetricsProps) => {
  // Use the new CPI metrics hook for calculated values
  const { 
    yoyInflation, 
    lastChange, 
    cpiIndex, 
    momInflation, 
    lastUpdated, 
    loading, 
    error 
  } = useCpiMetrics(geography);

  // Get component breakdown data
  const { data: componentData, loading: componentsLoading } = useCpiComponents({ geography });

  const getTrendIcon = () => {
    if (lastChange > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (lastChange < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <>
      {/* Main Indicator Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              CPI {geography.charAt(0).toUpperCase() + geography.slice(1)}
              {getTrendIcon()}
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-500/10 border-orange-500/20 border">
              Price Index
            </Badge>
          </div>
          <CardDescription>
            Source: MOSPI | Last Updated: {lastUpdated ? format(new Date(lastUpdated), 'dd MMMM yyyy') : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading metrics...</div>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-muted-foreground">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  {yoyInflation ? yoyInflation.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  YoY Inflation
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className={`text-lg font-bold ${
                  (lastChange || 0) > 0 ? 'text-red-500' : (lastChange || 0) < 0 ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  {(lastChange || 0) > 0 ? '+' : ''}{lastChange ? lastChange.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last Change
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {cpiIndex ? cpiIndex.toFixed(1) : '--'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  CPI Index
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {momInflation ? momInflation.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  MoM Inflation
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inflation Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4" />
            Inflation Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {componentsLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading component data...
            </div>
          ) : componentData.length > 0 ? (
            componentData.map((component, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{component.component_name}:</span>
                <span className={`font-semibold ${
                  (component.yoy_inflation || 0) > 0 ? 'text-red-500' : 
                  (component.yoy_inflation || 0) < 0 ? 'text-green-500' : 'text-foreground'
                }`}>
                  {component.yoy_inflation ? 
                    `${component.yoy_inflation > 0 ? '+' : ''}${component.yoy_inflation.toFixed(2)}%` : 
                    '--'
                  }
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No component data available
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
