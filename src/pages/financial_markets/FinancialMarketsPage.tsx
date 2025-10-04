// Financial Markets Landing Page

import { CompactMarketTicker } from '@/components/financial/CompactMarketTicker';
import { CategoryCard } from '@/components/financial/CategoryCard';
import { useFinancialCategories } from '@/hooks/financial/useFinancialCategories';
import { Loader2 } from 'lucide-react';

export default function FinancialMarketsPage() {
  const { categories, loading, error } = useFinancialCategories();

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Market Ticker */}
      <CompactMarketTicker />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Financial Markets
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of Indian financial markets with live data, historical trends, and deep insights
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            Error loading categories: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                href={`/financial-markets/${category.slug}`}
              />
            ))}
          </div>
        )}

        {/* Quick Stats Section */}
        <div className="mt-12 dashboard-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">5</div>
              <div className="text-sm text-muted-foreground">Market Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-1">11</div>
              <div className="text-sm text-muted-foreground">Sectors Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-1">Live</div>
              <div className="text-sm text-muted-foreground">Real-time Data</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Data Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
