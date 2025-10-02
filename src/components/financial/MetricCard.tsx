// Metric Card Component - Reusable card for displaying metrics

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="dashboard-card animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-3"></div>
        <div className="h-8 w-32 bg-muted rounded mb-2"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';

  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className={`p-2 bg-muted rounded-lg ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
          <span>
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
          {changeLabel && <span className="text-muted-foreground font-normal">· {changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
