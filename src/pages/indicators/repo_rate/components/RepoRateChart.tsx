import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';

interface RepoRateChartProps {
  selectedYear: string;
}

const RepoRateChart: React.FC<RepoRateChartProps> = ({ selectedYear }) => {
  const { series, loading, error } = useIndicatorData('repo_rate');
  const { data: events } = useIndicatorEvents('repo_rate');

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Repo Rate Trend
        </CardTitle>
        <CardDescription>
          RBI policy repo rate changes over time with key events marked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`${value}%`, 'Repo Rate']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              
              {/* Main trend line */}
              <Line 
                type="stepAfter" 
                dataKey="rate"
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
              
              {/* Event markers */}
              {(events || []).map((event, index) => {
                const eventInRange = selectedYear === 'all' || (() => {
                  const eventYear = new Date(event.date).getFullYear();
                  const currentYear = new Date().getFullYear();
                  const yearsBack = parseInt(selectedYear);
                  return eventYear >= (currentYear - yearsBack);
                })();
                
                if (!eventInRange) return null;
                
                return (
                  <ReferenceDot
                    key={index}
                    x={new Date(event.date).toLocaleDateString('en-GB', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                    y={getEventYPosition(event.date)}
                    r={6}
                    fill="hsl(var(--destructive))"
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepoRateChart;
