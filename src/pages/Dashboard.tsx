import { sampleIndicators, dashboardIndicators } from '../data/sampleIndicators';
import IndicatorGridCard from "@/components/IndicatorGridCard";
import { useLatestIndicatorValue } from '@/hooks/useLatestIndicatorValue';

const Dashboard = () => {
  const { value: repoRate } = useLatestIndicatorValue('repo_rate');
  const { value: gsecYield } = useLatestIndicatorValue('gsec_yield_10y');

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        {/* Top Live Ticker (auto-scroll continuously) */}
        <div className="mb-6">
          <div className="dashboard-card p-0 overflow-hidden">
            <div className="ticker-container">
              <div className="ticker-content">
                {[
                  "Nifty 50 24,350 (+0.6%)",
                  "Nifty Bank 52,120 (+0.4%)",
                  "Sensex 80,150 (+0.5%)",
                  "Gift Nifty 24,380 (+0.3%)",
                  `Repo ${repoRate ? repoRate.toFixed(2) : '6.50'}%`,
                  "Rev Repo 3.35%",
                  "Gold ₹73,500 (-0.2%)",
                  "Silver ₹88,200 (+0.1%)",
                  "USD/INR 83.1 (+0.1%)",
                  "Brent $82.4 (-0.4%)",
                  `10Y G-Sec ${gsecYield ? gsecYield.toFixed(2) : '7.10'}%`,
                ].map((item, i) => (
                  <span key={i} className="ticker-item text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Indian Economic Dashboard
            </span>
          </h1>
        </div>


        {/* Indicators Grid */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {dashboardIndicators.map((indicator) => (
            <IndicatorGridCard key={indicator.id} indicator={indicator} />
          ))}
        </div>



        {/* Footer Info */}
        <div className="mt-14 pt-8 border-t border-border">
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