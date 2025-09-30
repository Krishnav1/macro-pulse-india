# Mapbox Heat Map Setup Guide

## ✅ Installation Complete

Mapbox GL JS has been installed and configured with your token:
```
pk.eyJ1Ijoia3Jpc2huYXYxMjM0IiwiYSI6ImNtZzZ3MGhqbDBmeXEyaXNkcDl1eXViemwifQ.Rx_NZ--KlzsdUxjPmCFWZg
```

## 📍 Getting Actual India State GeoJSON Data

### Option 1: Use DataMeet India GeoJSON (Recommended)

1. Download India states GeoJSON from:
   ```
   https://github.com/datameet/maps/blob/master/States/india_state.geojson
   ```

2. Save it to: `src/data/india-states.geojson`

3. Update the import in `IndiaHeatmapMapbox.tsx`:
   ```typescript
   import indiaStatesGeoJSON from '../../data/india-states.geojson';
   ```

### Option 2: Use Mapbox Tilesets (Best Performance)

1. Go to Mapbox Studio: https://studio.mapbox.com/
2. Click "Tilesets" → "New tileset"
3. Upload the India GeoJSON file
4. Get the tileset ID (e.g., `krishnav1234.india-states`)
5. Update the code to use the tileset:

```typescript
map.current.addSource('india-states', {
  type: 'vector',
  url: 'mapbox://krishnav1234.india-states' // Your tileset ID
});

map.current.addLayer({
  id: 'states-fill',
  type: 'fill',
  source: 'india-states',
  'source-layer': 'india_state', // Layer name from tileset
  paint: {
    'fill-color': '#e5e7eb',
    'fill-opacity': 0.8
  }
});
```

### Option 3: Use Public Mapbox Dataset

Use this public India boundaries tileset:
```
mapbox://mapbox.country-boundaries-v1
```

Filter for India:
```typescript
filter: ['==', ['get', 'iso_3166_1'], 'IN']
```

## 🗺️ State Name Mapping

Make sure your database state names match the GeoJSON property names. Common variations:

| Database Name | GeoJSON Name |
|--------------|--------------|
| Andhra Pradesh | Andhra Pradesh |
| Tamil Nadu | Tamil Nadu |
| Telangana | Telangana |
| Karnataka | Karnataka |
| Kerala | Kerala |
| Maharashtra | Maharashtra |
| Gujarat | Gujarat |

## 🎨 Customization

### Change Map Style
In `IndiaHeatmapMapbox.tsx`, line 130:
```typescript
style: 'mapbox://styles/mapbox/light-v11'
```

Available styles:
- `mapbox://styles/mapbox/streets-v12`
- `mapbox://styles/mapbox/outdoors-v12`
- `mapbox://styles/mapbox/light-v11`
- `mapbox://styles/mapbox/dark-v11`
- `mapbox://styles/mapbox/satellite-v9`

### Adjust Colors
Modify the `colors` array in the `getColor` function (line 29-32)

### Change Initial View
Modify center and zoom (line 132-133):
```typescript
center: [78.9629, 22.5937], // [longitude, latitude]
zoom: 4,
```

## 🔧 Troubleshooting

### Map not showing?
1. Check browser console for errors
2. Verify token is correct
3. Check network tab for failed requests
4. Ensure container has height (already set to `h-full`)

### States not coloring?
1. Verify state names match between database and GeoJSON
2. Check console for the `stateValueMap` object
3. Ensure GeoJSON has a `name` or `ST_NM` property

### Performance issues?
1. Use vector tilesets instead of GeoJSON
2. Simplify GeoJSON geometry
3. Reduce zoom levels

## 📚 Resources

- Mapbox GL JS Docs: https://docs.mapbox.com/mapbox-gl-js/
- India GeoJSON: https://github.com/datameet/maps
- Mapbox Studio: https://studio.mapbox.com/
- Examples: https://docs.mapbox.com/mapbox-gl-js/example/

## 🚀 Next Steps

1. Download actual India GeoJSON data
2. Replace the simplified coordinates in `IndiaHeatmapMapbox.tsx`
3. Test with your heatmap data
4. Customize colors and styles as needed
