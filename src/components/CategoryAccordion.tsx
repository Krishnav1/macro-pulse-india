import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { sampleIndicators, categoryConfig } from '@/data/sampleIndicators';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CategoryAccordionProps {
  categories: string[];
}

const CategoryAccordion = ({ categories }: CategoryAccordionProps) => {
  const navigate = useNavigate();

  const getIndicatorsByCategory = (category: string) => {
    return sampleIndicators.filter(indicator => indicator.category === category);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 status-positive" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 status-negative" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'status-positive';
    if (change < 0) return 'status-negative';
    return 'text-muted-foreground';
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Economic Indicators by Category
        </span>
      </h2>
      
      <Accordion type="multiple" className="w-full space-y-4">
        {categories.map((category) => {
          const indicators = getIndicatorsByCategory(category);
          const config = categoryConfig[category as keyof typeof categoryConfig];
          
          return (
            <AccordionItem 
              key={category} 
              value={category}
              className={`dashboard-card ${config?.borderColor || 'border-border'}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-muted'}`}>
                    <Activity className={`h-5 w-5 text-${config?.color || 'muted-foreground'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">{category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {indicators.length} indicators
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent>
                <div className="space-y-2 pt-4">
                  {indicators.length > 0 ? (
                    indicators.map((indicator) => (
                      <div
                        key={indicator.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group"
                        onClick={() => navigate(`/indicator/${indicator.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${config?.bgColor || 'bg-muted'}`}>
                            <Activity className={`h-3 w-3 text-${config?.color || 'muted-foreground'}`} />
                          </div>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {indicator.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-foreground">
                            {indicator.value}
                          </span>
                          <div className={`flex items-center gap-1 text-xs ${getChangeColor(indicator.change)}`}>
                            {getTrendIcon(indicator.change)}
                            <span>{Math.abs(indicator.change)}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Indicators coming soon...</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default CategoryAccordion;