// Investor Tracker Tab - Deep dive into investor behavior and patterns

import { useState } from 'react';
import { 
  Users, 
  Building2, 
  Globe, 
  User, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { InvestorData, Deal } from '@/hooks/equity/useDealsAnalysis';
import { DateRange } from '@/utils/financialYearUtils';

interface InvestorTrackerTabProps {
  investorData: InvestorData[];
  allDeals: Deal[];
  loading: boolean;
  dateRange: DateRange;
}

export function InvestorTrackerTab({
  investorData,
  allDeals,
  loading,
  dateRange
}: InvestorTrackerTabProps) {
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'FII' | 'DII' | 'HNI' | 'Others'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'totalValue' | 'dealCount' | 'netFlow'>('totalValue');

  const formatValue = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toFixed(0)}`;
    }
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  // Filter and sort investors
  const filteredInvestors = investorData
    .filter(investor => {
      const matchesType = filterType === 'all' || investor.investorType === filterType;
      const matchesSearch = investor.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dealCount':
          return b.dealCount - a.dealCount;
        case 'netFlow':
          return Math.abs(b.netFlow) - Math.abs(a.netFlow);
        case 'totalValue':
        default:
          return b.totalValue - a.totalValue;
      }
    });

  // Get investor type icon and color
  const getInvestorTypeInfo = (type: InvestorData['investorType']) => {
    switch (type) {
      case 'FII':
        return { icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Foreign Institutional' };
      case 'DII':
        return { icon: Building2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Domestic Institutional' };
      case 'HNI':
        return { icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'High Net Worth Individual' };
      default:
        return { icon: Users, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Others' };
    }
  };

  // Get deals for selected investor
  const getInvestorDeals = (investorName: string) => {
    return allDeals
      .filter(deal => deal.client_name === investorName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20); // Last 20 deals
  };

  // Calculate investor stats by type
  const investorTypeStats = ['FII', 'DII', 'HNI', 'Others'].map(type => {
    const typeInvestors = investorData.filter(inv => inv.investorType === type);
    const totalValue = typeInvestors.reduce((sum, inv) => sum + inv.totalValue, 0);
    const totalDeals = typeInvestors.reduce((sum, inv) => sum + inv.dealCount, 0);
    const netFlow = typeInvestors.reduce((sum, inv) => sum + inv.netFlow, 0);
    
    return {
      type: type as InvestorData['investorType'],
      count: typeInvestors.length,
      totalValue,
      totalDeals,
      netFlow,
      ...getInvestorTypeInfo(type as InvestorData['investorType'])
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card animate-pulse">
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Investor Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {investorTypeStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.type} className={`dashboard-card ${stat.bg} border-l-4 border-l-current`}>
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <div className="font-semibold text-foreground">{stat.type}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Investors</span>
                  <span className="font-medium text-foreground">{stat.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Total Value</span>
                  <span className="font-medium text-foreground">{formatValue(stat.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Net Flow</span>
                  <span className={`font-medium ${
                    stat.netFlow >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.netFlow >= 0 ? '+' : ''}{formatValue(stat.netFlow)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Types</option>
                <option value="FII">FII</option>
                <option value="DII">DII</option>
                <option value="HNI">HNI</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="totalValue">Sort by Total Value</option>
              <option value="dealCount">Sort by Deal Count</option>
              <option value="netFlow">Sort by Net Flow</option>
            </select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredInvestors.length} of {investorData.length} investors
          </div>
        </div>
      </div>

      {/* Investor List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredInvestors.slice(0, 20).map((investor, index) => {
          const typeInfo = getInvestorTypeInfo(investor.investorType);
          const TypeIcon = typeInfo.icon;
          
          return (
            <div
              key={index}
              className="dashboard-card hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedInvestor(investor)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Investor Type Icon */}
                  <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                    <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                  </div>

                  {/* Investor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {investor.client_name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                        {investor.investorType}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatNumber(investor.dealCount)} deals</span>
                      <span>{investor.stocksTraded} stocks</span>
                      <span>Avg: {formatValue(investor.avgDealSize)}</span>
                    </div>
                    
                    {investor.preferredSectors.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">Sectors:</span>
                        {investor.preferredSectors.slice(0, 3).map((sector, i) => (
                          <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            {sector}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right space-y-1">
                  <div className="font-bold text-foreground">
                    {formatValue(investor.totalValue)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="h-3 w-3" />
                      <span>{formatValue(investor.buyValue)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-destructive">
                      <TrendingDown className="h-3 w-3" />
                      <span>{formatValue(investor.sellValue)}</span>
                    </div>
                  </div>
                  
                  <div className={`text-sm font-medium ${
                    investor.netFlow >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    Net: {investor.netFlow >= 0 ? '+' : ''}{formatValue(investor.netFlow)}
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Investor Detail Modal/Panel */}
      {selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getInvestorTypeInfo(selectedInvestor.investorType).bg}`}>
                    {(() => {
                      const Icon = getInvestorTypeInfo(selectedInvestor.investorType).icon;
                      return <Icon className={`h-6 w-6 ${getInvestorTypeInfo(selectedInvestor.investorType).color}`} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedInvestor.client_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {getInvestorTypeInfo(selectedInvestor.investorType).label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvestor(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-lg font-bold text-primary">{formatValue(selectedInvestor.totalValue)}</div>
                </div>
                <div className="bg-success/5 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Buying</div>
                  <div className="text-lg font-bold text-success">{formatValue(selectedInvestor.buyValue)}</div>
                </div>
                <div className="bg-destructive/5 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Selling</div>
                  <div className="text-lg font-bold text-destructive">{formatValue(selectedInvestor.sellValue)}</div>
                </div>
                <div className={`p-4 rounded-lg ${selectedInvestor.netFlow >= 0 ? 'bg-success/5' : 'bg-destructive/5'}`}>
                  <div className="text-sm text-muted-foreground">Net Flow</div>
                  <div className={`text-lg font-bold ${selectedInvestor.netFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {selectedInvestor.netFlow >= 0 ? '+' : ''}{formatValue(selectedInvestor.netFlow)}
                  </div>
                </div>
              </div>

              {/* Recent Deals */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Deals (Last 20)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getInvestorDeals(selectedInvestor.client_name).map((deal, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">{new Date(deal.date).toLocaleDateString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{deal.symbol}</div>
                              <div className="text-xs text-muted-foreground">{deal.stock_name}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              deal.deal_type === 'buy' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-destructive/20 text-destructive'
                            }`}>
                              {deal.deal_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{formatNumber(deal.quantity)}</td>
                          <td className="py-3 px-4 text-right">₹{deal.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatValue(deal.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
