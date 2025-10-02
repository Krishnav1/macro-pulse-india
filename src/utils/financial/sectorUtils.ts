// Utility functions for sector data

import { SectorColorIntensity } from '@/types/financial-markets.types';

/**
 * Get color intensity based on change percentage
 */
export function getSectorColorIntensity(changePercent: number): SectorColorIntensity {
  if (changePercent >= 3) return 'very-positive';
  if (changePercent >= 1) return 'positive';
  if (changePercent <= -3) return 'very-negative';
  if (changePercent <= -1) return 'negative';
  return 'neutral';
}

/**
 * Get background color class based on intensity (Dark theme optimized)
 */
export function getSectorColorClass(intensity: SectorColorIntensity): string {
  const colorMap: Record<SectorColorIntensity, string> = {
    'very-positive': 'bg-success text-success-foreground border-success shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    'positive': 'bg-success/20 text-success border-success/30',
    'neutral': 'bg-muted text-muted-foreground border-border',
    'negative': 'bg-destructive/20 text-destructive border-destructive/30',
    'very-negative': 'bg-destructive text-destructive-foreground border-destructive shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  };
  return colorMap[intensity];
}

/**
 * Format market cap in readable format
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_00_000) {
    return `₹${(marketCap / 1_00_000).toFixed(2)}L Cr`;
  }
  if (marketCap >= 1_000) {
    return `₹${(marketCap / 1_000).toFixed(2)}K Cr`;
  }
  return `₹${marketCap.toFixed(0)} Cr`;
}

/**
 * Get sector display name
 */
export function getSectorDisplayName(sectorSlug: string): string {
  const nameMap: Record<string, string> = {
    'it': 'Information Technology',
    'bank': 'Banking',
    'auto': 'Automobile',
    'pharma': 'Pharmaceuticals',
    'fmcg': 'FMCG',
    'metal': 'Metals',
    'energy': 'Energy',
    'realty': 'Real Estate',
    'financial': 'Financial Services',
    'media': 'Media & Entertainment',
    'psu-bank': 'PSU Banks',
  };
  return nameMap[sectorSlug] || sectorSlug.toUpperCase();
}
