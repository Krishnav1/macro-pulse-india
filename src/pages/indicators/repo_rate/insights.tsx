import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Info, Calendar, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import RepoRateEvents from './components/RepoRateEvents';

const RepoRateInsights = () => {
  const { insights, loading: insightsLoading } = useIndicatorInsights('repo_rate');
  const { series, loading: dataLoading } = useIndicatorData('repo_rate');

  // Transform series data for display
  const repoRateData = (series || [])
    .map(item => ({
      date: item.period_date,
      rate: parseFloat(item.value.toString())
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestData = repoRateData[0] || { date: '', rate: 0 };

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

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Rate</p>
                  <p className="text-2xl font-bold">{latestData.rate?.toFixed(2) || '—'}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Policy Stance</p>
                  <p className="text-lg font-semibold">
                    {latestData.rate > 6 ? 'Restrictive' : latestData.rate < 5 ? 'Accommodative' : 'Neutral'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Period High</p>
                  <p className="text-lg font-semibold">
                    {repoRateData.length ? Math.max(...repoRateData.map(d => d.rate)).toFixed(2) : '—'}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Period Low</p>
                  <p className="text-lg font-semibold">
                    {repoRateData.length ? Math.min(...repoRateData.map(d => d.rate)).toFixed(2) : '—'}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 rotate-180" />
              </div>
            </CardContent>
          </Card>
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
