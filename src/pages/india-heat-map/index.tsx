import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IndiaHeatmapMapbox } from '@/components/heatmap/IndiaHeatmapMapbox';
import { HeatmapControls } from '@/components/heatmap/HeatmapControls';
import { StateDetailsDrawer } from '@/components/heatmap/StateDetailsDrawer';
import { HeatmapLegend } from '@/components/heatmap/HeatmapLegend';
import { useHeatmapIndicators } from '@/hooks/useHeatmapIndicators';
import { useHeatmapYears } from '@/hooks/useHeatmapYears';
import { useHeatmapValues } from '@/hooks/useHeatmapValues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Map, AlertCircle } from 'lucide-react';

export default function IndiaHeatMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Data hooks
  const { indicators, loading: indicatorsLoading, error: indicatorsError } = useHeatmapIndicators();
  const { years, loading: yearsLoading } = useHeatmapYears(selectedIndicatorId);
  const { stateValueMap, stats, loading: valuesLoading, error: valuesError } = useHeatmapValues(
    selectedIndicatorId,
    selectedYear
  );

  // URL sync with throttling - simplified without auto-selection
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const indicatorParam = searchParams.get('indicator');
      const yearParam = searchParams.get('year');

      if (indicatorParam && indicators.length > 0) {
        const indicator = indicators.find(ind => ind.slug === indicatorParam);
        if (indicator && indicator.id !== selectedIndicatorId) {
          setSelectedIndicatorId(indicator.id);
        }
      }

      if (yearParam && years.length > 0) {
        if (years.includes(yearParam) && yearParam !== selectedYear) {
          setSelectedYear(yearParam);
        }
      }
    }, 100); // 100ms throttle

    return () => clearTimeout(timeoutId);
  }, [indicators, years, searchParams, selectedIndicatorId, selectedYear]);

  // Update URL when selections change
  useEffect(() => {
    if (selectedIndicatorId && selectedYear) {
      const indicator = indicators.find(ind => ind.id === selectedIndicatorId);
      if (indicator) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('indicator', indicator.slug);
        newParams.set('year', selectedYear);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [selectedIndicatorId, selectedYear, indicators, searchParams, setSearchParams]);

  const handleIndicatorChange = (indicatorId: string) => {
    setSelectedIndicatorId(indicatorId);
    setSelectedYear(''); // Reset year when indicator changes
    setSelectedState(null); // Close drawer
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const handleStateClick = (stateName: string) => {
    setSelectedState(stateName);
  };

  const handleCloseDrawer = () => {
    setSelectedState(null);
  };

  const startAnimation = () => {
    if (years.length <= 1) return;
    
    setIsAnimating(true);
    let currentIndex = 0;
    
    const animate = () => {
      if (currentIndex < years.length) {
        setSelectedYear(years[currentIndex]);
        currentIndex++;
        setTimeout(animate, animationSpeed);
      } else {
        setIsAnimating(false);
      }
    };
    
    animate();
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const selectedIndicator = indicators.find(ind => ind.id === selectedIndicatorId);
  const loading = indicatorsLoading || yearsLoading || valuesLoading;
  const hasData = selectedIndicatorId && selectedYear && Object.keys(stateValueMap).length > 0;

  if (indicatorsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading indicators: {indicatorsError}
            <br />
            <span className="text-sm mt-2 block">
              This might be due to database permissions. Please check the Supabase configuration.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && indicators.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading heatmap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b-4 border-blue-800 shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Map className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">India Heat Map</h1>
              <p className="text-blue-50 mt-2 text-lg font-medium">
                Interactive state-wise visualization of economic indicators
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-2 border-blue-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 border-b-2 border-blue-700">
                <CardTitle className="text-white text-xl font-bold">Controls</CardTitle>
              </CardHeader>
              <CardContent className="bg-gradient-to-b from-white to-gray-50 p-6">
                <HeatmapControls
                  indicators={indicators}
                  selectedIndicatorId={selectedIndicatorId}
                  onIndicatorChange={handleIndicatorChange}
                  years={years}
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  isAnimating={isAnimating}
                  animationSpeed={animationSpeed}
                  onAnimationSpeedChange={setAnimationSpeed}
                  onStartAnimation={startAnimation}
                  onStopAnimation={stopAnimation}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {/* Legend */}
            {hasData && stats && selectedIndicator && (
              <Card className="mt-4 shadow-2xl border-2 border-green-200 bg-white">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 border-b-2 border-green-700">
                  <CardTitle className="text-white text-xl font-bold">Legend</CardTitle>
                </CardHeader>
                <CardContent className="bg-gradient-to-b from-white to-gray-50 p-6">
                  <HeatmapLegend
                    stats={stats}
                    unit={selectedIndicator.unit}
                    indicatorName={selectedIndicator.name}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col shadow-2xl border-2 border-blue-200 bg-white">
              <CardContent className="p-0 flex-1 relative bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading map data...</span>
                    </div>
                  </div>
                )}

                {valuesError && (
                  <div className="flex items-center justify-center h-full p-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Error loading map data: {valuesError}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {!loading && !valuesError && indicators.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Data Available
                      </h3>
                      <p className="text-gray-600">
                        Upload heatmap data through the admin panel to get started.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && !valuesError && selectedIndicatorId && selectedYear && (
                  <div className="absolute inset-0">
                    <IndiaHeatmapMapbox
                      stateValueMap={stateValueMap}
                      stats={stats}
                      onStateClick={handleStateClick}
                      selectedIndicator={selectedIndicator}
                      selectedYear={selectedYear}
                    />
                  </div>
                )}

                {/* Show message when no indicator/year selected */}
                {!loading && !valuesError && (!selectedIndicatorId || !selectedYear) && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select Indicator and Year
                      </h3>
                      <p className="text-gray-600">
                        Choose an indicator and year from the controls to view the heatmap.
                      </p>
                    </div>
                  </div>
                )}

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 text-xs rounded">
                    <div>Indicators: {indicators.length}</div>
                    <div>Selected ID: {selectedIndicatorId}</div>
                    <div>Selected Year: {selectedYear}</div>
                    <div>State Values: {Object.keys(stateValueMap).length}</div>
                    <div>Loading: {loading.toString()}</div>
                    <div>Error: {valuesError || 'none'}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Selection Info */}
            {selectedIndicator && selectedYear && (
              <Card className="mt-4 shadow-lg border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{selectedIndicator.name}</h3>
                      <p className="text-sm text-gray-600">
                        Year: {selectedYear} • Unit: {selectedIndicator.unit}
                      </p>
                    </div>
                    {stats && (
                      <div className="text-right text-sm">
                        <div>States with data: {stats.count}</div>
                        <div>Range: {stats.min.toFixed(2)} - {stats.max.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* State Details Drawer */}
      {selectedState && (
        <StateDetailsDrawer
          stateName={selectedState}
          isOpen={!!selectedState}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}
