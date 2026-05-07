# Supabase Carbon Footprint Schema & Edge Function Setup

This directory contains the complete Supabase infrastructure for EcoTrace's carbon tracking system.

## 📁 Directory Structure

```
supabase/
├── sql/
│   └── 02_footprint_schema.sql    # Main schema with tables and RLS
├── functions/
│   └── calculate-emission-factor/
│       ├── index.ts               # Deno/TypeScript Edge Function
│       └── deno.json              # Deno configuration
└── README.md                       # This file
```

## 🗄️ Database Schema Overview

### **1. `profiles` Table**
Stores user profile settings and grid intensity zone.

```sql
SELECT * FROM public.profiles WHERE id = 'user-uuid';
```

**Key Fields:**
- `id` (UUID): References `auth.users`, primary key
- `household_size` (int): Number of people in household
- `postal_code` (varchar): User's ZIP code (e.g., "10001")
- `grid_intensity_zone` (varchar): eGRID subregion (e.g., "NYUP", "CAMX")
- `grid_intensity_kg_co2_per_kwh` (float): Electricity emission factor

### **2. `footprint_logs` Table**
Core table for logging daily carbon emissions.

```sql
SELECT * FROM public.footprint_logs 
WHERE user_id = 'user-uuid' 
AND log_date >= '2026-04-01';
```

**Key Fields:**
- `id` (bigserial): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `log_date` (date): Day of activity
- `category` (enum): Type of emission
  - `home_energy`, `transport`, `food`, `goods`
- `calculated_kg_co2e` (float): Calculated CO₂ equivalent in kg
- `meta_data` (JSONB): Breakdown details
  ```json
  {
    "electricity_kwh": 45.2,
    "vehicle_miles": 120,
    "vehicle_type": "suv",
    "fuel_type": "gasoline"
  }
  ```

### **3. `green_actions` Table**
Tracks user green behaviors for gamification/points.

```sql
SELECT * FROM public.green_actions 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;
```

**Key Fields:**
- `id` (bigserial): Primary key
- `user_id` (UUID): Foreign key
- `action_type` (enum): Type of green action
  - `biked`, `vegan_meal`, `unplugged`, `donated_offset`, `joined_challenge`, `logged_activity`
- `points` (int): Gamification points (default: 10)
- `description` (text): Optional metadata

### **4. `egrid_postal_zones` Table**
Lookup table mapping US postal codes to grid regions and emission factors.

```sql
SELECT * FROM public.egrid_postal_zones 
WHERE postal_code_prefix = '10';
```

---

## 🔒 Row Level Security (RLS)

All tables have **RLS enabled** with policies ensuring:

✅ Users can `SELECT` only their own records  
✅ Users can `INSERT` only their own records  
✅ Users can `UPDATE` only their own records  
✅ Users can `DELETE` only their own records  

**Example policy (profiles table):**

```sql
-- Users can only view their own profile
CREATE POLICY "users_can_read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
```

---

## ⚡ Edge Function: `calculate-emission-factor`

**Purpose:** Determine electricity emission factor based on postal code.

### Deployment

```bash
supabase functions deploy calculate-emission-factor
```

### Usage

**Endpoint:** `POST /functions/v1/calculate-emission-factor`

**Request:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/calculate-emission-factor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"postal_code": "10001"}'
```

**Response:**
```json
{
  "postal_code": "10001",
  "grid_intensity_zone": "NYUP",
  "emission_factor_kg_co2_per_kwh": 0.22,
  "state": "NY",
  "confidence": "exact"
}
```

### Lookup Strategy

1. **Exact match** on `postal_code_prefix`
2. **Prefix match** on first 5 digits (standard US ZIP)
3. **Prefix match** on first 2 digits (state fallback)
4. **US average** (0.4 kg CO₂/kWh) if no match found

### Confidence Levels

- `exact`: Full postal code matched
- `prefix_match`: Partial match on ZIP or state
- `default`: US average used

---

## 🔧 Setup Instructions

### Step 1: Run the SQL Schema

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy contents of `supabase/sql/02_footprint_schema.sql`
4. Click **Run**

**Verification:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Should list: `profiles`, `footprint_logs`, `green_actions`, `egrid_postal_zones`

### Step 2: Deploy the Edge Function

```bash
# From project root
supabase functions deploy calculate-emission-factor
```

### Step 3: Set Environment Variables

In Next.js `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📚 TypeScript Client Library

