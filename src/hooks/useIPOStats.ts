// Custom hook for calculating IPO statistics

import { useMemo } from 'react';
import { IPOListing, IPOStats } from '@/types/ipo';
import { calculateListingOpenGain } from '@/utils/ipoParser';

export function useIPOStats(ipos: IPOListing[]): IPOStats {
  return useMemo(() => {
    if (!ipos || ipos.length === 0) {
      return {
        totalIPOs: 0,
        totalIssueSize: 0,
        avgListingGain: 0,
        avgCurrentReturn: 0,
        successRate: 0,
        openProfitCount: 0,
        openLossCount: 0,
        avgOpenGain: 0,
        closeProfitCount: 0,
        closeLossCount: 0,
        avgCloseGain: 0,
        currentProfitCount: 0,
        currentLossCount: 0,
        avgCurrentGain: 0,
      };
    }

    // Basic stats
    const totalIPOs = ipos.length;
    const totalIssueSize = ipos.reduce((sum, ipo) => sum + (ipo.issue_size || 0), 0);

    // Listing Day Open Analysis
    const iposWithOpenData = ipos.filter(ipo => 
      ipo.issue_price && ipo.listing_open
    );
    
    const openGains = iposWithOpenData.map(ipo => 
      calculateListingOpenGain(ipo.issue_price!, ipo.listing_open!)
    );
    
    const openProfitCount = openGains.filter(gain => gain > 0).length;
    const openLossCount = openGains.filter(gain => gain < 0).length;
    const avgOpenGain = openGains.length > 0 
      ? openGains.reduce((sum, gain) => sum + gain, 0) / openGains.length 
      : 0;

    // Listing Day Close Analysis
    const iposWithCloseData = ipos.filter(ipo => 
      ipo.listing_gain_percent !== null && ipo.listing_gain_percent !== undefined
    );
    
    const closeProfitCount = iposWithCloseData.filter(ipo => 
      (ipo.listing_gain_percent || 0) > 0
    ).length;
    
    const closeLossCount = iposWithCloseData.filter(ipo => 
      (ipo.listing_gain_percent || 0) < 0
    ).length;
    
    const avgCloseGain = iposWithCloseData.length > 0
      ? iposWithCloseData.reduce((sum, ipo) => sum + (ipo.listing_gain_percent || 0), 0) / iposWithCloseData.length
      : 0;

    // Till Date (Current) Analysis
    const iposWithCurrentData = ipos.filter(ipo => 
      ipo.current_gain_percent !== null && ipo.current_gain_percent !== undefined
    );
    
    const currentProfitCount = iposWithCurrentData.filter(ipo => 
      (ipo.current_gain_percent || 0) > 0
    ).length;
    
    const currentLossCount = iposWithCurrentData.filter(ipo => 
      (ipo.current_gain_percent || 0) < 0
    ).length;
    
    const avgCurrentGain = iposWithCurrentData.length > 0
      ? iposWithCurrentData.reduce((sum, ipo) => sum + (ipo.current_gain_percent || 0), 0) / iposWithCurrentData.length
      : 0;

    // Success rate (based on current performance)
    const successRate = iposWithCurrentData.length > 0
      ? (currentProfitCount / iposWithCurrentData.length) * 100
      : 0;

    // Average listing gain (for backward compatibility)
    const avgListingGain = avgCloseGain;
    const avgCurrentReturn = avgCurrentGain;

    return {
      totalIPOs,
      totalIssueSize,
      avgListingGain,
      avgCurrentReturn,
      successRate,
      openProfitCount,
      openLossCount,
      avgOpenGain,
      closeProfitCount,
      closeLossCount,
      avgCloseGain,
      currentProfitCount,
      currentLossCount,
      avgCurrentGain,
    };
  }, [ipos]);
}
