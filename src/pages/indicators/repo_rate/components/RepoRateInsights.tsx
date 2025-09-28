import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, TrendingUp } from 'lucide-react';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';

const RepoRateInsights: React.FC = () => {
  const { insights, loading, error } = useIndicatorInsights('repo_rate');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
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
            <Info className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading insights</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Key Insights
        </CardTitle>
        <CardDescription>
          Analysis and economic implications of repo rate changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(insights || []).map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
            </div>
          ))}
          
          {(!insights || insights.length === 0) && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The repo rate is the key policy tool used by RBI to control inflation and support economic growth.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rate cuts typically stimulate economic activity by making borrowing cheaper, while rate hikes help control inflation.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The current rate level reflects RBI's assessment of inflation trends and growth prospects.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Policy Outlook
          </h4>
          <p className="text-sm text-muted-foreground">
            RBI's monetary policy stance depends on inflation trajectory, growth momentum, and global economic conditions. 
            The central bank aims to maintain price stability while supporting sustainable economic growth.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepoRateInsights;
