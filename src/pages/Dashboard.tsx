import { useState } from "react";
import { economicIndicators } from "@/data/indicators";
import IndicatorCard from "@/components/IndicatorCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Activity, Users, Building2, Globe } from "lucide-react";

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredIndicators = selectedCategory === "All" 
    ? economicIndicators 
    : economicIndicators.filter(indicator => indicator.category === selectedCategory);

  const dashboardStats = [
    {
      label: "Active Indicators",
      value: economicIndicators.length,
      icon: Activity,
      color: "text-chart-1"
    },
    {
      label: "Data Sources",
      value: new Set(economicIndicators.map(i => i.source)).size,
      icon: Building2,
      color: "text-chart-2"
    },
    {
      label: "Categories",
      value: new Set(economicIndicators.map(i => i.category)).size,
      icon: Globe,
      color: "text-chart-3"
    },
    {
      label: "Last Updated",
      value: "Today",
      icon: Users,
      color: "text-chart-4"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Indian Economic Dashboard
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Real-time tracking of key macroeconomic indicators with interactive visualizations 
          and historical insights into India's economic performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={stat.label} className="dashboard-card text-center">
            <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIndicators.map((indicator) => (
          <IndicatorCard key={indicator.id} indicator={indicator} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 pt-8 border-t border-border">
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
  );
};

export default Dashboard;