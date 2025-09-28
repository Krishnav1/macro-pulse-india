import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { useCpiData } from '@/hooks/useCpiData';

interface RepoRateVsCPIChartProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const RepoRateVsCPIChart: React.FC<RepoRateVsCPIChartProps> = ({ selectedYear, setSelectedYear }) => {
  const { series: repoSeries, loading: repoLoading } = useIndicatorData('repo_rate');
  const { data: cpiData, loading: cpiLoading } = useCpiData();
  const { data: events } = useIndicatorEvents('repo_rate');
  
  // Event filter states
  const [showEvents, setShowEvents] = useState(true);
  const [eventFilters, setEventFilters] = useState({
    high: true,
    medium: true,
    low: true
  });

  const toggleEventFilter = (impact: 'high' | 'medium' | 'low') => {
    setEventFilters(prev => ({
      ...prev,
      [impact]: !prev[impact]
    }));
  };

  // Combine and filter data
  const combinedData = useMemo(() => {
    if (!repoSeries || !cpiData) return [];

    // Create a map of repo rate data by date
    const repoMap = new Map();
    repoSeries.forEach(item => {
      const date = item.period_date.substring(0, 7); // YYYY-MM format
      repoMap.set(date, parseFloat(item.value.toString()));
    });

    // Create a map of CPI data by date
    const cpiMap = new Map();
    cpiData.forEach(item => {
      const date = item.date.substring(0, 7); // YYYY-MM format
      cpiMap.set(date, item.inflation_yoy);
    });

    // Combine data points where both exist
    const combined: any[] = [];
    const allDates = new Set([...repoMap.keys(), ...cpiMap.keys()]);
    
    Array.from(allDates).sort().forEach(date => {
      const repoRate = repoMap.get(date);
      const cpiRate = cpiMap.get(date);
      
      if (repoRate !== undefined || cpiRate !== undefined) {
        combined.push({
          date,
          repoRate: repoRate || null,
          cpiRate: cpiRate || null,
          displayDate: new Date(date + '-01').toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric'
          })
        });
      }
    });

    // Filter by selected year
    if (selectedYear !== 'all') {
      const currentYear = new Date().getFullYear();
      const yearsBack = parseInt(selectedYear);
      const cutoffDate = `${currentYear - yearsBack}-01`;
      
      return combined.filter(item => item.date >= cutoffDate);
    }

    return combined;
  }, [repoSeries, cpiData, selectedYear]);

  // Filter events
  const filteredEvents = (events || []).filter(event => {
    // Year filter
    const eventInRange = selectedYear === 'all' || (() => {
      const eventYear = new Date(event.date).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsBack = parseInt(selectedYear);
      return eventYear >= (currentYear - yearsBack);
    })();
    
    // Impact filter
    const impactVisible = eventFilters[event.impact as 'high' | 'medium' | 'low'];
    
    return eventInRange && impactVisible && showEvents;
  });

  // Function to get Y position for event markers on repo rate line
  const getEventYPosition = (eventDate: string): number => {
    const eventDateObj = new Date(eventDate);
    const eventMonth = eventDateObj.toISOString().substring(0, 7);
    
    // Find matching data point
    const matchingData = combinedData.find(item => item.date === eventMonth);
    
    if (matchingData && matchingData.repoRate !== null) {
      return matchingData.repoRate;
    }
    
    // Find closest date
    const sortedByDistance = combinedData
      .filter(item => item.repoRate !== null)
      .map(item => ({
        ...item,
        distance: Math.abs(new Date(item.date + '-01').getTime() - eventDateObj.getTime())
      }))
      .sort((a, b) => a.distance - b.distance);

    if (sortedByDistance.length > 0) {
      return sortedByDistance[0].repoRate;
    }

    return 6; // Fallback
  };

  if (repoLoading || cpiLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repo Rate vs CPI Inflation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading correlation data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Repo Rate vs CPI Inflation
          </div>
          <div className="flex gap-2">
            <Button variant={selectedYear === '1' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedYear('1')}>1Y</Button>
            <Button variant={selectedYear === '3' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedYear('3')}>3Y</Button>
            <Button variant={selectedYear === '5' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedYear('5')}>5Y</Button>
            <Button variant={selectedYear === '10' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedYear('10')}>10Y</Button>
            <Button variant={selectedYear === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedYear('all')}>MAX</Button>
          </div>
        </CardTitle>
        <CardDescription>
          Correlation between RBI policy rate and consumer price inflation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-500/10 border-orange-500/20 border text-orange-700 dark:text-orange-300">
                Repo Rate
              </Badge>
              <Badge variant="secondary" className="bg-yellow-500/10 border-yellow-500/20 border text-yellow-700 dark:text-yellow-300">
                CPI Inflation
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showEvents ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowEvents(!showEvents)}
                className="h-8"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Events
              </Button>
              
              {showEvents && (
                <>
                  <Button
                    variant={eventFilters.high ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => toggleEventFilter('high')}
                    className="h-8 px-2 text-xs"
                  >
                    High
                  </Button>
                  <Button
                    variant={eventFilters.medium ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEventFilter('medium')}
                    className="h-8 px-2 text-xs bg-orange-600 hover:bg-orange-700 border-orange-600"
                  >
                    Med
                  </Button>
                  <Button
                    variant={eventFilters.low ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEventFilter('low')}
                    className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 border-green-600"
                  >
                    Low
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'CPI Inflation (%)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Repo Rate (%)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => [
                  value ? `${value}%` : 'N/A', 
                  name === 'cpiRate' ? 'CPI Inflation' : 'Repo Rate'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              
              {/* CPI Inflation line */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="cpiRate"
                stroke="#EAB308" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4, fill: '#EAB308' }}
              />
              
              {/* Repo Rate line */}
              <Line 
                yAxisId="right"
                type="stepAfter" 
                dataKey="repoRate"
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
              
              {/* Event markers */}
              {filteredEvents.map((event, index) => (
                <ReferenceDot
                  key={index}
                  yAxisId="right"
                  x={new Date(event.date).toLocaleDateString('en-GB', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                  y={getEventYPosition(event.date)}
                  r={5}
                  fill={
                    event.impact === 'high' ? 'hsl(var(--destructive))' : 
                    event.impact === 'medium' ? '#EA580C' : '#16A34A'
                  }
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Policy Insight:</strong> When CPI inflation rises sharply, RBI typically responds by increasing the repo rate to control price pressures. 
            Conversely, when inflation moderates, RBI may pause or cut rates to support economic growth.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div>Data: RBI (Repo Rate) & MOSPI (CPI Inflation)</div>
          <div className="flex items-center gap-4">
            <span>Events:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepoRateVsCPIChart;
