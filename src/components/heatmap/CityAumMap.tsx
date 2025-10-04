import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CityAumData } from '@/hooks/useCityAumData';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoia3Jpc2huYXYxMjM0IiwiYSI6ImNtZzZ3MGhqbDBmeXEyaXNkcDl1eXViemwifQ.Rx_NZ--KlzsdUxjPmCFWZg';

// Disable Mapbox telemetry
(mapboxgl as any).prewarm = () => {};
(mapboxgl as any).clearPrewarmedResources = () => {};

interface CityAumMapProps {
  data: CityAumData[];
  quarterEndDate: string;
}

export const CityAumMap: React.FC<CityAumMapProps> = ({ data, quarterEndDate }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Calculate marker size based on AUM percentage
  const getMarkerSize = (aumPercentage: number, maxAum: number): number => {
    const minSize = 20;
    const maxSize = 80;
    const normalized = aumPercentage / maxAum;
    return minSize + (maxSize - minSize) * normalized;
  };

  // Get color based on AUM percentage
  const getMarkerColor = (aumPercentage: number, maxAum: number): string => {
    const normalized = aumPercentage / maxAum;
    
    if (normalized > 0.7) return 'hsl(200, 98%, 39%)'; // Primary blue
    if (normalized > 0.4) return 'hsl(200, 98%, 55%)'; // Medium blue
    if (normalized > 0.2) return 'hsl(200, 98%, 70%)'; // Light blue
    return 'hsl(200, 98%, 85%)'; // Very light blue
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 22.5937], // Center of India
      zoom: 4,
      minZoom: 3,
      maxZoom: 10,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || data.length === 0) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter data with valid coordinates
    const validData = data.filter(city => city.latitude && city.longitude);
    if (validData.length === 0) return;

    const maxAum = Math.max(...validData.map(city => city.aum_percentage));

    // Add new markers
    validData.forEach(city => {
      if (!city.latitude || !city.longitude) return;

      const size = getMarkerSize(city.aum_percentage, maxAum);
      const color = getMarkerColor(city.aum_percentage, maxAum);

      // Create marker element
      const el = document.createElement('div');
      el.className = 'city-aum-marker';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.transition = 'transform 0.2s';
      
      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 8px; min-width: 150px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1f2937;">
            ${city.city_name}
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
            Quarter: ${quarterEndDate}
          </div>
          <div style="font-size: 16px; font-weight: 700; color: hsl(200, 98%, 39%);">
            ${city.aum_percentage.toFixed(2)}%
          </div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">
            of Total AUM
          </div>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([city.longitude, city.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (validData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validData.forEach(city => {
        if (city.latitude && city.longitude) {
          bounds.extend([city.longitude, city.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 6 });
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [data, mapLoaded, quarterEndDate]);

  // Calculate stats
  const totalCities = data.filter(c => c.latitude && c.longitude).length;
  const topCity = data.length > 0 ? data[0] : null;
  const totalAumPercentage = data.reduce((sum, city) => sum + city.aum_percentage, 0);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg shadow-xl p-3 max-w-xs">
        <div className="text-sm font-semibold mb-2 text-foreground">City AUM Distribution</div>
        
        {/* Size Legend */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Marker Size = AUM %</div>
          <div className="flex items-center gap-2">
            <div 
              className="rounded-full border-2 border-white" 
              style={{ width: '20px', height: '20px', backgroundColor: 'hsl(200, 98%, 85%)' }}
            />
            <span className="text-xs text-muted-foreground">Low</span>
            <div 
              className="rounded-full border-2 border-white" 
              style={{ width: '40px', height: '40px', backgroundColor: 'hsl(200, 98%, 55%)' }}
            />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>

        {/* Stats */}
        {data.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-2 rounded">
            <div>
              <span className="font-semibold text-foreground">{totalCities}</span> cities mapped
            </div>
            {topCity && (
              <div>
                Top: <span className="font-semibold text-foreground">{topCity.city_name}</span> ({topCity.aum_percentage.toFixed(2)}%)
              </div>
            )}
            <div>
              Total: <span className="font-semibold text-foreground">{totalAumPercentage.toFixed(2)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading city map...</p>
          </div>
        </div>
      )}

      {/* No data message */}
      {mapLoaded && data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No city data available for this quarter</p>
          </div>
        </div>
      )}
    </div>
  );
};
