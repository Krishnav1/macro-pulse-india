import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StateValueMap } from '../../hooks/useHeatmapValues';
import { HeatmapIndicator } from '../../hooks/useHeatmapIndicators';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc2huYXYxMjM0IiwiYSI6ImNtZzZ3MGhqbDBmeXEyaXNkcDl1eXViemwifQ.Rx_NZ--KlzsdUxjPmCFWZg';

// Disable Mapbox telemetry to avoid ad blocker issues
(mapboxgl as any).prewarm = () => {};
(mapboxgl as any).clearPrewarmedResources = () => {};

interface IndiaHeatmapMapboxProps {
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
  const normalized = max > min ? (value - min) / (max - min) : 0.5;
  
  // Use primary color scale (light to dark) matching theme
  const colors = [
    'hsl(200, 98%, 85%)', 'hsl(200, 98%, 75%)', 'hsl(200, 98%, 65%)', 'hsl(200, 98%, 55%)', 
    'hsl(200, 98%, 45%)', 'hsl(200, 98%, 39%)', 'hsl(200, 98%, 35%)', 'hsl(200, 98%, 30%)', 'hsl(200, 98%, 25%)'
  ];

  const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
  return colors[index];
};

// GeoJSON property name for state names
const STATE_NAME_PROPERTY = 'NAME_1';

// State name mapping: Database name -> GeoJSON name
const STATE_NAME_MAPPING: { [key: string]: string } = {
  'Odisha': 'Orissa',
  'Pondicherry': 'Puducherry',
  // Add more mappings if needed
};

// Reverse mapping: GeoJSON name -> Database name
const REVERSE_STATE_MAPPING: { [key: string]: string } = Object.entries(STATE_NAME_MAPPING).reduce(
  (acc, [dbName, geoName]) => ({ ...acc, [geoName]: dbName }),
  {} as { [key: string]: string }
);

export const IndiaHeatmapMapbox: React.FC<IndiaHeatmapMapboxProps> = ({
  stateValueMap,
  stats,
  onStateClick,
  selectedIndicator,
  selectedYear,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoDataLoaded, setGeoDataLoaded] = useState(false);

  const defaultStats = stats || { min: 0, max: 1, mean: 0.5, count: 0 };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 22.5937], // Center of India
      zoom: 4,
      minZoom: 3,
      maxZoom: 8,
    });

    map.current.on('load', async () => {
      setMapLoaded(true);
      
      // Load GeoJSON data dynamically
      try {
        // Use absolute path from public directory or import.meta.url
        const response = await fetch(new URL('../../data/india-states.geojson', import.meta.url).href);
        const indiaStatesGeoJSON = await response.json();
        
        // Add India states source
        if (map.current) {
          map.current.addSource('india-states', {
            type: 'geojson',
            data: indiaStatesGeoJSON
          });
          
          setGeoDataLoaded(true);

          // Add fill layer
          map.current.addLayer({
            id: 'states-fill',
            type: 'fill',
            source: 'india-states',
            paint: {
              'fill-color': 'hsl(200, 98%, 39%)',
              'fill-opacity': 0.7
            }
          });

          // Add border layer
          map.current.addLayer({
            id: 'states-border',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#ffffff',
              'line-width': 1.5
            }
          });

          // Add state labels
          map.current.addLayer({
            id: 'state-labels',
            type: 'symbol',
            source: 'india-states',
            layout: {
              'text-field': ['get', STATE_NAME_PROPERTY],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-anchor': 'center'
            },
            paint: {
              'text-color': '#1f2937',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-halo-blur': 1
            }
          });

          // Add hover effect
          map.current.on('mousemove', 'states-fill', (e) => {
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
            }
          });

          map.current.on('mouseleave', 'states-fill', () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = '';
            }
          });

          // Add click handler
          map.current.on('click', 'states-fill', (e) => {
            if (e.features && e.features[0]) {
              const geoStateName = e.features[0].properties?.[STATE_NAME_PROPERTY];
              // Convert GeoJSON name to database name for click handler
              const dbStateName = REVERSE_STATE_MAPPING[geoStateName] || geoStateName;
              if (dbStateName) {
                onStateClick(dbStateName);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update colors when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !geoDataLoaded) return;

    // Create color expression for Mapbox
    const colorExpression: any = ['match', ['get', STATE_NAME_PROPERTY]];
    
    Object.keys(stateValueMap).forEach(dbStateName => {
      const value = stateValueMap[dbStateName];
      const color = getColor(value, defaultStats.min, defaultStats.max);
      
      // Use GeoJSON name (with mapping if needed)
      const geoStateName = STATE_NAME_MAPPING[dbStateName] || dbStateName;
      colorExpression.push(geoStateName, color);
    });
    
    // Default color for states without data
    colorExpression.push('#e5e7eb');

    map.current.setPaintProperty('states-fill', 'fill-color', colorExpression);

    // Update popup on hover
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    const handleMouseMove = (e: any) => {
      if (e.features && e.features[0]) {
        const geoStateName = e.features[0].properties?.[STATE_NAME_PROPERTY];
        // Convert GeoJSON name to database name
        const dbStateName = REVERSE_STATE_MAPPING[geoStateName] || geoStateName;
        const value = stateValueMap[dbStateName];
        
        const html = `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${dbStateName}</div>
            ${selectedIndicator ? `<div style="font-size: 12px; color: #666;">${selectedIndicator.name}</div>` : ''}
            ${selectedYear ? `<div style="font-size: 12px; color: #666;">Year: ${selectedYear}</div>` : ''}
            <div style="margin-top: 4px; font-weight: 500;">
              ${value !== null && value !== undefined 
                ? `${value.toFixed(2)} ${selectedIndicator?.unit || ''}` 
                : 'No data'}
            </div>
          </div>
        `;
        
        popup.setLngLat(e.lngLat).setHTML(html).addTo(map.current!);
      }
    };

    const handleMouseLeave = () => {
      popup.remove();
    };

    if (map.current) {
      map.current.on('mousemove', 'states-fill', handleMouseMove);
      map.current.on('mouseleave', 'states-fill', handleMouseLeave);
    }

    return () => {
      if (map.current) {
        map.current.off('mousemove', 'states-fill', handleMouseMove);
        map.current.off('mouseleave', 'states-fill', handleMouseLeave);
      }
      popup.remove();
    };
  }, [stateValueMap, stats, selectedIndicator, selectedYear, mapLoaded, geoDataLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg shadow-xl p-3">
        <div className="text-sm font-semibold mb-2 text-foreground">Legend</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground">Low</span>
          <div className="flex gap-0.5">
            {[
              'hsl(200, 98%, 85%)', 'hsl(200, 98%, 75%)', 'hsl(200, 98%, 65%)', 'hsl(200, 98%, 55%)', 
              'hsl(200, 98%, 45%)', 'hsl(200, 98%, 39%)', 'hsl(200, 98%, 35%)', 'hsl(200, 98%, 30%)', 'hsl(200, 98%, 25%)'
            ].map((color, i) => (
              <div
                key={i}
                className="w-4 h-3 border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground">High</span>
        </div>
        {stats && (
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-2 rounded">
            <div>Min: <span className="font-semibold text-foreground">{stats.min.toFixed(2)}</span></div>
            <div>Max: <span className="font-semibold text-foreground">{stats.max.toFixed(2)}</span></div>
            <div>States: <span className="font-semibold text-foreground">{stats.count}</span></div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {(!mapLoaded || !geoDataLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              {!mapLoaded ? 'Initializing map...' : 'Loading India boundaries...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
