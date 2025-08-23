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
import { IipComponentData } from "@/hooks/useIipComponents";

interface IIPComponentsChartProps {
  data: IipComponentData[];
  chartType: 'index' | 'growth';
  growthType: 'yoy' | 'mom';
  selectedComponents: string[];
}

export const IIPComponentsChart = ({ 
  data, 
  chartType, 
  growthType,
  selectedComponents 
}: IIPComponentsChartProps) => {
  // Get latest data for each component
  const getLatestComponentData = () => {
    const componentMap = new Map<string, IipComponentData>();
    
    data.forEach(item => {
      const existing = componentMap.get(item.component_code);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        componentMap.set(item.component_code, item);
      }
    });

    return Array.from(componentMap.values())
      .filter(item => selectedComponents.length === 0 || selectedComponents.includes(item.component_code))
      .sort((a, b) => {
        let valueA, valueB;
        if (chartType === 'index') {
          valueA = a.index_value || 0;
          valueB = b.index_value || 0;
        } else {
          valueA = growthType === 'yoy' ? (a.growth_yoy || 0) : (a.growth_mom || 0);
          valueB = growthType === 'yoy' ? (b.growth_yoy || 0) : (b.growth_mom || 0);
        }
        return Math.abs(valueB) - Math.abs(valueA);
      });
  };

  const chartData = getLatestComponentData();

  const formatTooltip = (value: any, name: string, props: any) => {
    const { payload } = props;
    if (chartType === 'index') {
      return [`${value}`, `${payload.component_name} Index`];
    } else {
      const growthLabel = growthType === 'yoy' ? 'YoY Growth' : 'MoM Growth';
      return [`${value}%`, `${payload.component_name} ${growthLabel}`];
    }
  };

  const getBarColor = (value: number) => {
    if (chartType === 'index') {
      return "hsl(var(--primary))";
    }
    if (value > 0) return "hsl(var(--success))";
    if (value < 0) return "hsl(var(--destructive))";
    return "hsl(var(--muted))";
  };

  const getDataKey = () => {
    if (chartType === 'index') return 'index_value';
    return growthType === 'yoy' ? 'growth_yoy' : 'growth_mom';
  };

  const dataKey = getDataKey();

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
              value: chartType === 'index' ? 'Index Value' : `Growth Rate (${growthType.toUpperCase()}) %`, 
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
