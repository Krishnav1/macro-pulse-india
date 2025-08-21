import { useState, useEffect } from 'react';
import { sampleIndicators, categories, categoryConfig } from "@/data/sampleIndicators";
import IndicatorGridCard from "@/components/IndicatorGridCard";
import { Activity } from "lucide-react";

const Indicators = () => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategoryIndex(prevIndex => (prevIndex + 1) % categories.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getIndicatorsByCategory = (category: string) => {
    return sampleIndicators.filter(indicator => indicator.category === category);
  };

  const currentCategory = categories[currentCategoryIndex];
  const indicators = getIndicatorsByCategory(currentCategory);
  const config = categoryConfig[currentCategory as keyof typeof categoryConfig];

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div key={currentCategory} className="category-fade-in space-y-6">
          {/* Category Header */}
          <div className="flex items-center justify-center text-center gap-3 mb-6">
            <div className={`p-3 rounded-lg ${config?.bgColor || 'bg-muted'}`}>
              <Activity className={`h-6 w-6 text-${config?.color || 'muted-foreground'}`} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">{currentCategory}</h2>
              <p className="text-sm text-muted-foreground">
                {indicators.length} indicators
              </p>
            </div>
          </div>
          
          {/* Indicators Grid - 5 columns, multiple rows as needed */}
          <div className="grid grid-cols-5 gap-6">
            {indicators.map((indicator) => (
              <IndicatorGridCard key={indicator.id} indicator={indicator} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Indicators;