import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { StateAumComposition } from '@/hooks/useStateAumData';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc2huYXYxMjM0IiwiYSI6ImNtZzZ3MGhqbDBmeXEyaXNkcDl1eXViemwifQ.Rx_NZ--KlzsdUxjPmCFWZg';

// Disable Mapbox telemetry
(mapboxgl as any).prewarm = () => {};
(mapboxgl as any).clearPrewarmedResources = () => {};

interface StateAumMapProps {
  data: StateAumComposition[];
  monthYear: string;
  viewMode: 'overall' | 'liquid' | 'debt' | 'equity' | 'etfs';
}

// Orange color scale function
const getOrangeColor = (value: number | null, min: number, max: number): string => {
  if (value === null || value === undefined) {
    return '#e5e7eb'; // Gray for no data
  }

  // Normalize value to 0-1 range
  const normalized = max > min ? (value - min) / (max - min) : 0.5;
  
  // Orange color scale (light to dark)
  const colors = [
    'hsl(25, 95%, 85%)', // Very light orange
    'hsl(25, 95%, 75%)', // Light orange
    'hsl(25, 95%, 65%)', // Light-medium orange
    'hsl(25, 95%, 55%)', // Medium orange
    'hsl(25, 95%, 45%)', // Medium-dark orange
    'hsl(25, 95%, 39%)', // Dark orange
    'hsl(25, 95%, 30%)', // Darker orange
    'hsl(25, 95%, 25%)', // Very dark orange
    'hsl(25, 95%, 20%)'  // Darkest orange
  ];

  const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
  return colors[index];
};

// GeoJSON property name for state names
const STATE_NAME_PROPERTY = 'NAME_1';

// State name mapping: Database name -> GeoJSON name
const STATE_NAME_MAPPING: { [key: string]: string } = {
  'New Delhi': 'Delhi',
  'Orissa': 'Odisha',
  'Pondicherry': 'Puducherry',
  'Uttaranchal': 'Uttarakhand',
};

// Reverse mapping: GeoJSON name -> Database name
const REVERSE_STATE_MAPPING: { [key: string]: string } = Object.entries(STATE_NAME_MAPPING).reduce(
  (acc, [dbName, geoName]) => ({ ...acc, [geoName]: dbName }),
  {} as { [key: string]: string }
);

export const StateAumMap: React.FC<StateAumMapProps> = ({ data, monthYear, viewMode }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoDataLoaded, setGeoDataLoaded] = useState(false);

  // Create state value map based on view mode
  const stateValueMap: { [key: string]: number } = {};
  data.forEach(state => {
    let value: number | null = null;
    switch (viewMode) {
      case 'overall':
        value = state.industry_share_percentage;
        break;
      case 'liquid':
        value = state.liquid_money_market_percentage;
        break;
      case 'debt':
        value = state.debt_oriented_percentage;
        break;
      case 'equity':
        value = state.equity_oriented_percentage;
        break;
      case 'etfs':
        value = state.etfs_fofs_percentage;
        break;
    }
    if (value !== null) {
      stateValueMap[state.state_name] = value;
    }
  });

  // Calculate stats
  const values = Object.values(stateValueMap).filter(v => v !== null && v !== undefined);
  const stats = values.length > 0 ? {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    count: values.length
  } : null;

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
      
      // Load GeoJSON data
      try {
        const response = await fetch(new URL('../../data/india-states.geojson', import.meta.url).href);
        const indiaStatesGeoJSON = await response.json();
        
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
              'fill-color': 'hsl(25, 95%, 39%)',
              'fill-opacity': 0.8
            }
          });

          // Add border layer with BLACK color
          map.current.addLayer({
            id: 'states-border',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#000000', // BLACK borders
              'line-width': 2
            }
          });

          // Add state labels - positioned at label points for better placement
          map.current.addLayer({
            id: 'state-labels',
            type: 'symbol',
            source: 'india-states',
            layout: {
              'text-field': ['get', STATE_NAME_PROPERTY],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 13,
              'text-anchor': 'center',
              'text-offset': [0, 0],
              'text-allow-overlap': false,
              'text-ignore-placement': false,
              'symbol-placement': 'point',
              'text-max-width': 10
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 2.5,
              'text-halo-blur': 0.5,
              'text-opacity': 1
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
      const color = getOrangeColor(value, defaultStats.min, defaultStats.max);
      
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

    const getViewModeLabel = () => {
      switch (viewMode) {
        case 'overall': return 'Overall AUM';
        case 'liquid': return 'Liquid/Money Market';
        case 'debt': return 'Debt Oriented';
        case 'equity': return 'Equity Oriented';
        case 'etfs': return 'ETFs/FoFs';
        default: return 'AUM';
      }
    };

    const handleMouseMove = (e: any) => {
      if (e.features && e.features[0]) {
        const geoStateName = e.features[0].properties?.[STATE_NAME_PROPERTY];
        const dbStateName = REVERSE_STATE_MAPPING[geoStateName] || geoStateName;
        const value = stateValueMap[dbStateName];
        
        const stateData = data.find(s => s.state_name === dbStateName);
        
        let html = `
          <div style="padding: 10px; min-width: 200px;">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">${dbStateName}</div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Month: ${monthYear}</div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
        `;
        
        if (stateData) {
          html += `<div style="font-size: 14px; font-weight: 600; color: hsl(25, 95%, 39%); margin-bottom: 6px;">
            ${getViewModeLabel()}: ${value?.toFixed(2)}%
          </div>`;
          
          if (viewMode === 'overall') {
            html += `<div style="font-size: 11px; color: #6b7280; margin-top: 6px; border-top: 1px solid #f3f4f6; padding-top: 6px;">
              <div style="margin-bottom: 2px;">• Liquid/Money: ${stateData.liquid_money_market_percentage?.toFixed(1)}%</div>
              <div style="margin-bottom: 2px;">• Debt Oriented: ${stateData.debt_oriented_percentage?.toFixed(1)}%</div>
              <div style="margin-bottom: 2px;">• Equity Oriented: ${stateData.equity_oriented_percentage?.toFixed(1)}%</div>
              <div>• ETFs/FoFs: ${stateData.etfs_fofs_percentage?.toFixed(1)}%</div>
            </div>`;
          }
        } else {
          html += `<div style="font-size: 12px; color: #9ca3af;">No data available</div>`;
        }
        
        html += `</div></div>`;
        
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
  }, [stateValueMap, stats, monthYear, viewMode, mapLoaded, geoDataLoaded, data]);

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
              'hsl(25, 95%, 85%)', 'hsl(25, 95%, 75%)', 'hsl(25, 95%, 65%)', 'hsl(25, 95%, 55%)', 
              'hsl(25, 95%, 45%)', 'hsl(25, 95%, 39%)', 'hsl(25, 95%, 30%)', 'hsl(25, 95%, 25%)', 'hsl(25, 95%, 20%)'
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
            <div>Min: <span className="font-semibold text-foreground">{stats.min.toFixed(2)}%</span></div>
            <div>Max: <span className="font-semibold text-foreground">{stats.max.toFixed(2)}%</span></div>
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
