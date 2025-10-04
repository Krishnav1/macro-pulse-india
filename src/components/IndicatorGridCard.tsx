import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { IndicatorData } from '@/data/sampleIndicators';
import { useNavigate } from 'react-router-dom';

interface IndicatorGridCardProps {
  indicator: IndicatorData;
}

const IndicatorGridCard = ({ indicator }: IndicatorGridCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Route to dedicated pages
    if (indicator.id === 'cpi_inflation') {
      navigate('/indicators/cpi');
    } else if (indicator.id === 'iip_growth' || indicator.id === 'iip') {
      navigate('/indicators/iip');
    } else if (indicator.id === 'repo_rate') {
      navigate('/indicators/repo-rate');
    } else if (indicator.id === 'inr_exchange_rate') {
      navigate('/indicators/exchange-rate');
    } else if (indicator.id === 'market_cap') {
      navigate('/financial-markets/equity-markets');
    } else if (indicator.id === 'total_aum') {
      navigate('/financial-markets/industry-trends');
    } else {
      navigate(`/indicators/${indicator.id}`);
    }
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

  return (
    <div 
      className="dashboard-card cursor-pointer group h-[140px] flex flex-col"
      onClick={handleCardClick}
    >
      {/* Header - Centered */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {indicator.name}
        </h3>
      </div>

      {/* Value and Change */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="metric-value text-2xl mb-1 font-semibold">
          {indicator.value}
        </div>
        <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
          {getTrendIcon()}
          <span>{Math.abs(indicator.change)}%</span>
        </div>
      </div>
    </div>
  );
};

export default IndicatorGridCard;