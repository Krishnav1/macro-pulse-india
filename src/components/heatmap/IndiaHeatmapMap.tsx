import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIndiaStatesGeo } from '../../hooks/useIndiaStatesGeo';
import { StateValueMap } from '../../hooks/useHeatmapValues';
import { HeatmapIndicator } from '../../hooks/useHeatmapIndicators';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface IndiaHeatmapMapProps {
  stateValueMap: StateValueMap;
  stats: {
    min: number;
    max: number;
    mean: number;
    count: number;
  } | null;
  onStateClick: (stateName: string) => void;
  selectedIndicator?: HeatmapIndicator;
  selectedYear?: string;
}

// Color scale function
const getColor = (value: number | null, min: number, max: number): string => {
  if (value === null || value === undefined) {
    return '#e5e7eb'; // Gray for no data
  }

  // Normalize value to 0-1 range
  const normalized = (value - min) / (max - min);
  
  // Use a blue color scale (light to dark)
  const colors = [
    '#eff6ff', // Very light blue
    '#dbeafe', // Light blue
    '#bfdbfe', // Medium light blue
    '#93c5fd', // Medium blue
    '#60a5fa', // Medium dark blue
    '#3b82f6', // Blue
    '#2563eb', // Dark blue
    '#1d4ed8', // Very dark blue
    '#1e40af', // Darkest blue
  ];

  const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
  return colors[index];
};

export const IndiaHeatmapMap: React.FC<IndiaHeatmapMapProps> = ({
  stateValueMap,
  stats,
  onStateClick,
  selectedIndicator,
  selectedYear,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const { geoData, loading: geoLoading, error: geoError } = useIndiaStatesGeo();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 10,
      minZoom: 4,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update choropleth layer
  useEffect(() => {
    if (!mapInstanceRef.current || !geoData || !stats) return;

    // Remove existing layer
    if (geoLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoLayerRef.current);
    }

    // Create new choropleth layer
    const geoLayer = L.geoJSON(geoData, {
      style: (feature) => {
        if (!feature?.properties?.name) {
          return {
            fillColor: '#e5e7eb',
            weight: 1,
            opacity: 1,
            color: '#9ca3af',
            fillOpacity: 0.7,
          };
        }

        const stateName = feature.properties.name;
        const value = stateValueMap[stateName];
        const fillColor = getColor(value, stats.min, stats.max);

        return {
          fillColor,
          weight: 2,
          opacity: 1,
          color: '#374151',
          dashArray: '',
          fillOpacity: 0.8,
        };
      },
      onEachFeature: (feature, layer) => {
        if (!feature.properties?.name) return;

        const stateName = feature.properties.name;
        const value = stateValueMap[stateName];
        
        // Create tooltip content
        const tooltipContent = `
          <div class="p-2">
            <div class="font-semibold text-sm">${stateName}</div>
            ${selectedIndicator ? `<div class="text-xs text-gray-600">${selectedIndicator.name}</div>` : ''}
            ${selectedYear ? `<div class="text-xs text-gray-600">Year: ${selectedYear}</div>` : ''}
            <div class="text-sm mt-1">
              ${value !== null && value !== undefined 
                ? `<span class="font-medium">${value.toFixed(2)} ${selectedIndicator?.unit || ''}</span>`
                : '<span class="text-gray-500">No data</span>'
              }
            </div>
          </div>
        `;

        layer.bindTooltip(tooltipContent, {
          permanent: false,
          sticky: true,
          className: 'custom-tooltip',
        });

        // Add click handler
        layer.on('click', () => {
          onStateClick(stateName);
        });

        // Add hover effects
        layer.on('mouseover', (e) => {
          const target = e.target;
          target.setStyle({
            weight: 3,
            color: '#1f2937',
            fillOpacity: 0.9,
          });
          target.bringToFront();
        });

        layer.on('mouseout', (e) => {
          geoLayer.resetStyle(e.target);
        });
      },
    });

    geoLayer.addTo(mapInstanceRef.current);
    geoLayerRef.current = geoLayer;

    // Fit bounds to India
    const bounds = geoLayer.getBounds();
    mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });

  }, [geoData, stateValueMap, stats, onStateClick, selectedIndicator, selectedYear]);

  if (geoLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading map</p>
          <p className="text-sm text-gray-600">{geoError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      
      {/* Custom CSS for tooltips */}
      <style jsx>{`
        :global(.custom-tooltip) {
          background: white !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        :global(.custom-tooltip .leaflet-tooltip-content) {
          margin: 0 !important;
        }
        
        :global(.leaflet-container) {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};
