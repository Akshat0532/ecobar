#!/bin/bash

# EcoTrace Supabase Setup Script
# Run this script to automatically set up the Supabase infrastructure
# Usage: bash ./supabase/setup.sh

set -e

echo "🌱 EcoTrace Supabase Setup"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}✗ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"
echo ""

# Check environment variables
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${YELLOW}⚠ SUPABASE_ACCESS_TOKEN not set${NC}"
    echo "Set it with: export SUPABASE_ACCESS_TOKEN=your-token"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Step 1/4: Pulling latest Supabase schema..."
echo "---"
supabase db pull
echo -e "${GREEN}✓ Schema pulled${NC}"
echo ""

echo "Step 2/4: Deploying Edge Function..."
echo "---"
supabase functions deploy calculate-emission-factor --project-ref $(supabase projects list | head -1 | awk '{print $1}')
echo -e "${GREEN}✓ Edge Function deployed${NC}"
echo ""

echo "Step 3/4: Running SQL schema..."
echo "---"
echo "Please run the following SQL in Supabase SQL Editor:"
echo "  1. Go to Supabase Dashboard → SQL Editor"
echo "  2. Create new query"
echo "  3. Paste contents of: supabase/sql/02_footprint_schema.sql"
echo "  4. Click 'Run'"
echo ""
read -p "Have you run the SQL schema? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠ Skipping SQL setup${NC}"
fi

echo ""
echo "Step 4/4: Checking environment variables..."
echo "---"
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL found${NC}"
else
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_URL not set in .env.local${NC}"
    echo "Add to .env.local:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
fi

echo ""
echo "=========================="
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify all tables exist in Supabase"
echo "  2. Test Edge Function: npm run test:emission-factor"
echo "  3. Start dev server: npm run dev"
echo ""
