import { useState, useEffect } from 'react';

export interface StateFeature {
  type: 'Feature';
  properties: {
    name: string;
    code: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface IndiaGeoJSON {
  type: 'FeatureCollection';
  features: StateFeature[];
}

export const useIndiaStatesGeo = () => {
  const [geoData, setGeoData] = useState<IndiaGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGeoData();
  }, []);

  const fetchGeoData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/geo/india_states.geojson');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
      }

      const data: IndiaGeoJSON = await response.json();
      setGeoData(data);
    } catch (err) {
      console.error('Error fetching India states GeoJSON:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch geographic data');
    } finally {
      setLoading(false);
    }
  };

  return {
    geoData,
    loading,
    error,
    refetch: fetchGeoData,
  };
};
