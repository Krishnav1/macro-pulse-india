// Category Card Component - Clickable card for each financial market category

import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, PieChart, DollarSign, Globe, Rocket, LucideIcon } from 'lucide-react';
import { FinancialCategory } from '@/types/financial-markets.types';

interface CategoryCardProps {
  category: FinancialCategory;
  href: string;
}

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  PieChart,
  DollarSign,
  Globe,
  Rocket,
};

export function CategoryCard({ category, href }: CategoryCardProps) {
  const Icon = iconMap[category.icon || 'TrendingUp'] || TrendingUp;

  return (
    <Link
      to={href}
      className="group relative dashboard-card hover:border-primary transition-all duration-200"
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {category.name}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent rounded-xl transition-all pointer-events-none"></div>
    </Link>
  );
}
