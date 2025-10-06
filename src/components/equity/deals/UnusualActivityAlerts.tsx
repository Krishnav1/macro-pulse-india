// Unusual Activity Alerts Component - Identifies abnormal trading patterns

import { AlertTriangle, AlertCircle, Info, Flame } from 'lucide-react';
import { Deal } from '@/hooks/equity/useDealsAnalysis';
import { formatDealValue } from '@/utils/currencyFormatter';

interface UnusualActivityAlertsProps {
  deals: Deal[];
  loading: boolean;
}

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  symbol: string;
  stock_name: string;
  message: string;
  value?: number;
  metric?: string;
}

export function UnusualActivityAlerts({ deals, loading }: UnusualActivityAlertsProps) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const alerts: Alert[] = [];

  // Calculate statistics
  const avgDealValue = deals.reduce((sum, d) => sum + d.value, 0) / deals.length || 0;
  const stdDev = Math.sqrt(
    deals.reduce((sum, d) => sum + Math.pow(d.value - avgDealValue, 2), 0) / deals.length || 0
  );

  // Group by stock
  const stockMap = new Map<string, Deal[]>();
  deals.forEach(deal => {
    if (!stockMap.has(deal.symbol)) {
      stockMap.set(deal.symbol, []);
    }
    stockMap.get(deal.symbol)!.push(deal);
  });

  // 1. Large deals (> 2 standard deviations above mean)
  const threshold = avgDealValue + (2 * stdDev);
  deals.forEach(deal => {
    if (deal.value > threshold) {
      alerts.push({
        id: `large-${deal.symbol}-${deal.date}`,
        severity: 'high',
        type: 'Large Deal',
        symbol: deal.symbol,
        stock_name: deal.stock_name || deal.symbol,
        message: `Deal value ${formatDealValue(deal.value)} is ${((deal.value / avgDealValue) * 100).toFixed(0)}% above average`,
        value: deal.value,
        metric: 'Value'
      });
    }
  });

  // 2. High frequency (> 3 deals for same stock)
  stockMap.forEach((stockDeals, symbol) => {
    if (stockDeals.length > 3) {
      const totalValue = stockDeals.reduce((sum, d) => sum + d.value, 0);
      alerts.push({
        id: `freq-${symbol}`,
        severity: 'medium',
        type: 'High Frequency',
        symbol: symbol,
        stock_name: stockDeals[0].stock_name || symbol,
        message: `${stockDeals.length} deals totaling ${formatDealValue(totalValue)} in this period`,
        value: totalValue,
        metric: 'Deals'
      });
    }
  });

  // 3. Concentrated buying/selling (all deals in same direction)
  stockMap.forEach((stockDeals, symbol) => {
    if (stockDeals.length >= 2) {
      const allBuys = stockDeals.every(d => d.deal_type?.toLowerCase() === 'buy');
      const allSells = stockDeals.every(d => d.deal_type?.toLowerCase() === 'sell');
      
      if (allBuys || allSells) {
        const totalValue = stockDeals.reduce((sum, d) => sum + d.value, 0);
        alerts.push({
          id: `conc-${symbol}`,
          severity: 'medium',
          type: allBuys ? 'Concentrated Buying' : 'Concentrated Selling',
          symbol: symbol,
          stock_name: stockDeals[0].stock_name || symbol,
          message: `All ${stockDeals.length} deals are ${allBuys ? 'buys' : 'sells'} totaling ${formatDealValue(totalValue)}`,
          value: totalValue,
          metric: 'Direction'
        });
      }
    }
  });

  // 4. Unusual client activity (same client, multiple stocks)
  const clientMap = new Map<string, Deal[]>();
  deals.forEach(deal => {
    if (!clientMap.has(deal.client_name)) {
      clientMap.set(deal.client_name, []);
    }
    clientMap.get(deal.client_name)!.push(deal);
  });

  clientMap.forEach((clientDeals, clientName) => {
    const uniqueStocks = new Set(clientDeals.map(d => d.symbol)).size;
    if (uniqueStocks >= 3) {
      const totalValue = clientDeals.reduce((sum, d) => sum + d.value, 0);
      alerts.push({
        id: `client-${clientName}`,
        severity: 'low',
        type: 'Multi-Stock Activity',
        symbol: `${uniqueStocks} stocks`,
        stock_name: clientName,
        message: `Active in ${uniqueStocks} different stocks with ${clientDeals.length} deals totaling ${formatDealValue(totalValue)}`,
        value: totalValue,
        metric: 'Diversified'
      });
    }
  });

  // Sort by severity and limit to top 10
  const sortedAlerts = alerts
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return (b.value || 0) - (a.value || 0);
    })
    .slice(0, 10);

  const getSeverityConfig = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-destructive/10',
          borderColor: 'border-l-4 border-destructive',
          iconColor: 'text-destructive',
          textColor: 'text-destructive'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-l-4 border-orange-500',
          iconColor: 'text-orange-500',
          textColor: 'text-orange-500'
        };
      case 'low':
        return {
          icon: Info,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-l-4 border-blue-500',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-500'
        };
    }
  };

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-foreground">Unusual Activity Alerts</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {sortedAlerts.filter(a => a.severity === 'high').length} High
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {sortedAlerts.filter(a => a.severity === 'medium').length} Medium
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {sortedAlerts.filter(a => a.severity === 'low').length} Low
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {sortedAlerts.length > 0 ? (
          sortedAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} hover:shadow-md transition-all`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${config.textColor} uppercase`}>
                        {alert.type}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="font-semibold text-foreground truncate">
                        {alert.symbol}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {alert.message}
                    </p>
                    
                    {alert.stock_name && alert.stock_name !== alert.symbol && (
                      <p className="text-xs text-muted-foreground truncate">
                        {alert.stock_name}
                      </p>
                    )}
                  </div>

                  {alert.metric && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">{alert.metric}</div>
                      <div className={`text-sm font-semibold ${config.textColor}`}>
                        {alert.value ? formatDealValue(alert.value) : alert.symbol}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No unusual activity detected in the current period
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Alerts are generated based on statistical analysis of deal patterns
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      {sortedAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Alerts are based on statistical analysis. High severity indicates deals significantly above average,
            medium indicates unusual patterns, and low indicates noteworthy activity worth monitoring.
          </p>
        </div>
      )}
    </div>
  );
}
