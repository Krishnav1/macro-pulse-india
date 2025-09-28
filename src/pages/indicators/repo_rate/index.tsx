import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import RepoRateChart from './components/RepoRateChart';
import RepoRateEvents from './components/RepoRateEvents';
import RepoRateInsights from './components/RepoRateInsights';

const RepoRatePage = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const { series, loading, error } = useIndicatorData('repo_rate');

  // Transform series data for display
  const repoRateData = series
    .map(item => ({
      date: item.period_date,
      rate: parseFloat(item.value.toString())
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestData = repoRateData[0] || { date: '', rate: 0 };
  const previousData = repoRateData[1] || { date: '', rate: 0 };

  const getTrendIcon = () => {
    const change = latestData.rate - previousData.rate;
    
    if (change > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getChangeText = () => {
    const change = latestData.rate - previousData.rate;
    return change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
  };

  // Year filter buttons
  const yearButtons = [
    { value: '1', label: '1Y' },
    { value: '3', label: '3Y' },
    { value: '5', label: '5Y' },
    { value: '10', label: '10Y' },
    { value: 'all', label: 'MAX' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="text-center py-12">
            <div className="text-lg">Loading repo rate data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="text-center py-12">
            <div className="text-lg text-destructive">Error loading repo rate data</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Repo Rate</h1>
              <p className="text-muted-foreground mt-1">
                Reserve Bank of India policy repo rate - the key monetary policy tool
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 border">
              Monetary Policy
            </Badge>
          </div>
        </div>

        {/* Year Selection */}
        <div className="mb-6">
          <div className="flex gap-2">
            {yearButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setSelectedYear(button.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedYear === button.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <RepoRateChart selectedYear={selectedYear} />
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            
            {/* Main Indicator Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Repo Rate
                    {getTrendIcon()}
                  </CardTitle>
                </div>
                <CardDescription>
                  Source: RBI | Last Updated: {latestData.date ? new Date(latestData.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">
                      {latestData.rate?.toFixed(2) || '—'}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Current Rate
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-muted-foreground">
                      {getChangeText()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last Change
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {repoRateData.length ? Math.max(...repoRateData.map(d => d.rate)).toFixed(2) : '—'}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Period High
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {repoRateData.length ? Math.min(...repoRateData.map(d => d.rate)).toFixed(2) : '—'}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Period Low
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Context Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-4 w-4" />
                  Policy Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Level:</span>
                  <span className="font-semibold">{latestData.rate?.toFixed(2) || '—'}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Policy Stance:</span>
                  <span className="font-semibold">
                    {latestData.rate > 6 ? 'Restrictive' : latestData.rate < 5 ? 'Accommodative' : 'Neutral'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-semibold">Bi-monthly</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Review:</span>
                  <span className="font-semibold">MPC Meeting</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RepoRateEvents />
          <RepoRateInsights />
        </div>
      </div>
    </div>
  );
};

export default RepoRatePage;
