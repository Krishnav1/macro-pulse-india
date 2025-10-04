import { Search, TrendingUp, BarChart3, Calendar, Info, Map, LineChart, Activity, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FinancialMarketsMenu } from "./navigation/FinancialMarketsMenu";

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFinancialMenuOpen, setIsFinancialMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    // { path: '/indicators', label: 'Indicators', icon: TrendingUp }, // Temporarily disabled - access via dashboard cards
    { path: '/india-heat-map', label: 'India Heat Map', icon: Map },
    { path: '/financial-markets', label: 'Financial Markets', icon: LineChart },
    // { path: '/financial-markets/industry-trends', label: 'Industry Trends', icon: Activity }, // Temporarily disabled - access via financial markets
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsFinancialMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFinancialMarketsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFinancialMenuOpen(!isFinancialMenuOpen);
  };

  return (
    <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Macro Pulse India
            </span>
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-8">
            {navItems.map((item) => {
              // Special handling for Financial Markets
              if (item.path === '/financial-markets') {
                return (
                  <button
                    key={item.path}
                    onClick={handleFinancialMarketsClick}
                    className={`nav-link ${location.pathname.startsWith('/financial-markets') ? 'active' : ''} flex items-center`}
                  >
                    <item.icon className="h-4 w-4 mr-1 md:mr-2 inline" />
                    <span className="text-sm md:text-base">{item.label}</span>
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${isFinancialMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                );
              }
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  end={item.path === "/"}
                >
                  <item.icon className="h-4 w-4 mr-1 md:mr-2 inline" />
                  <span className="text-sm md:text-base">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-background/50"
              />
            </div>
            <Button type="submit" size="sm" className="hidden sm:flex">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Financial Markets Mega Menu */}
      <FinancialMarketsMenu 
        isOpen={isFinancialMenuOpen} 
        onClose={() => setIsFinancialMenuOpen(false)} 
      />
    </nav>
  );
};

export default Navigation;