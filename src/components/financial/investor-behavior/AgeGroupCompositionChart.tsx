// =====================================================
// AGE GROUP COMPOSITION CHART
// Shows AUM distribution across age groups over time
// =====================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function AgeGroupCompositionChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: rawData, error } = await (supabase as any)
        .from('investor_behavior_data')
        .select('*')
        .order('quarter_end_date', { ascending: true });

      if (error) throw error;
      if (!rawData) {
        setData([]);
        return;
      }

      // Group by quarter and age group
      const quarterMap = new Map<string, any>();

      rawData.forEach((row: any) => {
        const key = row.quarter_end_date;
        if (!quarterMap.has(key)) {
          quarterMap.set(key, {
            quarter: row.quarter_label,
            Corporates: 0,
            'Banks/FIs': 0,
            HNI: 0,
            Retail: 0,
            NRI: 0
          });
        }

        const quarter = quarterMap.get(key);
        const ageGroup = row.age_group;
        if (quarter[ageGroup] !== undefined) {
          quarter[ageGroup] += row.total_aum;
        }
      });

      setData(Array.from(quarterMap.values()));
    } catch (err) {
      console.error('Error fetching age group composition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}:</span>
                  </div>
                  <div className="font-medium">
                    ₹{entry.value.toLocaleString('en-IN')} Cr ({percentage}%)
                  </div>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border font-semibold">
              Total: ₹{total.toLocaleString('en-IN')} Cr
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'AUM (₹ Crore)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line type="monotone" dataKey="Corporates" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Banks/FIs" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="HNI" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Retail" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="NRI" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">👥 Interpretation:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <span className="font-medium">Steeper upward slopes</span> = faster growing investor segments</li>
          <li>• <span className="font-medium">Flat or declining lines</span> = stagnant or shrinking segments</li>
          <li>• Track which age groups are driving industry growth</li>
          <li>• Retail participation growth is a key indicator of market democratization</li>
        </ul>
      </div>
    </div>
  );
}
