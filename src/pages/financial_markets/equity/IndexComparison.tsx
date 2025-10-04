// Index Comparison Tool - Compare multiple indices side by side

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { useMarketIndices } from '@/hooks/equity/useMarketIndices';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function IndexComparison() {
  const { indices, loading } = useMarketIndices();
  const [selectedIndices, setSelectedIndices] = useState<string[]>(['NIFTY 50', 'NIFTY BANK']);

  const toggleIndex = (indexName: string) => {
    if (selectedIndices.includes(indexName)) {
      setSelectedIndices(selectedIndices.filter(i => i !== indexName));
    } else if (selectedIndices.length < 6) {
      setSelectedIndices([...selectedIndices, indexName]);
    }
  };

  const selectedData = indices.filter(i => selectedIndices.includes(i.name));

  return (
    <div className="min-h-screen bg-background">
      <CompactMarketTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/financial-markets/equity-markets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Equity Markets
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Index Comparison Tool
          </h1>
          <p className="text-muted-foreground">
            Compare multiple indices side-by-side (Select up to 6 indices)
          </p>
        </div>

        {/* Index Selection */}
        <div className="dashboard-card mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Indices to Compare</h3>
          <div className="flex flex-wrap gap-2">
            {indices.map((index) => {
              const isSelected = selectedIndices.includes(index.name);
              return (
                <button
                  key={index.id}
                  onClick={() => toggleIndex(index.name)}
                  disabled={!isSelected && selectedIndices.length >= 6}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSelected ? (
                    <span className="flex items-center gap-2">
                      {index.name}
                      <X className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {index.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {selectedIndices.length} / 6
          </p>
        </div>

        {/* Comparison Table */}
        <div className="dashboard-card mb-8 overflow-x-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Comparison</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Index</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Change</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Change %</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Open</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">High</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Low</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">52W High</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">52W Low</th>
              </tr>
            </thead>
            <tbody>
              {selectedData.map((index) => {
                const isPositive = (index.change_percent || 0) >= 0;
                return (
                  <tr key={index.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium text-foreground">{index.name}</td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{index.change?.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{index.change_percent?.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {index.open?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-success">
                      {index.high?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-destructive">
                      {index.low?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {index.year_high?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {index.year_low?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {selectedData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Select at least one index to compare
            </div>
          )}
        </div>

        {/* Insights */}
        {selectedData.length > 0 && (
          <div className="dashboard-card bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-3">Comparison Insights</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Best Performer:</strong>{' '}
                {selectedData.sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))[0]?.name} with{' '}
                {selectedData.sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))[0]?.change_percent?.toFixed(2)}% gain
              </p>
              <p>
                <strong className="text-foreground">Worst Performer:</strong>{' '}
                {selectedData.sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))[0]?.name} with{' '}
                {selectedData.sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))[0]?.change_percent?.toFixed(2)}% change
              </p>
              <p>
                <strong className="text-foreground">Average Change:</strong>{' '}
                {(selectedData.reduce((sum, i) => sum + (i.change_percent || 0), 0) / selectedData.length).toFixed(2)}%
                across selected indices
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
