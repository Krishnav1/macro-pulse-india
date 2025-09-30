import React from 'react';

interface HeatmapLegendProps {
  stats: {
    min: number;
    max: number;
    mean: number;
    count: number;
  };
  unit: string;
  indicatorName: string;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({
  stats,
  unit,
  indicatorName,
}) => {
  // Color scale matching the map
  const colors = [
    '#eff6ff', // Very light blue
    '#dbeafe', // Light blue
    '#bfdbfe', // Medium light blue
    '#93c5fd', // Medium blue
    '#60a5fa', // Medium dark blue
    '#3b82f6', // Blue
    '#2563eb', // Dark blue
    '#1d4ed8', // Very dark blue
    '#1e40af', // Darkest blue
  ];

  // Calculate value ranges for legend
  const range = stats.max - stats.min;
  const steps = colors.length;
  const stepSize = range / (steps - 1);

  const legendItems = colors.map((color, index) => {
    const value = stats.min + (stepSize * index);
    return {
      color,
      value: value,
      label: value.toFixed(1),
    };
  });

  return (
    <div className="space-y-4">
      {/* Color Scale */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Color Scale</h4>
        
        {/* Gradient Bar */}
        <div className="relative">
          <div 
            className="h-4 rounded"
            style={{
              background: `linear-gradient(to right, ${colors.join(', ')})`,
            }}
          />
          
          {/* Value Labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-600">
            <span>{stats.min.toFixed(1)}</span>
            <span>{stats.max.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          {unit && `Values in ${unit}`}
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-700">Minimum</div>
            <div className="text-gray-900">{stats.min.toFixed(2)} {unit}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-700">Maximum</div>
            <div className="text-gray-900">{stats.max.toFixed(2)} {unit}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-700">Average</div>
            <div className="text-gray-900">{stats.mean.toFixed(2)} {unit}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-gray-700">States</div>
            <div className="text-gray-900">{stats.count}</div>
          </div>
        </div>
      </div>

      {/* No Data Indicator */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Legend</h4>
        <div className="flex items-center gap-2 text-xs">
          <div 
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: '#e5e7eb' }}
          />
          <span className="text-gray-600">No data available</span>
        </div>
      </div>

      {/* Data Quality Info */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Coverage: {stats.count} of 36 states/UTs</div>
          <div>
            Quality: {((stats.count / 36) * 100).toFixed(0)}% data availability
          </div>
        </div>
      </div>
    </div>
  );
};
