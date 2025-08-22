import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { CpiSeriesData } from "@/hooks/useCpiSeries";
import { CpiEventData } from "@/hooks/useCpiEvents";

interface CPICombinedChartProps {
  data: CpiSeriesData[];
  events: CpiEventData[];
  showInflation: boolean;
  inflationType: 'yoy' | 'mom';
}

export const CPICombinedChart = ({ 
  data, 
  events, 
  showInflation, 
  inflationType 
}: CPICombinedChartProps) => {
  const formatTooltip = (value: any, name: string) => {
    if (name === 'index_value') {
      return [`${value}`, 'CPI Index'];
    }
    if (name === 'inflation_yoy' || name === 'inflation_mom') {
      return [`${value}%`, inflationType === 'yoy' ? 'Inflation (YoY)' : 'Inflation (MoM)'];
    }
    return [value, name];
  };

  const getEventMarkers = () => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const dataRange = data.map(d => new Date(d.date));
      if (dataRange.length === 0) return false;
      const minDate = Math.min(...dataRange.map(d => d.getTime()));
      const maxDate = Math.max(...dataRange.map(d => d.getTime()));
      return eventDate.getTime() >= minDate && eventDate.getTime() <= maxDate;
    });
  };

  const eventMarkers = getEventMarkers();

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis 
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            label={{ value: 'CPI Index', angle: -90, position: 'insideLeft' }}
          />
          {showInflation && (
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{ value: 'Inflation %', angle: 90, position: 'insideRight' }}
            />
          )}
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--foreground))"
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="index_value"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
          {showInflation && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={inflationType === 'yoy' ? 'inflation_yoy' : 'inflation_mom'}
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, stroke: "hsl(var(--destructive))", strokeWidth: 2 }}
            />
          )}
          {eventMarkers.map((event, index) => (
            <ReferenceLine 
              key={index}
              x={event.date}
              stroke="hsl(var(--warning))"
              strokeDasharray="2 2"
              label={{ 
                value: event.title.substring(0, 15) + "...", 
                position: "top",
                style: { fontSize: '10px' }
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