File: `lib/supabaseFootprint.ts`

### Setup Profiles

```typescript
import { upsertProfile } from '@/lib/supabaseFootprint';

await upsertProfile(userId, {
  household_size: 4,
  postal_code: '10001',
  grid_intensity_zone: 'NYUP',
  unit_preference: 'metric',
  currency: 'USD',
});
```

### Log Emissions

```typescript
import { logFootprint } from '@/lib/supabaseFootprint';

await logFootprint(
  userId,
  'transport',
  45.2, // kg CO₂e
  {
    vehicle_miles: 120,
    vehicle_type: 'sedan',
    fuel_type: 'gasoline'
  }
);
```

### Record Green Actions

```typescript
import { recordGreenAction, getUserPoints } from '@/lib/supabaseFootprint';

// Record biking action
await recordGreenAction(userId, 'biked', 25, 'Commuted 10 miles by bike');

// Get total points
const points = await getUserPoints(userId); // => 1250
```

### Query Emissions Data

```typescript
import { 
  getUserFootprintLogs, 
  getEmissionsSummary,
  calculateEmissionFactor 
} from '@/lib/supabaseFootprint';

// Get all logs for user (last 30 days)
const logs = await getUserFootprintLogs(userId);

// Get monthly summary
const summary = await getEmissionsSummary(userId);
console.log(summary);
// {
//   total_kg_co2e: 320.5,
//   by_category: {
//     transport: 156.3,
//     home_energy: 120.2,
//     food: 44.0
//   }
// }

// Calculate emission factor for a postal code
const factor = await calculateEmissionFactor('10001');
console.log(factor.emission_factor_kg_co2_per_kwh); // 0.22
```

---

## 📊 Example Workflow

```typescript
// 1. User signs up and creates profile
const profile = await upsertProfile(userId, {
  household_size: 3,
  postal_code: '90210',
  grid_intensity_zone: 'CAMX',
  unit_preference: 'metric',
});

// 2. Get emission factor for their grid
const emissionFactor = await calculateEmissionFactor('90210');
// factor.emission_factor_kg_co2_per_kwh = 0.28

// 3. Log a home energy emission
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

// 4. Record green action (turned off AC, saved electricity)
await recordGreenAction(
  userId,
  'unplugged',
  15,
  'Used smart thermostat to reduce AC usage'
);

// 5. Get user stats
const stats = await getEmissionsSummary(userId);
const points = await getUserPoints(userId);
```

---

## 🛡️ Security Notes

✅ **RLS enforced**: Users cannot access other users' data  
✅ **No direct writes to meta_data**: All writes go through app validation  
✅ **Edge Function validated**: Postal code sanitized before lookup  
✅ **Timestamps immutable**: `created_at` and `updated_at` managed server-side  

---

## 🚀 Deployment Checklist

- [ ] SQL schema deployed to Supabase
- [ ] Edge Function deployed (`supabase functions deploy`)
- [ ] Environment variables set in `.env.local`
- [ ] Postal zone seed data inserted
- [ ] RLS policies verified
- [ ] Test client with `calculateEmissionFactor('10001')`

---

## 📖 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [eGRID Data](https://www.epa.gov/egrid) (US EPA)

---

## 📞 Support

For issues with:
- **SQL schema**: Check Supabase logs, verify tables exist
- **Edge Function**: `supabase functions logs calculate-emission-factor`
- **RLS errors**: Verify `auth.uid()` is set (user logged in)
- **Postal codes**: Check `egrid_postal_zones` table has entries
