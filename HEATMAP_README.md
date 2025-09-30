# India Heat Map Feature

## Overview
The India Heat Map is a comprehensive state-wise visualization system that allows users to explore economic and social indicators across Indian states and union territories through an interactive choropleth map.

## Features

### 🗺️ Interactive Map
- **Leaflet-based choropleth map** with OpenStreetMap tiles
- **State-wise coloring** based on indicator values
- **Hover tooltips** showing state name, indicator value, and unit
- **Click interactions** to view detailed state information
- **Responsive design** that works on desktop and mobile

### 📊 Data Controls
- **Indicator Selection**: Choose from uploaded economic/social indicators
- **Year Selection**: Navigate through available years of data
- **Time Animation**: Play through years with adjustable speed
- **Year Slider**: Quick navigation between years

### 🎨 Visual Features
- **Color-blind safe palettes** using blues scale
- **Dynamic legend** with value ranges and statistics
- **Missing data handling** with gray coloring
- **Statistics panel** showing min, max, average, and data coverage

### 📱 State Details Drawer
- **Comprehensive state view** when clicking on any state
- **All indicators** available for the selected state
- **Historical data** with trend analysis
- **Sparkline charts** for quick trend visualization
- **Data sources** and metadata

## Database Schema

### Tables
1. **heatmap_indicators**
   - `id`: UUID primary key
   - `slug`: Unique identifier (e.g., 'gdp_growth_rate')
   - `name`: Display name (e.g., 'GDP Growth Rate')
   - `unit`: Unit of measurement (e.g., '%', 'INR')
   - `description`: Optional description
   - `category`: Optional category grouping

2. **heatmap_values**
   - `id`: UUID primary key
   - `indicator_id`: Foreign key to heatmap_indicators
   - `state_name`: Full state name (e.g., 'Maharashtra')
   - `year_label`: Fiscal year format (e.g., '2023-24')
   - `value`: Numeric value
   - `source`: Data source information
   - `dataset_id`: Optional foreign key for tracking uploads

3. **heatmap_datasets**
   - `id`: UUID primary key
   - `name`: Dataset name
   - `uploaded_by`: User who uploaded
   - `uploaded_at`: Upload timestamp
   - `notes`: Optional notes

## Admin Panel

### Upload Process
1. **Navigate to Admin**: `/admin` → Heatmap Data tab
2. **Download Template**: Get the CSV/Excel template
3. **Prepare Data**: Fill template with your data
4. **Upload File**: Select and upload your Excel/CSV file
5. **Preview & Validate**: Review parsed data and indicators
6. **Confirm Upload**: Submit to database

### Data Format
The upload expects a wide format with columns:
- `Year`: Fiscal year (e.g., '2023-24')
- `State Name`: Full state name
- `Indicator 1 [Unit]`: First indicator with unit in brackets
- `Indicator 2 [Unit]`: Second indicator with unit in brackets
- ... (additional indicators as needed)

### Example Row
```csv
Year,State Name,GDP Growth Rate [%],Per Capita Income [INR],Unemployment Rate [%]
2023-24,Maharashtra,8.4,195000,2.2
```

## State Name Mapping
The system handles common state name variations:
- **Odisha** / Orissa
- **Puducherry** / Pondicherry
- **Telangana** (separate from Andhra Pradesh)
- **Ladakh** (separate from Jammu and Kashmir)
- **Delhi** / NCT of Delhi
- **Dadra and Nagar Haveli and Daman and Diu** (merged UT)

## URL Sharing
The heatmap supports shareable URLs with query parameters:
- `/india-heat-map?indicator=gdp_growth_rate&year=2023-24`

## Technical Implementation

### Components
- **IndiaHeatmapMap**: Leaflet map with choropleth layer
- **HeatmapControls**: Indicator/year selection and animation
- **HeatmapLegend**: Color scale and statistics
- **StateDetailsDrawer**: Detailed state information panel
- **HeatmapAdmin**: Admin upload interface

### Hooks
- **useHeatmapIndicators**: Fetch available indicators
- **useHeatmapYears**: Fetch years for selected indicator
- **useHeatmapValues**: Fetch values for indicator/year combination
- **useIndiaStatesGeo**: Load India states GeoJSON

### Color Scheme
Uses a 9-step blue color scale from light to dark:
- Light values: `#eff6ff` (very light blue)
- Dark values: `#1e40af` (darkest blue)
- No data: `#e5e7eb` (gray)

## Performance Optimizations
- **GeoJSON caching** for map geometry
- **Memoized color calculations** for large datasets
- **Debounced interactions** for smooth user experience
- **Lazy loading** of components
- **Efficient database queries** with proper indexing

## Accessibility Features
- **Keyboard navigation** support
- **Screen reader compatibility**
- **High contrast** color schemes
- **Alternative text** for visual elements
- **Focus management** in interactive elements

## Browser Support
- **Modern browsers** with ES6+ support
- **Mobile responsive** design
- **Touch interactions** for mobile devices
- **Progressive enhancement** for older browsers

## Data Sources
The heatmap is designed to work with various data sources:
- **Government statistics** (Census, Economic Survey)
- **RBI data** (state-wise economic indicators)
- **Ministry reports** (sectoral data)
- **Academic research** (custom indicators)

## Future Enhancements
- **District-level mapping** with detailed GeoJSON
- **Time-series charts** in state details
- **Data export** functionality
- **Custom color schemes** per indicator
- **Comparison mode** between states
- **Animated transitions** between years
- **Data validation** rules in admin
- **Bulk data operations**

## Troubleshooting

### Common Issues
1. **Map not loading**: Check GeoJSON file path and format
2. **No data showing**: Verify database connections and sample data
3. **Upload failing**: Check Excel format and column headers
4. **Performance issues**: Review data volume and browser memory

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify database table structure and data
3. Test with sample data first
4. Check network requests in browser dev tools

## Dependencies
- **leaflet**: Interactive map library
- **@types/leaflet**: TypeScript definitions
- **xlsx**: Excel file parsing
- **react-router-dom**: URL routing
- **@tanstack/react-query**: Data fetching
- **supabase**: Database and authentication

## Installation
```bash
npm install leaflet @types/leaflet xlsx
```

## Getting Started
1. Ensure database tables are created (automatic via migration)
2. Upload sample data via admin panel
3. Navigate to `/india-heat-map`
4. Select an indicator and year to view the map
5. Click on states to explore detailed information

The India Heat Map provides a powerful, user-friendly way to visualize and explore state-wise data across India, making complex datasets accessible through interactive geographic visualization.
