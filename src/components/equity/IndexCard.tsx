// Index Card Component - Displays individual index information

import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight, BarChart3 } from 'lucide-react';
import type { MarketIndex } from '@/types/equity-markets.types';

interface IndexCardProps {
  index: MarketIndex;
}

export function IndexCard({ index }: IndexCardProps) {
  const isPositive = (index.change_percent || 0) >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';
  const bgColor = isPositive ? 'bg-success/10' : 'bg-destructive/10';
  const borderColor = isPositive ? 'border-success/20' : 'border-destructive/20';

  // Create slug from index name
  const slug = index.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <Link
      to={`/financial-markets/equity-markets/index/${slug}`}
      className="group dashboard-card hover:border-primary transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
            {index.name}
          </h3>
          <p className="text-xs text-muted-foreground">{index.symbol}</p>
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          {isPositive ? (
            <TrendingUp className={`h-4 w-4 ${changeColor}`} />
          ) : (
            <TrendingDown className={`h-4 w-4 ${changeColor}`} />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-foreground">
          {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
        </div>
        <div className={`flex items-center gap-2 text-sm ${changeColor} font-medium`}>
          <span>{isPositive ? '+' : ''}{index.change?.toFixed(2) || '0.00'}</span>
          <span>({isPositive ? '+' : ''}{index.change_percent?.toFixed(2) || '0.00'}%)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Open</div>
          <div className="text-sm font-medium text-foreground">
            {index.open?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Prev Close</div>
          <div className="text-sm font-medium text-foreground">
            {index.previous_close?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">High</div>
          <div className="text-sm font-medium text-success">
            {index.high?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Low</div>
          <div className="text-sm font-medium text-destructive">
            {index.low?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
          </div>
        </div>
      </div>

      {/* Volume */}
      {index.volume && (
        <div className={`flex items-center justify-between p-3 rounded-lg ${bgColor} ${borderColor} border mb-4`}>
          <div className="flex items-center gap-2">
            <BarChart3 className={`h-4 w-4 ${changeColor}`} />
            <span className="text-xs text-muted-foreground">Volume</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {(index.volume / 1000000).toFixed(2)}M
          </span>
        </div>
      )}

      {/* View Details Link */}
      <div className="flex items-center justify-between text-sm text-primary group-hover:text-primary-glow transition-colors">
        <span>View Details</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
