import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { Link } from 'react-router-dom';

interface RepoRateChartProps {
  selectedYear: string;
}

const RepoRateChart: React.FC<RepoRateChartProps> = ({ selectedYear }) => {
  const { series, loading, error } = useIndicatorData('repo_rate');
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

  // Transform data for chart
  const chartData = (series || [])
    .map(item => ({
      date: item.period_date,
      rate: parseFloat(item.value.toString()),
      displayDate: new Date(item.period_date).toLocaleDateString('en-GB', { 
        month: 'short', 
        year: 'numeric' 
      })
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter data by selected year
  const filteredData = selectedYear === 'all' 
    ? chartData 
    : chartData.filter(item => {
        const itemYear = new Date(item.date).getFullYear();
        const currentYear = new Date().getFullYear();
        const yearsBack = parseInt(selectedYear);
        return itemYear >= (currentYear - yearsBack);
      });

  // Filter events based on selected filters and year
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

  // Get latest data point for display
  const latestData = filteredData[filteredData.length - 1];
  const latestDate = latestData ? new Date(latestData.date).toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  }) : '';

  // Event count by impact
  const eventCounts = {
    high: (events || []).filter(e => e.impact === 'high').length,
    medium: (events || []).filter(e => e.impact === 'medium').length,
    low: (events || []).filter(e => e.impact === 'low').length
  };

  // Function to get Y position for event markers on the trend line
  const getEventYPosition = (eventDate: string): number => {
    const eventDateObj = new Date(eventDate);
    
    // Find exact date match first
    let matchingData = filteredData.find(item => 
      new Date(item.date).getTime() === eventDateObj.getTime()
    );
    
    if (matchingData) {
      return matchingData.rate;
    }
    
    // Find same month/year match
    matchingData = filteredData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === eventDateObj.getFullYear() &&
             itemDate.getMonth() === eventDateObj.getMonth();
    });
    
    if (matchingData) {
      return matchingData.rate;
    }
    
    // Find closest date
    const sortedByDistance = filteredData
      .map(item => ({
        ...item,
        distance: Math.abs(new Date(item.date).getTime() - eventDateObj.getTime())
      }))
      .sort((a, b) => a.distance - b.distance);
    
    if (sortedByDistance.length > 0) {
      return sortedByDistance[0].rate;
    }
    
    // Fallback to middle of range
    const rates = filteredData.map(d => d.rate);
    return rates.length > 0 ? (Math.max(...rates) + Math.min(...rates)) / 2 : 6;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Repo Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Repo Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-destructive">Error loading chart data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold">Repo Rate</h2>
        </div>
        <Link 
          to="/indicators/repo-rate/insights"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Full Insights
        </Link>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Rate</span>
            <Badge variant="secondary" className="bg-orange-500 text-white border-0">
              Policy Rate
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showEvents 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Events
            </button>
            
            {showEvents && (
              <>
                <button
                  onClick={() => toggleEventFilter('high')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    eventFilters.high 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  High
                </button>
                <button
                  onClick={() => toggleEventFilter('medium')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    eventFilters.medium 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Med
                </button>
                <button
                  onClick={() => toggleEventFilter('low')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    eventFilters.low 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Low
                </button>
              </>
            )}
          </div>
        </div>

        {/* Latest Value Display */}
        {latestData && (
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-400">
              Repo Rate: {latestData.rate.toFixed(2)}%
            </div>
            <div className="text-sm text-slate-400">{latestDate}</div>
          </div>
        )}
      </div>

      <div className="text-sm text-slate-400 mb-4">
        RBI policy rate changes with major economic events highlighted
      </div>

      {/* Chart */}
      <div className="h-80 bg-slate-800/50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#9CA3AF"
              fontSize={11}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: any) => [`${value}%`, 'Repo Rate']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            
            {/* Main trend line */}
            <Line 
              type="stepAfter" 
              dataKey="rate"
              stroke="#F97316" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#F97316', stroke: '#FFF', strokeWidth: 2 }}
            />
            
            {/* Event markers */}
            {filteredEvents.map((event, index) => (
              <ReferenceDot
                key={index}
                x={new Date(event.date).toLocaleDateString('en-GB', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
                y={getEventYPosition(event.date)}
                r={5}
                fill={
                  event.impact === 'high' ? '#DC2626' : 
                  event.impact === 'medium' ? '#EA580C' : '#16A34A'
                }
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
        <div>Data is based on RBI policy announcements</div>
        <div className="flex items-center gap-4">
          <span>Events:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
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
    </div>
  );
};

export default RepoRateChart;
