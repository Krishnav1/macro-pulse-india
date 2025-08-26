import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import IndicatorDetailPage from './IndicatorDetailPage';

// Lazily load indicator pages for code-splitting
const RepoRatePage = React.lazy(() => import('./indicators/repo_rate'));
const ForexReservesPage = React.lazy(() => import('./indicators/forex_reserves'));
const RealGdpGrowthPage = React.lazy(() => import('./indicators/real_gdp_growth'));

// A mapping from indicator ID to its specific component
const indicatorPageMap: { [key: string]: React.FC } = {
  'repo_rate': RepoRatePage,
  'forex_reserves': ForexReservesPage,
  'real_gdp_growth': RealGdpGrowthPage,
};

const IndicatorRouter = () => {
  const { id } = useParams<{ id: string }>();
  
  // Check if we're on the forex_reserves route specifically
  const currentPath = window.location.pathname;
  if (currentPath === '/indicators/forex_reserves') {
    const ForexReservesComponent = indicatorPageMap['forex_reserves'];
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ForexReservesComponent />
      </Suspense>
    );
  }

  // If an ID is provided and it exists in our map, render the specific page
  if (id && indicatorPageMap[id]) {
    const Component = indicatorPageMap[id];
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Component />
      </Suspense>
    );
  }

  // Otherwise, fall back to the generic detail page
  return <IndicatorDetailPage />;
};

export default IndicatorRouter;
