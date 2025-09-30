import React, { useState, useEffect } from 'react';
import { X, TrendingUp, BarChart3, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { HeatmapIndicator } from '../../hooks/useHeatmapIndicators';

interface StateData {
  indicator: HeatmapIndicator;
  values: Array<{
    year_label: string;
    value: number;
    source?: string;
  }>;
}

interface StateDetailsDrawerProps {
  stateName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StateDetailsDrawer: React.FC<StateDetailsDrawerProps> = ({
  stateName,
  isOpen,
  onClose,
}) => {
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && stateName) {
      fetchStateData();
    }
  }, [isOpen, stateName]);

  const fetchStateData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all indicators and their values for this state
      const { data: valuesData, error: valuesError } = await supabase
        .from('heatmap_values')
        .select(`
          year_label,
          value,
          source,
          heatmap_indicators (
            id,
            slug,
            name,
            unit,
            description,
            category
          )
        `)
        .eq('state_name', stateName)
        .order('year_label', { ascending: false });

      if (valuesError) throw valuesError;

      // Group by indicator
      const groupedData: { [indicatorId: string]: StateData } = {};
      
      valuesData?.forEach((item: any) => {
        const indicator = item.heatmap_indicators;
        if (!indicator) return;

        if (!groupedData[indicator.id]) {
          groupedData[indicator.id] = {
            indicator,
            values: [],
          };
        }

        groupedData[indicator.id].values.push({
          year_label: item.year_label,
          value: item.value,
          source: item.source,
        });
      });

      // Sort indicators by name and values by year
      const sortedData = Object.values(groupedData)
        .sort((a, b) => a.indicator.name.localeCompare(b.indicator.name))
        .map(item => ({
          ...item,
          values: item.values.sort((a, b) => {
            // Sort fiscal years properly
            const yearA = parseInt(a.year_label.split('-')[0]);
            const yearB = parseInt(b.year_label.split('-')[0]);
            return yearB - yearA; // Latest first
          }),
        }));

      setStateData(sortedData);
    } catch (err) {
      console.error('Error fetching state data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch state data');
    } finally {
      setLoading(false);
    }
  };

  const getValueTrend = (values: Array<{ year_label: string; value: number }>) => {
    if (values.length < 2) return null;
    
    const latest = values[0].value;
    const previous = values[1].value;
    const change = latest - previous;
    const changePercent = (change / previous) * 100;
    
    return {
      change,
      changePercent,
      isPositive: change > 0,
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{stateName}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error loading data</p>
              <p className="text-sm text-gray-600">{error}</p>
              <Button onClick={fetchStateData} variant="outline" size="sm" className="mt-4">
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && stateData.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600">
                No indicators have been uploaded for {stateName} yet.
              </p>
            </div>
          )}

          {!loading && !error && stateData.length > 0 && (
            <>
              {/* Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Available Indicators ({stateData.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {stateData.map((item) => (
                    <Badge key={item.indicator.id} variant="secondary" className="text-xs">
                      {item.indicator.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Indicators List */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Detailed Data</h3>
                
                {stateData.map((item) => {
                  const trend = getValueTrend(item.values);
                  const latestValue = item.values[0];
                  
                  return (
                    <Card key={item.indicator.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{item.indicator.name}</CardTitle>
                        {item.indicator.description && (
                          <p className="text-xs text-gray-600">{item.indicator.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Latest Value */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-semibold">
                              {latestValue.value.toFixed(2)} {item.indicator.unit}
                            </div>
                            <div className="text-xs text-gray-600">
                              Latest: {latestValue.year_label}
                            </div>
                          </div>
                          
                          {trend && (
                            <div className={`flex items-center gap-1 text-sm ${
                              trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <TrendingUp className={`h-4 w-4 ${
                                !trend.isPositive ? 'rotate-180' : ''
                              }`} />
                              <span>
                                {trend.isPositive ? '+' : ''}
                                {trend.changePercent.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Historical Values */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Historical Data ({item.values.length} years)
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {item.values.map((value, index) => (
                              <div 
                                key={`${value.year_label}-${index}`}
                                className="flex justify-between text-xs py-1 px-2 bg-gray-50 rounded"
                              >
                                <span className="text-gray-600">{value.year_label}</span>
                                <span className="font-medium">
                                  {value.value.toFixed(2)} {item.indicator.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Source */}
                        {latestValue.source && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500">
                              Source: {latestValue.source}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
