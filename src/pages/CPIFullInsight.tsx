import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart,
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from "recharts";

// Mock data for the 5 charts
const mockTrendData = [
  { date: '2024-01', inflation: 5.1, index: 158.5 },
  { date: '2023-12', inflation: 5.7, index: 157.2 },
  { date: '2023-11', inflation: 5.5, index: 156.8 },
  { date: '2023-10', inflation: 4.9, index: 155.1 },
  { date: '2023-09', inflation: 5.0, index: 154.8 },
  { date: '2023-08', inflation: 6.8, index: 154.2 },
];

const mockComponentData = [
  { name: 'Food & Beverages', value: 45.86, contribution: 2.1 },
  { name: 'Housing', value: 10.07, contribution: 3.2 },
  { name: 'Fuel & Light', value: 6.84, contribution: -0.8 },
  { name: 'Clothing', value: 6.53, contribution: 1.2 },
  { name: 'Transport', value: 8.59, contribution: 0.5 },
  { name: 'Others', value: 22.11, contribution: 1.8 }
];

const mockVolatilityData = [
  { month: 'Jan', volatility: 2.1 },
  { month: 'Feb', volatility: 1.8 },
  { month: 'Mar', volatility: 2.5 },
  { month: 'Apr', volatility: 3.2 },
  { month: 'May', volatility: 2.9 },
  { month: 'Jun', volatility: 2.3 }
];

const mockRegionalData = [
  { region: 'Rural', inflation: 5.8 },
  { region: 'Urban', inflation: 4.6 },
  { region: 'Combined', inflation: 5.1 }
];

const mockSeasonalData = [
  { quarter: 'Q1', seasonal: 4.2, adjusted: 5.1 },
  { quarter: 'Q2', seasonal: 5.8, adjusted: 5.3 },
  { quarter: 'Q3', seasonal: 6.1, adjusted: 5.5 },
  { quarter: 'Q4', seasonal: 4.9, adjusted: 5.2 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CPIFullInsight = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">CPI Insights Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive analysis of Consumer Price Index trends and components
          </p>
        </div>

        {/* 5-Chart Grid Layout - 3 charts in first row, 2 in second row */}
        <div className="space-y-6">
          
          {/* First Row - 3 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: CPI Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CPI Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="inflation" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Component Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Component Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockComponentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockComponentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Weight']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 3: Inflation Volatility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inflation Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockVolatilityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="volatility" 
                        stroke="hsl(var(--destructive))" 
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - 2 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 4: Regional Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regional Inflation Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockRegionalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="region" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value}%`, 'Inflation']}
                      />
                      <Bar 
                        dataKey="inflation" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 5: Seasonal Adjustment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seasonal vs Adjusted CPI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSeasonalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="seasonal" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Seasonal"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="adjusted" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Seasonally Adjusted"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPIFullInsight;
