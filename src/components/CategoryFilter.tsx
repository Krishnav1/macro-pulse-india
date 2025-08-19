import { Badge } from "@/components/ui/badge";
import { categories } from "@/data/indicators";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      All: "🏠",
      Growth: "📈", 
      Inflation: "💰",
      Monetary: "🏦",
      External: "🌍",
      Fiscal: "📊"
    };
    return icons[category] || "📋";
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "secondary"}
          className={`cursor-pointer transition-all hover:scale-105 px-3 py-1 ${
            selectedCategory === category 
              ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" 
              : "hover:bg-primary/10"
          }`}
          onClick={() => onCategoryChange(category)}
        >
          <span className="mr-1">{getCategoryIcon(category)}</span>
          {category}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;