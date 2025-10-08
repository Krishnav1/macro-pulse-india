import { useState, useEffect } from 'react';
import { useCashProvisionalData, useFIIDIIFinancialYears, useFIIDIIMonths } from '@/hooks/financial/useFIIDIIDataNew';

export default function FIIDIIActivityPage() {
  const [view, setView] = useState<'monthly' | 'daily' | 'quarterly'>('monthly');
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const { years, loading: yearsLoading } = useFIIDIIFinancialYears();
  const { months } = useFIIDIIMonths(selectedFY);
  
  const { data: cashProvisionalData, loading } = useCashProvisionalData({
    view,
    financialYear: selectedFY,
    month: selectedMonth,
  });

  useEffect(() => {
    if (years.length > 0 && !selectedFY) {
      setSelectedFY(years[0]);
    }
  }, [years]);

  if (loading || yearsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FII/DII data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">FII/DII Activity</h1>
            
            <div className="flex items-center gap-3">
              {view === 'daily' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={view}
                onChange={(e) => setView(e.target.value as 'monthly' | 'daily' | 'quarterly')}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">FII/DII Data Upload Complete</h2>
          <p className="text-muted-foreground mb-6">
            Database tables and upload components are ready. UI components will be built in Phase 3.
          </p>
          <div className="bg-card p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-semibold mb-4">Upload Data via Admin Panel:</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Go to <span className="font-mono bg-muted px-2 py-1 rounded">/admin</span> → Financial Markets → FII/DII Activity
            </p>
            <div className="text-left space-y-2 text-sm">
              <p>✅ 7 Database tables created</p>
              <p>✅ 7 CSV templates ready</p>
              <p>✅ 7 Upload components functional</p>
              <p>✅ Data hooks implemented</p>
              <p>⏳ UI components (Phase 3)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

