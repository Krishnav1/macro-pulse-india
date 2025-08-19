import { sampleIndicators, categories } from "@/data/sampleIndicators";
import IndicatorGridCard from "@/components/IndicatorGridCard";
import CategoryAccordion from "@/components/CategoryAccordion";

const Dashboard = () => {

  return (
    <div className="min-h-screen">
      {/* Fixed Desktop Layout - Optimized for 1920px+ screens */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Indian Economic Dashboard
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time tracking of key macroeconomic indicators with interactive visualizations 
            and historical insights into India's economic performance.
          </p>
        </div>

        {/* Fixed 4-Column Grid - Desktop Only */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {sampleIndicators.slice(0, 16).map((indicator) => (
            <IndicatorGridCard key={indicator.id} indicator={indicator} />
          ))}
        </div>

        {/* Show more indicators if available */}
        {sampleIndicators.length > 16 && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            {sampleIndicators.slice(16).map((indicator) => (
              <IndicatorGridCard key={indicator.id} indicator={indicator} />
            ))}
          </div>
        )}

        {/* Category Accordion Sections */}
        <CategoryAccordion categories={categories} />

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Data sourced from RBI, MOSPI, NSO, CGA, NSDL and other official government sources
            </p>
            <p>
              Last synchronized: {new Date().toLocaleString()} | 
              <span className="text-primary ml-2">Real-time updates every 15 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;