# State-wise AUM Allocation Implementation

## ✅ Implementation Complete

### **Database Structure**

**Tables Created via Supabase MCP:**

1. **`state_aum_allocation`** - State-wise AUM composition data
   - `id` (UUID, primary key)
   - `month_year` (DATE) - Format: YYYY-MM-DD (e.g., '2025-07-01')
   - `state_name` (TEXT)
   - `industry_share_percentage` (NUMERIC) - Overall AUM %
   - `liquid_money_market_percentage` (NUMERIC) - Liquid/Money Market %
   - `debt_oriented_percentage` (NUMERIC) - Debt Oriented %
   - `equity_oriented_percentage` (NUMERIC) - Equity Oriented %
   - `etfs_fofs_percentage` (NUMERIC) - ETFs/FoFs %
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   - **UNIQUE constraint:** (month_year, state_name)

2. **`state_aum_category_values`** - Category-wise rankings
   - `id` (UUID, primary key)
   - `month_year` (DATE)
   - `state_name` (TEXT)
   - `category` (TEXT) - 'Liquid/Money Market', 'Debt Oriented', etc.
   - `aum_crores` (NUMERIC) - Absolute value in crores
   - `rank` (INTEGER) - Ranking within category
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   - **UNIQUE constraint:** (month_year, state_name, category)

3. **`state_aum_uploads`** - Upload tracking
   - `id` (UUID, primary key)
   - `month_year` (DATE)
   - `total_states` (INTEGER)
   - `upload_type` (TEXT) - 'composition' or 'category'
   - `uploaded_at` (TIMESTAMPTZ)
   - `uploaded_by` (TEXT)

**RLS Policies:** Public read, authenticated write

---

### **CSV Templates**

**Template 1: State AUM Composition** (`state_aum_composition_template.csv`)
```csv
Month Year: 2025-07-01
State,Industry Share (%),Liquid/Money Market (%),Debt Oriented (%),Equity Oriented (%),ETFs/FoFs (%)
Maharashtra,40.6,43,56,71,69
New Delhi,8.2,15,24,15,16
Gujarat,7,18,17,10,16
...
```

**Template 2: Category Rankings** (`state_aum_category_template.csv`)
```csv
Month Year: 2025-07-01
Category,State,AuM (Rs. Crores),Rank
Liquid/Money Market,Maharashtra,572771,1
Liquid/Money Market,New Delhi,105686,2
Debt Oriented,Maharashtra,454940,1
...
```

---

### **Components Created**

1. **`StateAumMap.tsx`** - Orange choropleth map
   - Mapbox GL JS with dark theme
   - Orange color gradient (9 levels)
   - Black state borders (2px)
   - White state labels with black halo
   - Interactive popups with category breakdown
   - Conditional rendering based on view mode

2. **`StateAumUpload.tsx`** - Admin upload interface
   - Tabbed interface (Composition / Category)
   - CSV parsing and validation
   - Month-specific data replacement
   - Preview before upload
   - Download template buttons

3. **`useStateAumData.ts`** - Data hooks
   - `useStateAumMonths()` - Fetch available months
   - `useStateAumComposition(monthYear)` - Fetch composition data
   - `useStateAumCategories(monthYear, category)` - Fetch category data

---

### **Map Features**

**Orange Color Palette:**
```javascript
'hsl(25, 95%, 85%)' // Very light orange (0-5% AUM)
'hsl(25, 95%, 75%)' // Light orange
'hsl(25, 95%, 65%)' // Light-medium orange
'hsl(25, 95%, 55%)' // Medium orange
'hsl(25, 95%, 45%)' // Medium-dark orange
'hsl(25, 95%, 39%)' // Dark orange (primary)
'hsl(25, 95%, 30%)' // Darker orange
'hsl(25, 95%, 25%)' // Very dark orange
'hsl(25, 95%, 20%)' // Darkest orange (40%+ AUM)
```

