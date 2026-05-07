# EcoTrace / CarbonLog

A Next.js 14 App Router full-stack scaffold for a conversational carbon footprint tracker.

## Tech stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Zod validation
- Supabase auth-ready integration
- Recharts for trend visualization

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL in `supabase-schema.sql` in your Supabase SQL editor
   - Enable Google OAuth in Authentication > Providers (optional)

3. Add environment variables in a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Features
- **Authentication**: Magic link email login + Google OAuth
- **Onboarding**: 3-step wizard for new users
- **Carbon Calculator**: Conversational footprint estimation
- **Profile Management**: Household members, settings, data export
- **Dashboard**: Trend visualization with Recharts

## Key files
- `app/page.tsx` — landing experience with onboarding
- `app/profile/page.tsx` — user profile and settings
- `components/CarbonChatCalculator.tsx` — calculator with database saving
- `components/OnboardingWizard.tsx` — 3-step onboarding modal
- `lib/carbon.ts` — carbon estimation logic
- `app/api/carbon/route.ts` — footprint calculation API
- `app/api/save-carbon-log/route.ts` — save logs to database
- `supabase-schema.sql` — database schema and RLS policies

## Database Schema
- `profiles` — user settings and onboarding data
- `household_members` — family members for per capita views
- `carbon_logs` — saved carbon calculations
