import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Info, Calendar, BarChart3, Clock, Target, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import RepoRateEvents from './components/RepoRateEvents';
import RepoRateVsCPIChart from './components/RepoRateVsCPIChart';

const RepoRateInsights = () => {
  const [selectedYear, setSelectedYear] = useState('5');
  const { insights, loading: insightsLoading } = useIndicatorInsights('repo_rate');
  const { series, loading: dataLoading } = useIndicatorData('repo_rate');
  const { data: events } = useIndicatorEvents('repo_rate');

  // Transform series data for display
  const repoRateData = (series || [])
    .map(item => ({
      date: item.period_date,
      rate: parseFloat(item.value.toString())
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestData = repoRateData[0] || { date: '', rate: 0 };
  const previousData = repoRateData[1] || { date: '', rate: 0 };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const currentRate = latestData.rate;
    const lastChange = currentRate - previousData.rate;
    const lastChangeText = lastChange > 0 ? `+${(lastChange * 100).toFixed(0)} bps` : 
                          lastChange < 0 ? `${(lastChange * 100).toFixed(0)} bps` : 'Unchanged';
    const lastChangeDate = latestData.date ? new Date(latestData.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : '';
    
    const stance = currentRate > 6 ? 'Restrictive' : currentRate < 5 ? 'Accommodative' : 'Neutral';
    
    // Get last MPC event
    const mpcEvents = (events || []).filter(e => 
      e.tag?.toLowerCase().includes('mpc') || 
      e.title?.toLowerCase().includes('mpc') ||
      e.description?.toLowerCase().includes('mpc')
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastMpcDate = mpcEvents[0]?.date ? new Date(mpcEvents[0].date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : '';

    return {
      currentRate,
      lastChange: `${lastChangeText} on ${lastChangeDate}`,
      stance,
      nextMpc: 'Dec 2025' // This would be configurable in real implementation
    };
  }, [latestData, previousData, events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/indicators/repo-rate" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Repo Rate Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Repo Rate Insights</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive analysis of RBI's monetary policy decisions and their economic impact
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 border">
              Monetary Policy
            </Badge>
          </div>
        </div>

        {/* At-a-Glance KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Repo Rate</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {kpis.currentRate?.toFixed(2) || '—'}%
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    As of {latestData.date ? new Date(latestData.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <Target className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Last Change</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {kpis.lastChange}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Previous MPC Decision
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">RBI's Stance</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {kpis.stance}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Current Policy Position
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Next MPC Meeting</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {kpis.nextMpc}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Upcoming Policy Review
                  </p>
                </div>
                <Clock className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Correlation Chart */}
        <div className="mb-8">
          <RepoRateVsCPIChart 
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Detailed Insights */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Detailed Analysis
                </CardTitle>
                <CardDescription>
                  In-depth insights into repo rate trends and monetary policy implications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {insightsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-full mb-2" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {(insights || []).map((insight, index) => (
                        <div key={index} className="border-l-4 border-primary pl-4">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {insight.content}
                          </p>
                        </div>
                      ))}
                      
                      {(!insights || insights.length === 0) && (
                        <>
                          <div className="border-l-4 border-primary pl-4">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              The repo rate serves as the cornerstone of India's monetary policy framework, 
                              directly influencing the cost of capital across the economy and affecting 
                              everything from home loans to business investments.
                            </p>
                          </div>
                          
                          <div className="border-l-4 border-orange-500 pl-4">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              RBI's rate decisions are data-driven, considering inflation trajectory, 
                              growth momentum, global economic conditions, and financial stability concerns. 
                              The transmission mechanism typically takes 6-12 months to fully impact the economy.
                            </p>
                          </div>
                          
                          <div className="border-l-4 border-green-500 pl-4">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              Current rate levels reflect RBI's balanced approach to supporting growth 
                              while maintaining price stability. The central bank's forward guidance 
                              provides markets with clarity on the policy trajectory.
                            </p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Policy Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Policy Framework
                </CardTitle>
                <CardDescription>
                  Understanding RBI's monetary policy transmission mechanism
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
                      Transmission Channels
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Interest Rate Channel: Direct impact on lending and deposit rates</li>
                      <li>• Credit Channel: Affects bank lending capacity and credit availability</li>
                      <li>• Exchange Rate Channel: Influences capital flows and trade competitiveness</li>
                      <li>• Asset Price Channel: Impacts equity and bond market valuations</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-sm mb-2 text-orange-800 dark:text-orange-200">
                      Key Considerations
                    </h4>
                    <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                      <li>• Inflation targeting framework with 4% (+/- 2%) target</li>
                      <li>• Growth-inflation trade-offs in policy decisions</li>
                      <li>• Global spillovers and domestic financial stability</li>
                      <li>• Coordination with fiscal policy and regulatory measures</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events and Timeline */}
          <div className="space-y-6">
            <RepoRateEvents />
            
            {/* Market Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Impact & Outlook
                </CardTitle>
                <CardDescription>
                  How repo rate changes affect different sectors and market segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 mb-1">
                        Rate Cut Benefits
                      </h4>
                      <ul className="text-xs text-green-700 dark:text-green-300 space-y-0.5">
                        <li>• Lower borrowing costs</li>
                        <li>• Increased investment</li>
                        <li>• Higher consumption</li>
                        <li>• Equity market support</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-1">
                        Rate Hike Impact
                      </h4>
                      <ul className="text-xs text-red-700 dark:text-red-300 space-y-0.5">
                        <li>• Higher borrowing costs</li>
                        <li>• Inflation control</li>
                        <li>• Currency strengthening</li>
                        <li>• Bond yield increase</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Forward Guidance
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      RBI's monetary policy committee meets bi-monthly to assess economic conditions 
                      and adjust the policy stance. The central bank's communication strategy provides 
                      markets with clear signals about future policy direction, helping anchor expectations 
                      and improve transmission effectiveness.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoRateInsights;
