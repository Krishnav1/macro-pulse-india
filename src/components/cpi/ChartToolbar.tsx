import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, BarChart3, TrendingUp, PieChart } from "lucide-react";

interface ChartToolbarProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  selectedGeography: 'rural' | 'urban' | 'combined';
  onGeographyChange: (geography: 'rural' | 'urban' | 'combined') => void;
  chartView: 'combined' | 'inflation' | 'components';
  onChartViewChange: (view: 'combined' | 'inflation' | 'components') => void;
  showInflation?: boolean;
  onShowInflationChange?: (show: boolean) => void;
  inflationType?: 'yoy' | 'mom';
  onInflationTypeChange?: (type: 'yoy' | 'mom') => void;
  onExport?: () => void;
}

export const ChartToolbar = ({
  selectedTimeframe,
  onTimeframeChange,
  selectedGeography,
  onGeographyChange,
  chartView,
  onChartViewChange,
  showInflation = false,
  onShowInflationChange,
  inflationType = 'yoy',
  onInflationTypeChange,
  onExport
}: ChartToolbarProps) => {
  const timeframes = [
    { label: "1Y", value: "1y" },
    { label: "2Y", value: "2y" },
    { label: "3Y", value: "3y" },
    { label: "5Y", value: "5y" },
    { label: "10Y", value: "10y" },
    { label: "All", value: "all" }
  ];

  const geographies = [
    { label: "Combined", value: "combined" as const },
    { label: "Rural", value: "rural" as const },
    { label: "Urban", value: "urban" as const }
  ];

  const chartViews = [
    { 
      label: "Combined", 
      value: "combined" as const, 
      icon: TrendingUp,
      description: "CPI Index + Inflation"
    },
    { 
      label: "Inflation", 
      value: "inflation" as const, 
      icon: BarChart3,
      description: "YoY & MoM Inflation"
    },
    { 
      label: "Components", 
      value: "components" as const, 
      icon: PieChart,
      description: "Category Breakdown"
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Chart View Buttons */}
          <div className="flex gap-2">
            {chartViews.map(view => {
              const IconComponent = view.icon;
              return (
                <Button
                  key={view.value}
                  variant={chartView === view.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChartViewChange(view.value)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {view.label}
                </Button>
              );
            })}
          </div>

          {/* Timeframe Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Period:</span>
            <div className="flex gap-1">
              {timeframes.map(tf => (
                <Button
                  key={tf.value}
                  variant={selectedTimeframe === tf.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeframeChange(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Geography Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Geography:</span>
            <Select value={selectedGeography} onValueChange={onGeographyChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {geographies.map(geo => (
                  <SelectItem key={geo.value} value={geo.value}>
                    {geo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart-specific controls */}
          {chartView === 'combined' && onShowInflationChange && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-inflation"
                checked={showInflation}
                onCheckedChange={onShowInflationChange}
              />
              <label htmlFor="show-inflation" className="text-sm font-medium">
                Show Inflation
              </label>
              {showInflation && onInflationTypeChange && (
                <div className="flex gap-1 ml-2">
                  <Button
                    variant={inflationType === 'yoy' ? "default" : "outline"}
                    size="sm"
                    onClick={() => onInflationTypeChange('yoy')}
                  >
                    YoY
                  </Button>
                  <Button
                    variant={inflationType === 'mom' ? "default" : "outline"}
                    size="sm"
                    onClick={() => onInflationTypeChange('mom')}
                  >
                    MoM
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Export Button */}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="ml-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {/* Chart View Description */}
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs">
            {chartViews.find(v => v.value === chartView)?.description}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
