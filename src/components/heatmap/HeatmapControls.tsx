import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { HeatmapIndicator } from '../../hooks/useHeatmapIndicators';

interface HeatmapControlsProps {
  indicators: HeatmapIndicator[];
  selectedIndicatorId: string;
  onIndicatorChange: (indicatorId: string) => void;
  years: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  isAnimating: boolean;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  onStartAnimation: () => void;
  onStopAnimation: () => void;
  loading: boolean;
}

export const HeatmapControls: React.FC<HeatmapControlsProps> = ({
  indicators,
  selectedIndicatorId,
  onIndicatorChange,
  years,
  selectedYear,
  onYearChange,
  isAnimating,
  animationSpeed,
  onAnimationSpeedChange,
  onStartAnimation,
  onStopAnimation,
  loading,
}) => {
  const selectedIndicator = indicators.find(ind => ind.id === selectedIndicatorId);

  return (
    <div className="space-y-6">
      {/* Indicator Selection */}
      <div className="space-y-2">
        <Label htmlFor="indicator-select">Select Indicator</Label>
        <select
          id="indicator-select"
          value={selectedIndicatorId}
          onChange={(e) => onIndicatorChange(e.target.value)}
          disabled={loading || indicators.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">Choose an indicator...</option>
          {indicators.map((indicator) => (
            <option key={indicator.id} value={indicator.id}>
              {indicator.name} ({indicator.unit})
            </option>
          ))}
        </select>
        
        {selectedIndicator?.description && (
          <p className="text-xs text-gray-600 mt-1">
            {selectedIndicator.description}
          </p>
        )}
      </div>

      {/* Year Selection */}
      <div className="space-y-2">
        <Label htmlFor="year-select">Select Year</Label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          disabled={loading || years.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">Choose a year...</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Year Slider for Quick Navigation */}
      {years.length > 1 && selectedYear && (
        <div className="space-y-2">
          <Label>Year Navigation</Label>
          <div className="px-2">
            <input
              type="range"
              min={0}
              max={years.length - 1}
              value={years.indexOf(selectedYear)}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                if (index >= 0 && index < years.length) {
                  onYearChange(years[index]);
                }
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={loading || isAnimating}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{years[years.length - 1]}</span>
              <span>{years[0]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Animation Controls */}
      {years.length > 1 && (
        <div className="space-y-4 pt-4 border-t">
          <Label>Time Animation</Label>
          
          <div className="flex gap-2">
            {!isAnimating ? (
              <Button
                onClick={onStartAnimation}
                disabled={loading || years.length <= 1}
                size="sm"
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Play
              </Button>
            ) : (
              <Button
                onClick={onStopAnimation}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop
              </Button>
            )}
            
            <Button
              onClick={() => onYearChange(years[0])}
              disabled={loading || isAnimating}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Animation Speed Control */}
          <div className="space-y-2">
            <Label className="text-sm">Animation Speed</Label>
            <div className="px-2">
              <input
                type="range"
                min={500}
                max={3000}
                step={250}
                value={animationSpeed}
                onChange={(e) => onAnimationSpeedChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={isAnimating}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {(animationSpeed / 1000).toFixed(1)}s per year
            </p>
          </div>
        </div>
      )}

      {/* Data Info */}
      {selectedIndicator && selectedYear && (
        <div className="pt-4 border-t">
          <div className="text-sm space-y-1">
            <div className="font-medium text-gray-900">Current Selection</div>
            <div className="text-gray-600">{selectedIndicator.name}</div>
            <div className="text-gray-600">Year: {selectedYear}</div>
            <div className="text-gray-600">Unit: {selectedIndicator.unit}</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
