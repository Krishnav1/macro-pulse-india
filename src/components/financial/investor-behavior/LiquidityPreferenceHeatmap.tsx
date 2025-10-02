// =====================================================
// LIQUIDITY PREFERENCE HEATMAP
// Shows holding period preferences by age group
// =====================================================

import { useAgeGroupAnalysis } from '@/hooks/investor-behavior/useAgeGroupAnalysis';
import { Skeleton } from '@/components/ui/skeleton';

export function LiquidityPreferenceHeatmap() {
  const { analysis, isLoading } = useAgeGroupAnalysis();

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  if (!analysis || analysis.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  const periods = ['0-1', '1-3', '3-6', '6-12', '12-24', '>24'];
  const periodLabels = ['0-1M', '1-3M', '3-6M', '6-12M', '12-24M', '>24M'];

  // Calculate percentages for each cell
  const heatmapData = analysis.map(group => {
    const total = group.total_aum;
    return {
      ageGroup: group.age_group,
      percentages: periods.map(period => {
        const key = period as keyof typeof group.holding_distribution;
        const value = group.holding_distribution[key];
        return total > 0 ? (value / total) * 100 : 0;
      })
    };
  });

  const getColor = (percentage: number) => {
    if (percentage >= 40) return 'bg-green-600 text-white';
    if (percentage >= 30) return 'bg-green-500 text-white';
    if (percentage >= 20) return 'bg-green-400 text-white';
    if (percentage >= 15) return 'bg-yellow-400 text-gray-900';
    if (percentage >= 10) return 'bg-yellow-300 text-gray-900';
    if (percentage >= 5) return 'bg-orange-300 text-gray-900';
    return 'bg-red-200 text-gray-900';
  };

  const getIntensity = (percentage: number) => {
    // For glow effect
    if (percentage >= 40) return 'shadow-lg shadow-green-500/50';
    if (percentage >= 30) return 'shadow-md shadow-green-400/40';
    if (percentage >= 20) return 'shadow-sm shadow-green-300/30';
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-border bg-muted p-3 text-left font-semibold sticky left-0 z-10">
                Age Group
              </th>
              {periodLabels.map((label, idx) => (
                <th key={idx} className="border border-border bg-muted p-3 text-center font-semibold min-w-[80px]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                <td className="border border-border p-3 font-medium bg-card sticky left-0 z-10">
                  {row.ageGroup}
                </td>
                {row.percentages.map((pct, colIdx) => (
                  <td key={colIdx} className="border border-border p-0">
                    <div 
                      className={`
                        p-3 text-center font-semibold transition-all hover:scale-105
                        ${getColor(pct)} ${getIntensity(pct)}
                      `}
                      title={`${row.ageGroup} - ${periodLabels[colIdx]}: ${pct.toFixed(1)}%`}
                    >
                      {pct.toFixed(1)}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
        <span className="font-medium">Intensity:</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-200 border border-border rounded" />
          <span className="text-muted-foreground">&lt;5%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-300 border border-border rounded" />
          <span className="text-muted-foreground">5-10%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-300 border border-border rounded" />
          <span className="text-muted-foreground">10-20%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 border border-border rounded" />
          <span className="text-muted-foreground">20-30%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 border border-border rounded" />
          <span className="text-muted-foreground">30-40%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-600 border border-border rounded" />
          <span className="text-muted-foreground">&gt;40%</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">🔥 Interpretation:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <span className="text-green-600 font-medium">Darker green cells</span> indicate strong preference for that holding period</li>
          <li>• <span className="text-red-600 font-medium">Red/Orange cells</span> show low allocation to that period</li>
          <li>• Right-heavy rows (green on right) = long-term oriented investors (sticky)</li>
          <li>• Left-heavy rows (green on left) = short-term oriented investors (high churn risk)</li>
        </ul>
      </div>
    </div>
  );
}
