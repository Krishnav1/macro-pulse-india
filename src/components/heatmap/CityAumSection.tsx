import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { CityAumMap } from './CityAumMap';
import { useCityAumQuarters, useCityAumData, useCityAumMetadata, type QuarterInfo } from '@/hooks/useCityAumData';

export function CityAumSection() {
  const { quarters, loading: quartersLoading } = useCityAumQuarters();
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(2000); // 2 seconds per quarter

  const { data: cityAumData, loading: cityAumLoading } = useCityAumData(selectedQuarter);
  const { metadata } = useCityAumMetadata(selectedQuarter);

  // Auto-select latest quarter
  useEffect(() => {
    if (quarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(quarters[0].quarterEndDate);
    }
  }, [quarters, selectedQuarter]);

  // Animation logic
  useEffect(() => {
    if (!isAnimating || quarters.length === 0) return;

    const currentIndex = quarters.findIndex(q => q.quarterEndDate === selectedQuarter);
    if (currentIndex === -1) return;

    const timer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % quarters.length;
      setSelectedQuarter(quarters[nextIndex].quarterEndDate);
    }, animationSpeed);

    return () => clearTimeout(timer);
  }, [isAnimating, selectedQuarter, quarters, animationSpeed]);

  // Group quarters by financial year
  const quartersByFY = quarters.reduce((acc, quarter) => {
    if (!acc[quarter.financialYear]) {
      acc[quarter.financialYear] = [];
    }
    acc[quarter.financialYear].push(quarter);
    return acc;
  }, {} as Record<string, QuarterInfo[]>);

  // Filter cities by search query
  const filteredCities = cityAumData.filter(city =>
    city.city_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate quarters
  const handlePrevQuarter = () => {
    const currentIndex = quarters.findIndex(q => q.quarterEndDate === selectedQuarter);
    if (currentIndex > 0) {
      setSelectedQuarter(quarters[currentIndex - 1].quarterEndDate);
    }
  };

  const handleNextQuarter = () => {
    const currentIndex = quarters.findIndex(q => q.quarterEndDate === selectedQuarter);
    if (currentIndex < quarters.length - 1) {
      setSelectedQuarter(quarters[currentIndex + 1].quarterEndDate);
    }
  };

  const currentQuarterInfo = quarters.find(q => q.quarterEndDate === selectedQuarter);
  const currentIndex = quarters.findIndex(q => q.quarterEndDate === selectedQuarter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Controls Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Quarter Selector */}
        <Card className="shadow-lg border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground text-lg font-semibold">Select Quarter</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Grouped Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quarter</label>
              <select
                value={selectedQuarter}
                onChange={(e) => {
                  setSelectedQuarter(e.target.value);
                  setIsAnimating(false);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
                disabled={quartersLoading}
              >
                <option value="">Select Quarter</option>
                {Object.keys(quartersByFY)
                  .sort()
                  .reverse()
                  .map(fy => (
                    <optgroup key={fy} label={`FY ${fy}`}>
                      {quartersByFY[fy]
                        .sort((a, b) => b.quarter - a.quarter)
                        .map(quarter => (
                          <option key={quarter.quarterEndDate} value={quarter.quarterEndDate}>
                            {quarter.displayName}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
            </div>

            {/* Quarter Navigation */}
            {quarters.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrevQuarter}
                  disabled={currentIndex === 0 || isAnimating}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={isAnimating ? "destructive" : "default"}
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="flex-1"
                >
                  {isAnimating ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Animate
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNextQuarter}
                  disabled={currentIndex === quarters.length - 1 || isAnimating}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Animation Speed */}
            {isAnimating && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Speed: {(animationSpeed / 1000).toFixed(1)}s per quarter
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Current Quarter Info */}
            {currentQuarterInfo && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-xs font-medium text-muted-foreground">Current Quarter</div>
                <div className="text-sm font-semibold text-foreground mt-1">
                  {currentQuarterInfo.displayName}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {currentIndex + 1} of {quarters.length}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* City Search */}
        <Card className="shadow-lg border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-foreground text-lg font-semibold">Search City</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchQuery && filteredCities.length > 0 && (
              <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
                {filteredCities.slice(0, 10).map((city) => (
                  <div
                    key={city.id}
                    className="p-2 bg-muted/50 rounded text-sm hover:bg-muted cursor-pointer"
                  >
                    <div className="font-medium">{city.city_name}</div>
                    <div className="text-xs text-muted-foreground">
                      AUM: {city.aum_percentage.toFixed(2)}%
                    </div>
                  </div>
                ))}
                {filteredCities.length > 10 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    +{filteredCities.length - 10} more cities
                  </div>
                )}
              </div>
            )}

            {searchQuery && filteredCities.length === 0 && (
              <div className="mt-3 text-sm text-muted-foreground text-center py-4">
                No cities found matching "{searchQuery}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedQuarter && cityAumData.length > 0 && (
          <Card className="shadow-lg border-border bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground text-lg font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cities:</span>
                  <span className="font-semibold">{cityAumData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mapped:</span>
                  <span className="font-semibold">
                    {cityAumData.filter(c => c.latitude && c.longitude).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top City:</span>
                  <span className="font-semibold">{cityAumData[0]?.city_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top AUM:</span>
                  <span className="font-semibold">{cityAumData[0]?.aum_percentage.toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Area */}
      <div className="lg:col-span-3 space-y-4">
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
              <CityAumMap 
                data={searchQuery ? filteredCities : cityAumData} 
                quarterEndDate={selectedQuarter} 
              />
            )}
          </CardContent>
        </Card>

        {/* Metadata Display */}
        {metadata && (
          <Card className="shadow-lg border-border bg-card">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-3 text-foreground">Additional Data</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Other Cities</div>
                  <div className="text-lg font-semibold text-foreground">
                    {metadata.other_cities_percentage.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">NRIs & Overseas</div>
                  <div className="text-lg font-semibold text-foreground">
                    {metadata.nris_overseas_percentage.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total AUM</div>
                  <div className="text-lg font-semibold text-primary">
                    {metadata.total_percentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
