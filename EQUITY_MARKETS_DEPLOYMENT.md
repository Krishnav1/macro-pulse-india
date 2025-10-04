# Equity Markets - Deployment Guide

## 🚀 Quick Start

This guide will help you deploy the complete equity markets module to production.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [x] All 8 tables created via Supabase MCP
- [x] RLS policies configured for public read access
- [x] Indexes created for performance
- [x] Unique constraints added

### 2. Edge Function
- [ ] Deploy `fetch-nse-data` to Supabase
- [ ] Test Edge Function with sample requests
- [ ] Verify CORS handling works

### 3. Frontend Code
- [x] All components created (35+ files)
- [x] Routes added to App.tsx
- [x] Types defined
- [x] Services implemented
- [x] Hooks created

### 4. Initial Data
- [ ] Run initial full sync
- [ ] Verify data in database
- [ ] Test all pages load correctly

## 📋 Step-by-Step Deployment

### Step 1: Deploy Supabase Edge Function

```bash
# Navigate to project root
cd c:\Users\kvarm\OneDrive\Desktop\Dashboard Project\macro-pulse-india

# Login to Supabase (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref fhcddkfgqhwwfvqymqow

# Deploy the Edge Function
npx supabase functions deploy fetch-nse-data
```

**Expected Output:**
```
Deploying function fetch-nse-data...
Function deployed successfully!
URL: https://fhcddkfgqhwwfvqymqow.supabase.co/functions/v1/fetch-nse-data
```

### Step 2: Test Edge Function

```bash
# Test the Edge Function
curl -X POST https://fhcddkfgqhwwfvqymqow.supabase.co/functions/v1/fetch-nse-data \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"allIndices"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "indexSymbol": "NIFTY 50",
        "last": 19500.25,
        ...
      }
    ]
  }
}
```

### Step 3: Run Initial Data Sync

**Option A: Via Admin Panel (Recommended)**
1. Navigate to `/admin`
2. Look for "NSE Data Sync" section
3. Click "Full Sync" button
4. Wait for completion (2-3 minutes)
5. Verify sync results

**Option B: Programmatically**
```typescript
// In browser console or temporary script
import { NSESyncService } from '@/services/equity/nseSyncService';

const result = await NSESyncService.fullSync();
console.log('Sync Results:', result);
```

**Expected Output:**
```
Sync Results: {
  success: true,
  results: [
    { type: 'indices', success: true, count: 50 },
    { type: 'constituents_NIFTY 50', success: true, count: 50 },
    { type: 'bulk_deals', success: true, count: 25 },
    { type: 'block_deals', success: true, count: 10 },
    { type: 'fii_dii', success: true, count: 2 }
  ]
}
```

### Step 4: Verify Pages Load

Visit each page and verify data displays correctly:

1. **Index Dashboard**
   - URL: `/financial-markets/equity-markets/indices`
   - Check: Indices cards display
   - Check: Market summary shows correct counts
   - Check: Comparison chart renders

2. **Index Detail (NIFTY 50)**
   - URL: `/financial-markets/equity-markets/index/nifty-50`
   - Check: All 5 tabs work
   - Check: Stock data displays
   - Check: Charts render

3. **Bulk/Block Deals**
   - URL: `/financial-markets/equity-markets/bulk-deals`
   - Check: Deals table shows data
   - Check: All 4 tabs work
   - Check: Filters and search work

### Step 5: Set Up Automated Sync (Optional)

**Option A: Supabase Cron Job**

Create a new Edge Function for scheduled sync:

```typescript
// supabase/functions/scheduled-nse-sync/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // This will be called by Supabase cron
  // Run NSE sync logic here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Then schedule it in Supabase Dashboard:
- Go to Database → Cron Jobs
- Create new job: `0 18 * * *` (6 PM daily)
- Target: `scheduled-nse-sync` function

**Option B: External Cron (Vercel, Railway, etc.)**

Create API endpoint in your app:
```typescript
// pages/api/sync-nse.ts
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await NSESyncService.fullSync();
  return res.json(result);
}
```

Schedule with external service to hit this endpoint daily at 6:30 PM IST.

## 🔧 Configuration

### Environment Variables

Ensure these are set in your environment:

```env
# Supabase
VITE_SUPABASE_URL=https://fhcddkfgqhwwfvqymqow.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For cron authentication
CRON_SECRET=your-secret-key
```

### Cache Settings

The NSEDataService uses 15-minute caching. To adjust:

```typescript
// In src/services/equity/nseDataService.ts
private static CACHE_DURATION = 15 * 60 * 1000; // Change as needed
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Index Dashboard loads without errors
- [ ] Can click on index card to view details
- [ ] All tabs in index detail work
- [ ] Search and sort work in tables
- [ ] Bulk deals page loads
- [ ] Block deals page loads
- [ ] Analysis tab shows charts
- [ ] Investor tracker works
- [ ] Sync button triggers data refresh
- [ ] Mobile responsive design works
- [ ] Dark theme consistent

### Automated Testing (Future)

