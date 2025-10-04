import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IndiaHeatmapMapbox } from '@/components/heatmap/IndiaHeatmapMapbox';
import { CityAumMap } from '@/components/heatmap/CityAumMap';
import { StateAumMap } from '@/components/heatmap/StateAumMap';
import { HeatmapControls } from '@/components/heatmap/HeatmapControls';
import { StateDetailsDrawer } from '@/components/heatmap/StateDetailsDrawer';
import { HeatmapLegend } from '@/components/heatmap/HeatmapLegend';
import { useHeatmapIndicators } from '@/hooks/useHeatmapIndicators';
import { useHeatmapYears } from '@/hooks/useHeatmapYears';
import { useHeatmapValues } from '@/hooks/useHeatmapValues';
import { useCityAumQuarters, useCityAumData } from '@/hooks/useCityAumData';
import { useStateAumMonths, useStateAumComposition } from '@/hooks/useStateAumData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Map, AlertCircle, MapPin, TrendingUp } from 'lucide-react';

export default function IndiaHeatMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [viewMode, setViewMode] = useState<'state' | 'city' | 'state-aum'>('state');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [stateAumViewMode, setStateAumViewMode] = useState<'overall' | 'liquid' | 'debt' | 'equity' | 'etfs'>('overall');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Data hooks for state indicators view
  const { indicators, loading: indicatorsLoading, error: indicatorsError } = useHeatmapIndicators();
  const { years, loading: yearsLoading } = useHeatmapYears(selectedIndicatorId);
  const { stateValueMap, stats, loading: valuesLoading, error: valuesError } = useHeatmapValues(
    selectedIndicatorId,
    selectedYear
  );

  // Data hooks for city AUM view
  const { quarters, loading: quartersLoading } = useCityAumQuarters();
  const { data: cityAumData, loading: cityAumLoading } = useCityAumData(selectedQuarter);

  // Data hooks for state AUM view
  const { months, loading: monthsLoading } = useStateAumMonths();
  const { data: stateAumData, loading: stateAumLoading } = useStateAumComposition(selectedMonth);

  // Auto-select first month when months load
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

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
        // Stop after one complete cycle
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">India Heat Map</h1>
              <p className="text-muted-foreground text-sm">
                Interactive state-wise visualization of economic indicators
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'state' | 'city' | 'state-aum')} className="mb-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="state" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              State Indicators
            </TabsTrigger>
            <TabsTrigger value="city" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              City AUM
            </TabsTrigger>
            <TabsTrigger value="state-aum" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              State AUM
            </TabsTrigger>
          </TabsList>

          {/* State View */}
          <TabsContent value="state" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-border bg-card">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-foreground text-lg font-semibold">Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
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
                  <Card className="mt-4 shadow-lg border-border bg-card">
                    <CardHeader className="border-b border-border">
                      <CardTitle className="text-foreground text-lg font-semibold">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
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
                <Card className="h-[600px] flex flex-col shadow-lg border-border bg-card">
                  <CardContent className="p-0 flex-1 relative bg-muted/30">
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-lg font-medium text-foreground">Loading map data...</span>
                    </div>
                  </div>
                )}

                {valuesError && (
                  <div className="flex items-center justify-center h-full">
                    <Alert variant="destructive" className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {valuesError}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                {!loading && !valuesError && indicators.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No Indicators Available
                      </h3>
                      <p className="text-muted-foreground">
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
                      <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Select Indicator and Year
                      </h3>
                      <p className="text-muted-foreground">
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
              <Card className="mt-4 shadow-lg border-border bg-card">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{selectedIndicator.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Year: {selectedYear} • Unit: {selectedIndicator.unit}
                      </p>
                    </div>
                    {stats && (
                      <div className="text-right text-sm text-muted-foreground">
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
          </TabsContent>

          {/* City AUM View */}
          <TabsContent value="city" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Quarter Selector Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-border bg-card">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-foreground text-lg font-semibold">Select Quarter</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Quarter End Date</label>
                      <select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                        disabled={quartersLoading}
                      >
                        <option value="">Select Quarter</option>
                        {quarters.map((quarter) => (
                          <option key={quarter} value={quarter}>
                            {quarter}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedQuarter && cityAumData.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium text-foreground mb-2">Summary</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Total Cities: {cityAumData.length}</div>
                          <div>Mapped: {cityAumData.filter(c => c.latitude && c.longitude).length}</div>
                          <div>Top City: {cityAumData[0]?.city_name} ({cityAumData[0]?.aum_percentage.toFixed(2)}%)</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* City Map Area */}
              <div className="lg:col-span-3">
                <Card className="h-[600px] flex flex-col shadow-lg border-border bg-card">
                  <CardContent className="p-0 flex-1 relative">
                    {cityAumLoading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-lg font-medium text-foreground">Loading city data...</span>
                        </div>
                      </div>
                    )}

                    {!cityAumLoading && !selectedQuarter && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            Select a Quarter
                          </h3>
                          <p className="text-muted-foreground">
                            Choose a quarter from the sidebar to view city-wise AUM distribution
                          </p>
                        </div>
                      </div>
                    )}

                    {!cityAumLoading && selectedQuarter && (
                      <CityAumMap data={cityAumData} quarterEndDate={selectedQuarter} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* State AUM View */}
          <TabsContent value="state-aum" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Month & Category Selector Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-border bg-card">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-foreground text-lg font-semibold">Select Options</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Month Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Month/Year</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                        disabled={monthsLoading}
                      >
                        <option value="">Select Month</option>
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* View Mode Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category</label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="state-aum-view"
                            value="overall"
                            checked={stateAumViewMode === 'overall'}
                            onChange={(e) => setStateAumViewMode(e.target.value as any)}
                            className="text-primary"
                          />
                          <span className="text-sm">Overall AUM %</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="state-aum-view"
                            value="liquid"
                            checked={stateAumViewMode === 'liquid'}
                            onChange={(e) => setStateAumViewMode(e.target.value as any)}
                            className="text-primary"
                          />
                          <span className="text-sm">Liquid/Money Market</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="state-aum-view"
                            value="debt"
                            checked={stateAumViewMode === 'debt'}
                            onChange={(e) => setStateAumViewMode(e.target.value as any)}
                            className="text-primary"
                          />
                          <span className="text-sm">Debt Oriented</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="state-aum-view"
                            value="equity"
                            checked={stateAumViewMode === 'equity'}
                            onChange={(e) => setStateAumViewMode(e.target.value as any)}
                            className="text-primary"
                          />
                          <span className="text-sm">Equity Oriented</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="state-aum-view"
                            value="etfs"
                            checked={stateAumViewMode === 'etfs'}
                            onChange={(e) => setStateAumViewMode(e.target.value as any)}
                            className="text-primary"
                          />
                          <span className="text-sm">ETFs/FoFs</span>
                        </label>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    {selectedMonth && stateAumData.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium text-foreground mb-2">Summary</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Total States: {stateAumData.length}</div>
                          <div>Top State: {stateAumData[0]?.state_name}</div>
                          <div>
                            Top AUM: {
                              stateAumViewMode === 'overall' ? stateAumData[0]?.industry_share_percentage :
                              stateAumViewMode === 'liquid' ? stateAumData[0]?.liquid_money_market_percentage :
                              stateAumViewMode === 'debt' ? stateAumData[0]?.debt_oriented_percentage :
                              stateAumViewMode === 'equity' ? stateAumData[0]?.equity_oriented_percentage :
                              stateAumData[0]?.etfs_fofs_percentage
                            }%
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* State AUM Map Area */}
              <div className="lg:col-span-3">
                <Card className="h-[600px] flex flex-col shadow-lg border-border bg-card">
                  <CardContent className="p-0 flex-1 relative">
                    {stateAumLoading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-lg font-medium text-foreground">Loading state data...</span>
                        </div>
                      </div>
                    )}

                    {!stateAumLoading && !selectedMonth && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            Select a Month
                          </h3>
                          <p className="text-muted-foreground">
                            Choose a month from the sidebar to view state-wise AUM distribution
                          </p>
                        </div>
                      </div>
                    )}

                    {!stateAumLoading && selectedMonth && (
                      <StateAumMap 
                        data={stateAumData} 
                        monthYear={selectedMonth}
                        viewMode={stateAumViewMode}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
