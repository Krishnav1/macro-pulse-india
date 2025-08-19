import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  BarChart3, 
  Database, 
  Globe, 
  Shield, 
  Clock,
  Users,
  Building2,
  ExternalLink
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Data",
      description: "Live updates from official government sources with minimal latency"
    },
    {
      icon: BarChart3,
      title: "Interactive Charts",
      description: "Dynamic visualizations with event markers and historical context"
    },
    {
      icon: Database,
      title: "Comprehensive Coverage",
      description: "Six key categories covering all major economic indicators"
    },
    {
      icon: Shield,
      title: "Reliable Sources",
      description: "Data sourced from RBI, MOSPI, NSO, CGA, and other official bodies"
    }
  ];

  const dataSources = [
    { name: "Reserve Bank of India", acronym: "RBI", url: "https://rbi.org.in" },
    { name: "Ministry of Statistics and Programme Implementation", acronym: "MOSPI", url: "https://mospi.gov.in" },
    { name: "National Statistical Office", acronym: "NSO", url: "https://nso.gov.in" },
    { name: "Controller General of Accounts", acronym: "CGA", url: "https://cga.nic.in" },
    { name: "National Securities Depository Limited", acronym: "NSDL", url: "https://nsdl.co.in" },
    { name: "Securities and Exchange Board of India", acronym: "SEBI", url: "https://sebi.gov.in" }
  ];

  const categories = [
    { name: "Growth", description: "GDP growth, industrial production, and sectoral performance", color: "bg-chart-1" },
    { name: "Inflation", description: "CPI, WPI, and core inflation measurements", color: "bg-chart-3" },
    { name: "Monetary", description: "Interest rates, money supply, and RBI policy measures", color: "bg-chart-2" },
    { name: "External", description: "Forex reserves, trade balance, and capital flows", color: "bg-chart-4" },
    { name: "Fiscal", description: "Government finances, deficit, and debt metrics", color: "bg-chart-5" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          About <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Macro Pulse India
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive dashboard for tracking India's macroeconomic indicators with real-time data, 
          interactive visualizations, and historical insights to help understand the country's economic pulse.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <Card key={feature.title} className="text-center">
            <CardHeader>
              <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Indicator Categories
            </CardTitle>
            <CardDescription>
              Five major categories covering all aspects of the Indian economy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color} mt-1.5 flex-shrink-0`} />
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">{category.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To democratize access to India's economic data by providing a clean, intuitive interface 
              that transforms complex macroeconomic indicators into actionable insights.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">6+</div>
                <div className="text-xs text-muted-foreground">Data Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-xs text-muted-foreground">Key Indicators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-muted-foreground">Live Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10+</div>
                <div className="text-xs text-muted-foreground">Years of Data</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Official Data Sources
          </CardTitle>
          <CardDescription>
            All data is sourced from official government institutions and regulatory bodies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((source) => (
              <div key={source.acronym} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="font-medium text-sm">{source.acronym}</div>
                  <div className="text-xs text-muted-foreground">{source.name}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Data updated every 15 minutes | Last sync: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default About;