```typescript
// Example test
describe('Index Dashboard', () => {
  it('should load indices', async () => {
    const { indices } = await useMarketIndices();
    expect(indices.length).toBeGreaterThan(0);
  });
});
```

## 📊 Monitoring

### Key Metrics to Track

1. **Data Freshness**
   - Check `updated_at` timestamps in tables
   - Should be within 15 minutes during market hours

2. **Sync Success Rate**
   - Query `nse_sync_logs` table
   - Monitor failed syncs

3. **API Performance**
   - Edge Function response times
   - Cache hit rates

### Monitoring Queries

```sql
-- Check latest sync status
SELECT * FROM nse_sync_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Check data freshness
SELECT 
  'market_indices' as table_name,
  MAX(updated_at) as last_update,
  COUNT(*) as record_count
FROM market_indices
UNION ALL
SELECT 
  'bulk_deals',
  MAX(created_at),
  COUNT(*)
FROM bulk_deals;

-- Check failed syncs
SELECT * FROM nse_sync_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

## 🐛 Troubleshooting

### Issue: Edge Function Returns 401

**Cause:** Missing or incorrect authorization header

**Fix:**
```typescript
// Ensure anon key is included
headers: {
  'Authorization': `Bearer ${ANON_KEY}`,
}
```

### Issue: No Data in Tables

**Cause:** Initial sync not run or failed

**Fix:**
1. Check `nse_sync_logs` for errors
2. Run manual sync from admin panel
3. Check Edge Function logs in Supabase

### Issue: CORS Errors

**Cause:** Not using Edge Function

**Fix:**
- Always use `NSEDataService` instead of direct fetch
- Verify Edge Function URL is correct

### Issue: Stale Data

**Cause:** Cache not clearing or sync not running

**Fix:**
```typescript
// Clear cache manually
NSEDataService.clearCache();

// Force refresh
const { refresh } = useMarketIndices();
refresh();
```

## 🔒 Security

### RLS Policies

All tables have public read access:
```sql
CREATE POLICY "Public read access" ON market_indices 
FOR SELECT USING (true);
```

### Edge Function Security

- Runs server-side (no CORS issues)
- Uses Supabase authentication
- Rate limited by Supabase

### API Key Protection

- Never expose service role key
- Use anon key for client requests
- Edge Function handles sensitive operations

## 📈 Performance Optimization

### Database Indexes

Already created for:
- `market_indices(symbol, timestamp)`
- `stock_prices(symbol, timestamp)`
- `bulk_deals(date, symbol)`
- `block_deals(date, symbol)`

### Caching Strategy

- **Client-side:** 15-minute cache in NSEDataService
- **Database:** Latest records cached in memory
- **Edge Function:** No caching (always fresh from NSE)

### Query Optimization

```typescript
// Good: Get latest indices efficiently
const { data } = await supabase
  .from('market_indices')
  .select('*')
  .order('timestamp', { ascending: false });

// Get unique by symbol in JavaScript
const unique = data.reduce((acc, curr) => {
  if (!acc.find(item => item.symbol === curr.symbol)) {
    acc.push(curr);
  }
  return acc;
}, []);
```

## 🎯 Success Criteria

### Deployment is successful when:

- [x] All database tables exist with data
- [ ] Edge Function deployed and responding
- [ ] All pages load without errors
- [ ] Data syncs successfully
- [ ] Charts and tables render correctly
- [ ] Mobile responsive
- [ ] Dark theme consistent
- [ ] No console errors
- [ ] Performance acceptable (<2s load time)

## 📝 Post-Deployment Tasks

1. **Monitor for 24 hours**
   - Check sync logs
   - Verify data accuracy
   - Monitor error rates

2. **Set up alerts**
   - Failed sync notifications
   - Data freshness alerts
   - Error rate thresholds

3. **Document any issues**
   - Update troubleshooting guide
   - Add to known issues list

4. **Plan next features**
   - Sector drilldown
   - Market breadth dashboard
   - FII/DII detailed page

## 🆘 Support

### Common Commands

```bash
# View Edge Function logs
npx supabase functions logs fetch-nse-data

# Redeploy Edge Function
npx supabase functions deploy fetch-nse-data --no-verify-jwt

# Check database status
npx supabase db status

# Run migrations
npx supabase db push
```

### Useful Links

- **Supabase Dashboard:** https://app.supabase.com/project/fhcddkfgqhwwfvqymqow
- **Edge Functions:** https://app.supabase.com/project/fhcddkfgqhwwfvqymqow/functions
- **Database:** https://app.supabase.com/project/fhcddkfgqhwwfvqymqow/editor
- **Logs:** https://app.supabase.com/project/fhcddkfgqhwwfvqymqow/logs

---

## ✅ Final Checklist

Before marking deployment complete:

- [ ] Edge Function deployed successfully
- [ ] Initial data sync completed
- [ ] All pages tested and working
- [ ] No console errors
- [ ] Mobile responsive verified
- [ ] Performance acceptable
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified

**Deployment Status:** 🟡 Ready for Deployment
**Estimated Time:** 30-45 minutes
**Last Updated:** October 4, 2025
