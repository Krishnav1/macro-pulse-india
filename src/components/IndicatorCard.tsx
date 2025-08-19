import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { IndicatorData } from "@/data/indicators";
import { Badge } from "@/components/ui/badge";

interface IndicatorCardProps {
  indicator: IndicatorData;
}

const IndicatorCard = ({ indicator }: IndicatorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/indicator/${indicator.id}`);
  };

  const getTrendIcon = () => {
    if (indicator.change > 0) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (indicator.change < 0) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = () => {
    if (indicator.change > 0) return "text-success";
    if (indicator.change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Growth: "bg-chart-1",
      Inflation: "bg-chart-3", 
      Monetary: "bg-chart-2",
      External: "bg-chart-4",
      Fiscal: "bg-chart-5"
    };
    return colors[category] || "bg-chart-6";
  };

  const sparklineData = indicator.sparklineData.map((value, index) => ({
    index,
    value
  }));

  return (
    <div
      className="dashboard-card cursor-pointer group"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {indicator.name}
            </h3>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getCategoryColor(indicator.category)}/20 text-foreground border-${getCategoryColor(indicator.category)}/30`}
          >
            {indicator.category}
          </Badge>
        </div>
      </div>

      {/* Value and Change */}
      <div className="mb-4">
        <div className="metric-value mb-2">
          {indicator.value.toLocaleString()} {indicator.unit}
        </div>
        <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
          {getTrendIcon()}
          <span>
            {indicator.change > 0 ? "+" : ""}{indicator.change} 
            ({indicator.changePercent > 0 ? "+" : ""}{indicator.changePercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="sparkline mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              strokeLinecap="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated: {new Date(indicator.lastUpdated).toLocaleDateString()}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          Click for details →
        </span>
      </div>
    </div>
  );
};

export default IndicatorCard;