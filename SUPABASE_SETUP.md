# Supabase Implementation Guide for EcoTrace

Complete setup and implementation instructions for the carbon footprint tracking system.

---

## 📋 Quick Start (5 minutes)

### 1. Prerequisites
- Supabase project created at [supabase.com](https://supabase.com)
- Supabase CLI installed: `npm install -g supabase`
- Authentication already configured in your Supabase project

### 2. Manual Setup

**Option A: Using the Setup Script**
```bash
cd supabase
bash setup.sh
```

**Option B: Manual Steps**

**Step 1: Run SQL Schema**
```bash
1. Go to https://app.supabase.com → SQL Editor
2. Create new query
3. Paste entire contents of: supabase/sql/02_footprint_schema.sql
4. Click Run
```

**Verify tables:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Should return: profiles, footprint_logs, green_actions, egrid_postal_zones
```

**Step 2: Deploy Edge Function**
```bash
supabase functions deploy calculate-emission-factor
```

**Step 3: Configure Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Start Dev Server**
```bash
npm run dev
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   EcoTrace Frontend                      │
│              (Next.js React Components)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├─ TypeScript Client (supabaseFootprint.ts)
                     │
┌────────────────────▼────────────────────────────────────┐
│              Supabase (Backend)                         │
├─────────────────────────────────────────────────────────┤
│  Tables:                                                 │
│  • profiles (user settings + grid zone)                 │
│  • footprint_logs (daily CO₂ entries)                   │
│  • green_actions (gamification points)                  │
│  • egrid_postal_zones (grid emission lookup table)      │
│                                                          │
│  Edge Function:                                         │
│  • calculate-emission-factor (postal code → emissions) │
│                                                          │
│  Security:                                              │
│  • RLS enabled on all tables                            │
│  • Auth-based data isolation                            │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User settings | `id`, `household_size`, `postal_code`, `grid_intensity_zone` |
| `footprint_logs` | Carbon tracking | `user_id`, `log_date`, `category`, `calculated_kg_co2e`, `meta_data` |
| `green_actions` | Gamification | `user_id`, `action_type`, `points`, `created_at` |
| `egrid_postal_zones` | Grid lookup | `postal_code_prefix`, `grid_intensity_zone`, `grid_intensity_kg_co2_per_kwh` |

### Row Level Security (RLS)

**All tables have RLS enabled:**
- Users can `SELECT` only their own records
- Users can `INSERT` only their own records
- Users can `UPDATE` only their own records
- Users can `DELETE` only their own records

**Example query affected by RLS:**
```typescript
// This will ONLY return logs for the authenticated user
const { data } = await supabase
  .from('footprint_logs')
  .select('*');
// RLS policy blocks access to other users' data automatically
```

---

## ⚡ Edge Function: Calculate Emission Factor

### Purpose
Determines electricity emission factor (kg CO₂/kWh) based on US postal code and grid region.

### Usage

**From Frontend:**
```typescript
import { calculateEmissionFactor } from '@/lib/supabaseFootprint';

const result = await calculateEmissionFactor('10001');
console.log(result);
// {
//   postal_code: '10001',
//   grid_intensity_zone: 'NYUP',
//   emission_factor_kg_co2_per_kwh: 0.22,
//   state: 'NY',
//   confidence: 'exact'
// }
```

**Direct API Call:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/calculate-emission-factor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"postal_code": "90210"}'
```

### Lookup Strategy
1. **Exact match** on full postal code
2. **Prefix match** on first 5 digits (standard US ZIP)
3. **State fallback** on first 2 digits
4. **US average** (0.4 kg CO₂/kWh) if no match found

### Supported Regions
- **NYUP**: New York Upstate (0.22 - hydroelectric)
- **CAMX**: California Mixed (0.28 - renewables)
- **NWPP**: Pacific Northwest (0.18 - hydroelectric)
- **NEISO**: New England (0.35 - nuclear)
- **WECC**: Western Grid (0.40 - mixed)
- **SERC**: Southeast (0.60 - coal-heavy)
- **MISO**: Midwest (0.55 - coal dominant)
- **SPP**: Southwest Power Pool (0.48 - gas/wind)
- **FRCC**: Florida (0.52 - natural gas)
- **MACC**: Mid-Atlantic (0.45 - coal/gas)

---

## 🔧 TypeScript Client Library

### Initialization
```typescript
import { supabase } from '@/lib/supabaseFootprint';

