import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { IndicatorData } from '@/data/sampleIndicators';
import { useNavigate } from 'react-router-dom';

interface IndicatorGridCardProps {
  indicator: IndicatorData;
}

const IndicatorGridCard = ({ indicator }: IndicatorGridCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/indicator/${indicator.id}`);
  };

  const getTrendIcon = () => {
    if (indicator.change > 0) {
      return <TrendingUp className="h-4 w-4 status-positive" />;
    } else if (indicator.change < 0) {
      return <TrendingDown className="h-4 w-4 status-negative" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = () => {
    if (indicator.change > 0) return 'status-positive';
    if (indicator.change < 0) return 'status-negative';
    return 'text-muted-foreground';
  };

  // Transform sparkline data for chart
  const chartData = indicator.sparklineData.map((value, index) => ({
    index,
    value
  }));

  return (
    <div 
      className="dashboard-card cursor-pointer group h-[180px] flex flex-col"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex-1 mb-3">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {indicator.name}
        </h3>
      </div>

      {/* Value and Change */}
      <div className="mb-3">
        <div className="metric-value text-xl mb-1">
          {indicator.value}
        </div>
        <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
          {getTrendIcon()}
          <span>{Math.abs(indicator.change)}%</span>
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={`hsl(var(--${indicator.change > 0 ? 'success' : indicator.change < 0 ? 'destructive' : 'muted-foreground'}))`}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray={indicator.change === 0 ? "2 2" : "0"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndicatorGridCard;