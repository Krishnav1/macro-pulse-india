import { useState } from "react";
import { economicIndicators } from "@/data/indicators";
import IndicatorCard from "@/components/IndicatorCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Indicators = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIndicators = economicIndicators.filter(indicator => {
    const matchesCategory = selectedCategory === "All" || indicator.category === selectedCategory;
    const matchesSearch = indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Economic Indicators</h1>
        <p className="text-muted-foreground">
          Comprehensive view of Indian macroeconomic indicators with search and filtering capabilities.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search indicators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredIndicators.length} of {economicIndicators.length} indicators
        </p>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIndicators.map((indicator) => (
          <IndicatorCard key={indicator.id} indicator={indicator} />
        ))}
      </div>

      {filteredIndicators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No indicators found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Indicators;