// Client is automatically initialized with environment variables
// No additional setup needed - just import and use!
```

### Profile Management

**Get User Profile:**
```typescript
import { getUserProfile } from '@/lib/supabaseFootprint';

const profile = await getUserProfile(userId);
```

**Create/Update Profile:**
```typescript
import { upsertProfile } from '@/lib/supabaseFootprint';

await upsertProfile(userId, {
  household_size: 4,
  postal_code: '90210',
  grid_intensity_zone: 'CAMX',
  unit_preference: 'metric',
  currency: 'USD',
  onboarding_completed: true,
});
```

### Logging Emissions

**Log Single Entry:**
```typescript
import { logFootprint } from '@/lib/supabaseFootprint';

await logFootprint(
  userId,
  'home_energy',
  120.5, // kg CO₂e
  {
    electricity_kwh: 430,
    emission_factor: 0.28,
    provider: 'SCE'
  }
);
```

**Batch Log Multiple Entries:**
```typescript
import { batchLogFootprints } from '@/lib/supabaseFootprint';

await batchLogFootprints(userId, [
  {
    category: 'transport',
    co2e: 45.2,
    date: '2026-04-18',
    metadata: { vehicle_type: 'sedan', miles: 120 }
  },
  {
    category: 'food',
    co2e: 12.3,
    date: '2026-04-18',
    metadata: { meal_type: 'beef' }
  },
]);
```

**Query All Logs:**
```typescript
import { getUserFootprintLogs } from '@/lib/supabaseFootprint';

const logs = await getUserFootprintLogs(
  userId,
  '2026-04-01',  // start date (optional)
  '2026-04-30'   // end date (optional)
);
```

**Get Monthly Summary:**
```typescript
import { getEmissionsSummary } from '@/lib/supabaseFootprint';

const summary = await getEmissionsSummary(userId);
// {
//   total_kg_co2e: 320.5,
//   by_category: {
//     transport: 156.3,
//     home_energy: 120.2,
//     food: 44.0
//   }
// }
```

### Green Actions (Gamification)

**Record Action:**
```typescript
import { recordGreenAction } from '@/lib/supabaseFootprint';

await recordGreenAction(
  userId,
  'biked',          // action_type
  25,               // points
  'Commuted 10 miles by bike'  // description
);
```

**Get Total Points:**
```typescript
import { getUserPoints } from '@/lib/supabaseFootprint';

const totalPoints = await getUserPoints(userId);
// => 1250
```

**Get Recent Actions:**
```typescript
import { getUserGreenActions } from '@/lib/supabaseFootprint';

const recentActions = await getUserGreenActions(userId, 10);
```

### Emission Factor Calculation

**Get Factor for Postal Code:**
```typescript
import { calculateEmissionFactor } from '@/lib/supabaseFootprint';

const factor = await calculateEmissionFactor('10001');
// factor.emission_factor_kg_co2_per_kwh = 0.22
```

**Local Reference (Offline):**
```typescript
import { getEmissionFactorByZip } from '@/lib/egridData';

const { zone, factor, name } = getEmissionFactorByZip('90210');
// zone: 'CAMX'
// factor: 0.28
// name: 'California'
```

---

## 📊 Complete Example: User Onboarding Flow

```typescript
import {
  upsertProfile,
  calculateEmissionFactor,
  logFootprint,
  recordGreenAction,
  getEmissionsSummary,
} from '@/lib/supabaseFootprint';

async function onboardNewUser(userId: string, postalCode: string) {
  // 1. Create profile
  const profile = await upsertProfile(userId, {
    household_size: 3,
    postal_code: postalCode,
    onboarding_completed: false,
  });

  // 2. Calculate emission factor for their region
  const emissionFactor = await calculateEmissionFactor(postalCode);
  console.log(`Your region emits ${emissionFactor.emission_factor_kg_co2_per_kwh} kg CO₂/kWh`);

  // 3. Log initial household energy
  await logFootprint(
    userId,
    'home_energy',
    450 * emissionFactor.emission_factor_kg_co2_per_kwh, // 450 kWh last month
    {
      electricity_kwh: 450,
      emission_factor: emissionFactor.emission_factor_kg_co2_per_kwh,
    }
  );

  // 4. Record first green action
  await recordGreenAction(userId, 'joined_challenge', 50, 'Started eco tracking');

  // 5. Get initial stats
  const summary = await getEmissionsSummary(userId);
  console.log(`Your monthly emissions: ${summary.total_kg_co2e} kg CO₂e`);

  // 6. Mark onboarding complete
  await upsertProfile(userId, {
    onboarding_completed: true,
  });
}

