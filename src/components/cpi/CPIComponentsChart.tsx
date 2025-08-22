import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { CpiComponentData } from "@/hooks/useCpiComponents";

interface CPIComponentsChartProps {
  data: CpiComponentData[];
  chartType: 'contribution' | 'inflation';
  selectedComponents: string[];
}

export const CPIComponentsChart = ({ 
  data, 
  chartType, 
  selectedComponents 
}: CPIComponentsChartProps) => {
  // Get latest data for each component
  const getLatestComponentData = () => {
    const componentMap = new Map<string, CpiComponentData>();
    
    data.forEach(item => {
      const existing = componentMap.get(item.component_code);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        componentMap.set(item.component_code, item);
      }
    });

    return Array.from(componentMap.values())
      .filter(item => selectedComponents.length === 0 || selectedComponents.includes(item.component_code))
      .sort((a, b) => {
        const valueA = chartType === 'contribution' ? (a.contribution_to_inflation || 0) : (a.inflation_yoy || 0);
        const valueB = chartType === 'contribution' ? (b.contribution_to_inflation || 0) : (b.inflation_yoy || 0);
        return Math.abs(valueB) - Math.abs(valueA);
      });
  };

  const chartData = getLatestComponentData();

  const formatTooltip = (value: any, name: string, props: any) => {
    const { payload } = props;
    if (chartType === 'contribution') {
      return [`${value}%`, `${payload.component_name} Contribution`];
    } else {
      return [`${value}%`, `${payload.component_name} Inflation`];
    }
  };

  const getBarColor = (value: number) => {
    if (value > 0) return "hsl(var(--destructive))";
    if (value < 0) return "hsl(var(--success))";
    return "hsl(var(--muted))";
  };

  const dataKey = chartType === 'contribution' ? 'contribution_to_inflation' : 'inflation_yoy';

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            label={{ 
              value: chartType === 'contribution' ? 'Contribution to Inflation (%)' : 'Inflation Rate (%)', 
              position: 'insideBottom', 
              offset: -10 
            }}
          />
          <YAxis 
            type="category"
            dataKey="component_name"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            width={90}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--foreground))"
            }}
          />
          <Bar dataKey={dataKey}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry[dataKey] || 0)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