**Visual Design:**
- **Map Style:** `mapbox://styles/mapbox/dark-v11`
- **State Fill:** Orange gradient based on AUM %
- **State Borders:** Black (#000000), 2px width
- **State Labels:** White text, black halo (2px), 12px font
- **Legend:** Orange gradient bar with min/max values
- **Background:** Dark theme matching website

**State Name Mapping:**
- New Delhi → Delhi
- Orissa → Odisha
- Pondicherry → Puducherry
- Uttaranchal → Uttarakhand

---

### **UI/UX Implementation**

**Tab Structure:**
```
┌─────────────────────────────────────────────┐
│ [State Indicators] [City AUM] [State AUM]  │
└─────────────────────────────────────────────┘
```

**State AUM Tab Layout:**
- **Left Sidebar (25%):**
  - Month/Year dropdown
  - Category radio buttons:
    - ○ Overall AUM %
    - ○ Liquid/Money Market
    - ○ Debt Oriented
    - ○ Equity Oriented
    - ○ ETFs/FoFs
  - Summary statistics

- **Right Map Area (75%):**
  - Orange choropleth map
  - State labels only (no city clutter)
  - Black borders for clear distinction
  - Interactive hover tooltips
  - Legend with color scale

**Popup Content:**
```
┌─────────────────────────────┐
│  Maharashtra                │
│  Month: July 2025           │
│  ─────────────────────────  │
│  Overall AUM: 40.6%         │
│  ─────────────────────────  │
│  Category Breakdown:        │
│  • Liquid/Money: 43%        │
│  • Debt Oriented: 56%       │
│  • Equity Oriented: 71%     │
│  • ETFs/FoFs: 69%           │
└─────────────────────────────┘
```

---

### **Label Display Logic**

**Conditional Rendering:**
| Tab | State Labels | City Labels | Border Color |
|-----|--------------|-------------|--------------|
| State Indicators | ✅ Show | ❌ Hide | White (1.5px) |
| City AUM | ❌ Hide | ✅ Show | N/A |
| **State AUM** | **✅ Show** | **❌ Hide** | **Black (2px)** |

---

### **Data Management**

**Month-Specific Replacement:**
- Each month is independent
- Uploading July 2025 doesn't affect June 2025
- Re-uploading July 2025 replaces only July 2025 data
- All other months remain intact

**Upload Process:**
1. Parse CSV file
2. Extract month_year from first row
3. Validate data format
4. Check for existing month data
5. Delete existing month data (if any)
6. Wait 1 second for deletion
7. Insert new records
8. Log upload to tracking table
9. Show success message

---

### **Admin Panel Integration**

**Location:** `/admin` → Heatmap Data → State-wise AUM Data Upload

**Features:**
- Two tabs: Composition / Category Rankings
- Template download buttons
- CSV file upload
- Real-time validation
- Preview before upload
- Month-specific replacement
- Success/error notifications

---

### **Files Created**

1. `/src/components/heatmap/StateAumMap.tsx` - Map component
2. `/src/components/admin/heatmap/StateAumUpload.tsx` - Upload interface
3. `/src/hooks/useStateAumData.ts` - Data hooks
4. `/public/templates/state_aum_composition_template.csv` - Template 1
5. `/public/templates/state_aum_category_template.csv` - Template 2
6. `STATE_AUM_IMPLEMENTATION.md` - This documentation

**Files Modified:**
1. `/src/pages/india-heat-map/index.tsx` - Added State AUM tab
2. `/src/components/admin/heatmap/HeatmapAdminNew.tsx` - Added upload section

---

### **Key Differences from Other Views**

| Feature | State Indicators | City AUM | **State AUM** |
|---------|-----------------|----------|---------------|
| **Data Source** | `heatmap_values` | `city_aum_allocation` | **`state_aum_allocation`** |
| **Time Period** | Yearly | Quarterly | **Monthly** |
| **Visualization** | Blue choropleth | Markers | **Orange choropleth** |
| **Color Scheme** | Blue gradient | Blue markers | **Orange gradient** |
| **Border Color** | White (1.5px) | N/A | **Black (2px)** |
| **Labels** | State names | City names | **State names only** |
| **Categories** | Multiple indicators | Single (AUM %) | **5 categories** |
| **Selector** | Indicator + Year | Quarter | **Month + Category** |

---

### **Usage Instructions**

**Admin (Upload Data):**
1. Navigate to `/admin`
2. Click "Heatmap Data" section
3. Scroll to "State-wise AUM Data Upload"
4. Choose tab: Composition or Category Rankings
5. Download appropriate template
6. Fill in data with month/year in first row
7. Upload CSV file
8. Review preview
9. Click "Upload" button
10. Confirm success message

**User (View Map):**
1. Navigate to `/india-heat-map`
2. Click "State AUM" tab
3. Select month from dropdown
4. Choose category (Overall/Liquid/Debt/Equity/ETFs)
5. View orange choropleth map
6. Hover over states for details
7. Click states for detailed popup
8. Review summary statistics in sidebar

---

### **Technical Implementation**

**TypeScript Types:**
```typescript
interface StateAumComposition {
  id: string;
  month_year: string;
  state_name: string;
  industry_share_percentage: number;
  liquid_money_market_percentage: number | null;
  debt_oriented_percentage: number | null;
  equity_oriented_percentage: number | null;
  etfs_fofs_percentage: number | null;
}

type ViewMode = 'overall' | 'liquid' | 'debt' | 'equity' | 'etfs';
```

**State Management:**
- `selectedMonth` - Selected month/year
- `stateAumViewMode` - Selected category
- `stateAumData` - Fetched composition data
- `stateAumLoading` - Loading state

**Performance:**
- Efficient color calculation
- Memoized map updates
- Conditional rendering
- Lazy loading of GeoJSON
- Optimized popup rendering

---

### **Testing Checklist**

- ✅ Database tables created
- ✅ CSV templates generated
- ✅ Upload component working
- ✅ Data hooks fetching correctly
- ✅ Map rendering with orange colors
- ✅ Black borders visible
- ✅ State labels showing (white with black halo)
- ✅ Category selector working
- ✅ Month selector working
- ✅ Popup showing correct data
- ✅ Legend displaying properly
- ✅ Summary stats calculating
- ✅ Month-specific replacement working
- ✅ Tab switching smooth
- ✅ Loading states working
- ✅ Error handling in place
- ✅ Mobile responsive

---

### **Known Limitations**

1. **TypeScript Types:** Supabase types need regeneration (using `as any` workaround)
2. **State Name Mapping:** Some states may need additional mappings
3. **Data Validation:** CSV format must be exact
4. **Browser Support:** Requires WebGL for Mapbox

---

### **Success Metrics**

**Visual Design:**
- ✅ Orange color scheme distinct from blue state indicators
- ✅ Black borders provide clear state boundaries
- ✅ State labels visible and readable
- ✅ Professional, clean appearance
- ✅ Matches reference image design

**Functionality:**
- ✅ Month-based data management
- ✅ 5 category views
- ✅ Interactive tooltips
- ✅ Smooth tab switching
- ✅ Fast data loading

**User Experience:**
- ✅ Intuitive navigation
- ✅ Clear visual hierarchy
- ✅ Helpful empty states
- ✅ Informative error messages
- ✅ Responsive design

---

### **Future Enhancements**

1. **Time Series Animation:** Animate through months
2. **Comparison Mode:** Compare two months side-by-side
3. **Export:** Download map as PNG/PDF
4. **Search:** Search for specific states
5. **Filters:** Filter by AUM threshold
6. **Drill-down:** Click state to see category details
7. **Historical Trends:** Show state AUM trends over time
8. **Rankings:** Show top/bottom states by category

---

## 🎯 Status: Production Ready

All features implemented and tested. Ready for deployment!

**Key Achievements:**
- ✅ Orange color scheme (as requested)
- ✅ Black state borders (as requested)
- ✅ State labels only (no city clutter)
- ✅ 5 category views
- ✅ Month-based data
- ✅ Two upload templates
- ✅ Clean, professional UI
- ✅ Fully integrated with existing heat map

**Access:**
- **Admin:** `/admin` → Heatmap Data → State-wise AUM Data Upload
- **User:** `/india-heat-map` → State AUM tab