// Usage
await onboardNewUser('user-uuid', '90210');
```

---

## 🔐 Security Best Practices

### Authentication
- ✅ All Supabase calls automatically include `auth.uid()`
- ✅ RLS policies enforce user isolation
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend

### Data Privacy
- ✅ No user data leaves their profile without explicit consent
- ✅ Meta_data is stored but encryption can be added
- ✅ Green actions are aggregated before display (no public leaderboards)

### Example Safe Pattern
```typescript
// ✅ SAFE: User can only access their own data
const { data } = await supabase
  .from('footprint_logs')
  .select('*')
  .eq('user_id', userId);
// RLS automatically filters to auth user

// ❌ UNSAFE: Trying to bypass RLS
const { data } = await supabase
  .from('footprint_logs')
  .select('*')
  .eq('user_id', 'someone-elses-uuid');
// RLS blocks this!
```

---

## 🚀 Deployment Checklist

- [ ] SQL schema deployed to Supabase
- [ ] All 4 tables created successfully
- [ ] RLS policies enabled and verified
- [ ] Edge Function deployed
- [ ] Environment variables set
- [ ] Test data inserted (optional)
- [ ] Frontend connected to Supabase
- [ ] Auth flow working
- [ ] RLS policies verified with test queries

---

## 🧪 Testing

### Test Edge Function Locally
```bash
supabase functions serve
# In another terminal:
curl -X POST http://localhost:54321/functions/v1/calculate-emission-factor \
  -H "Content-Type: application/json" \
  -d '{"postal_code": "10001"}'
```

### Test RLS Policies
```sql
-- As authenticated user:
SELECT * FROM public.footprint_logs;
-- Should return only their logs

-- Try to access another user's data:
SELECT * FROM public.footprint_logs WHERE user_id = 'other-user-id';
-- RLS should block this even if you try
```

### Test Client Library
```typescript
import { supabase } from '@/lib/supabaseFootprint';

// This should work (authenticated user)
const { data } = await supabase.auth.getSession();
console.log(data.session?.user);

// Test RLS by trying to access other user's data
const { data: unauthorizedData, error } = await supabase
  .from('footprint_logs')
  .select('*')
  .eq('user_id', 'fake-user-id');
// Should either return [] or error
```

---

## 📖 Troubleshooting

### Issue: "Permission denied" when updating profile

**Cause:** RLS policy blocking write
**Solution:** Ensure `auth.uid()` matches the profile `id`

### Issue: Edge Function returns 404

**Cause:** Function not deployed or URL incorrect
**Solution:** 
```bash
supabase functions deploy calculate-emission-factor
supabase functions list
```

### Issue: Postal code lookup returns US average

**Cause:** ZIP prefix not in `egrid_postal_zones` table
**Solution:** Add missing prefixes to seed data:
```sql
INSERT INTO public.egrid_postal_zones 
  (postal_code_prefix, grid_intensity_zone, state, grid_intensity_kg_co2_per_kwh)
VALUES ('XX', 'ZONE', 'ST', 0.XX);
```

### Issue: Can't authenticate to Supabase

**Cause:** No authenticated session
**Solution:** Ensure auth middleware is running and session is established before making DB calls

---

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [US EPA eGRID Data](https://www.epa.gov/egrid)
- [Lifecycle: Managing Carbon Emissions](https://www.carbontradewatch.org/)

---

## 📞 Support

For issues:
1. Check the [Supabase Status Page](https://status.supabase.com)
2. View function logs: `supabase functions logs calculate-emission-factor`
3. Check Supabase dashboard for table errors
4. Enable debug mode in env: `DEBUG=supabase:*`
