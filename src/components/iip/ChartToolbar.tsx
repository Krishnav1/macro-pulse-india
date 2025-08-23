import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ChartToolbarProps {
  // Chart type controls
  chartType: 'combined' | 'growth' | 'components';
  onChartTypeChange: (type: 'combined' | 'growth' | 'components') => void;
  
  // Growth measure toggles
  showGrowth: boolean;
  onShowGrowthChange: (show: boolean) => void;
  growthType: 'yoy' | 'mom';
  onGrowthTypeChange: (type: 'yoy' | 'mom') => void;
  
  // Component chart specific
  componentChartType?: 'index' | 'growth';
  onComponentChartTypeChange?: (type: 'index' | 'growth') => void;
  
  // Compare with options
  compareWith: 'none' | 'sectoral' | 'use_based';
  onCompareWithChange: (compare: 'none' | 'sectoral' | 'use_based') => void;
  
  // Component selection
  selectedComponents: string[];
  onComponentToggle: (componentCode: string) => void;
  availableComponents: Array<{ code: string; name: string }>;
  
  // Time period
  timePeriod: string;
  onTimePeriodChange: (period: string) => void;
}

export const ChartToolbar = ({
  chartType,
  onChartTypeChange,
  showGrowth,
  onShowGrowthChange,
  growthType,
  onGrowthTypeChange,
  componentChartType = 'growth',
  onComponentChartTypeChange,
  compareWith,
  onCompareWithChange,
  selectedComponents,
  onComponentToggle,
  availableComponents,
  timePeriod,
  onTimePeriodChange,
}: ChartToolbarProps) => {
  return (
    <Card className="p-4 space-y-4">
      {/* Chart Type Selection */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={chartType === 'combined' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChartTypeChange('combined')}
        >
          Combined View
        </Button>
        <Button
          variant={chartType === 'growth' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChartTypeChange('growth')}
        >
          Growth Only
        </Button>
        <Button
          variant={chartType === 'components' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChartTypeChange('components')}
        >
          Components
        </Button>
      </div>

      <div className="flex flex-wrap gap-6 items-center">
        {/* Growth Toggle for Combined Chart */}
        {chartType === 'combined' && (
          <div className="flex items-center space-x-2">
            <Switch
              id="show-growth"
              checked={showGrowth}
              onCheckedChange={onShowGrowthChange}
            />
            <Label htmlFor="show-growth">Show Growth</Label>
          </div>
        )}

        {/* Growth Type Selection */}
        {(chartType === 'growth' || (chartType === 'combined' && showGrowth) || chartType === 'components') && (
          <div className="flex items-center space-x-2">
            <Label>Growth Type:</Label>
            <Select value={growthType} onValueChange={onGrowthTypeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yoy">YoY</SelectItem>
                <SelectItem value="mom">MoM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Component Chart Type */}
        {chartType === 'components' && onComponentChartTypeChange && (
          <div className="flex items-center space-x-2">
            <Label>Show:</Label>
            <Select value={componentChartType} onValueChange={onComponentChartTypeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="index">Index</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Compare With Selection */}
        <div className="flex items-center space-x-2">
          <Label>Compare with:</Label>
          <Select value={compareWith} onValueChange={onCompareWithChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">General Index Only</SelectItem>
              <SelectItem value="sectoral">Sectoral Classification</SelectItem>
              <SelectItem value="use_based">Use-based Classification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Period Selection */}
        <div className="flex items-center space-x-2">
          <Label>Period:</Label>
          <Select value={timePeriod} onValueChange={onTimePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1y">Last 1 Year</SelectItem>
              <SelectItem value="2y">Last 2 Years</SelectItem>
              <SelectItem value="5y">Last 5 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Component Selection Tags */}
      {compareWith !== 'none' && selectedComponents.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Components:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedComponents.map(code => {
              const component = availableComponents.find(c => c.code === code);
              return (
                <Badge key={code} variant="secondary" className="flex items-center gap-1">
                  {component?.name || code}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onComponentToggle(code)}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Components for Selection */}
      {compareWith !== 'none' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Available {compareWith === 'sectoral' ? 'Sectoral' : 'Use-based'} Components:
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableComponents
              .filter(comp => !selectedComponents.includes(comp.code))
              .map(component => (
                <Button
                  key={component.code}
                  variant="outline"
                  size="sm"
                  onClick={() => onComponentToggle(component.code)}
                >
                  {component.name}
                </Button>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
};
