/**
 * Blog posts content library (MDX-ready)
 * In production, would be fetched from CMS or Supabase
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: 'tips' | 'science' | 'guides' | 'tools';
  featuredImageUrl: string;
  readTimeMinutes: number;
  seoKeywords: string[];
  isPublished: boolean;
  createdAt: Date;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'read-electricity-bill-2026',
    title: 'How to Read Your Electricity Bill (and Why Delivery Charges Matter)',
    excerpt:
      'Your electricity bill has hidden information. Learn what kWh, demand charges, and delivery fees actually mean—and how to find the real cost of your power.',
    category: 'guides',
    author: 'EcoTrace Team',
    featuredImageUrl: 'https://images.unsplash.com/photo-1621282486226-a88d8ba9e8c6?w=800&h=400&fit=crop',
    readTimeMinutes: 7,
    seoKeywords: ['electricity bill', 'kWh', 'delivery charges', 'carbon emissions', 'utility costs'],
    isPublished: true,
    createdAt: new Date('2026-04-01'),
    content: `
# How to Read Your Electricity Bill (and Why Delivery Charges Matter)

Your monthly electricity bill is more than just a number. It's a window into your energy consumption—and your carbon footprint. But most people glance at the total and move on. Let's break it down.

## The Three Numbers You Actually Need to Know

### 1. **kWh (Kilowatt-hours)** – Your Actual Usage
This is the electricity you consumed. One kilowatt-hour equals 1,000 watts running for one hour.

**Example:** A 100-watt LED bulb running for 10 hours = 1 kWh.

**What it means for you:** The average American household uses ~900 kWh per month. If yours is higher, you're either:
- In a cold climate (heating)
- In a hot climate (cooling)
- Running inefficient appliances
- Leaving devices on standby (phantom load)

**Carbon impact:** The carbon intensity of 1 kWh depends on your grid mix. In coal-heavy regions, it's 0.9 kg CO₂e/kWh. In renewable-heavy regions, it's 0.1 kg CO₂e/kWh.

### 2. **Demand Charges** – Your Peak Power Draw
Some utilities (especially businesses) charge based on the *highest* power draw during billing period, not just total use.

**Example:** If you run your AC, oven, and water heater simultaneously, you hit a 8 kW peak. The utility may charge a monthly fee just for that moment, because they must maintain infrastructure for your peak demand.

**What it means:** Spreading energy use throughout the day (not showering after midnight and running laundry simultaneously) can reduce these charges.

### 3. **Delivery Charge** – The Poles & Wires
Here's the mind-bending part: **Half your bill often isn't for electricity. It's for the infrastructure that delivers it.**

Breakdown on a typical ~$120 bill:
- **Generation:** $30 (actual power)
- **Transmission:** $15 (long-distance lines)
- **Distribution:** $40 (poles, wires, transformer on your street)
- **Taxes & fees:** $35

So reducing kWh by 10% might only lower your bill by 3-5%, because delivery costs are fixed regardless.

**What it means:** Energy efficiency helps, but only to a point. The real emissions lever is *grid decarbonization*—switching to renewable energy plans.

## Hidden Sustainability Factors on Your Bill

### Time-of-Use Rates (ToU)
Increasingly common. Rates vary by hour:
- **Peak hours** (2pm-8pm): $0.35/kWh
- **Off-peak** (10pm-7am): $0.12/kWh

**Tactic:** Charge EVs, run dishwashers, and do laundry during off-peak to save money *and* reduce your carbon footprint (off-peak power is often renewables).

### Renewable Energy Programs
Most utilities offer a "green energy" rider (+$10-20/month) that funds renewable projects. This **dramatically** reduces your per-kWh carbon footprint.

For instance:
- Standard grid mix: 0.5 kg CO₂e/kWh
- 100% renewable plan: 0.05 kg CO₂e/kWh
- **10x reduction** for ~$15/month

## Action Items

✅ **This week:** Find your kWh usage on your bill and compare to last month and last year.

✅ **This month:** Check if your utility offers a renewable energy plan. Most do. Sign up even if it costs extra.

✅ **Ongoing:** Identify which appliances spike your usage (AC, heating, water heater). Consider upgrading to efficient models.

---

*Want to track this? Log your monthly kWh into EcoTrace to see your year-over-year trend and identify your biggest savings opportunities.*
`,
  },

  {
    id: '2',
    slug: 'streaming-vs-dvd-2026',
    title: 'Carbon Footprint of Streaming vs. DVD: The 2026 Update',
    excerpt:
      'Netflix or physical media? The answer is more complex than you think. We broke down the latest research on emissions from streaming, manufacturing, and shipping.',
    category: 'science',
    author: 'Dr. Sarah Chen',
    featuredImageUrl: 'https://images.unsplash.com/photo-1611339555312-e607c90352fd?w=800&h=400&fit=crop',
    readTimeMinutes: 6,
    seoKeywords: ['streaming emissions', 'netflix carbon footprint', 'dvd environmental impact', 'data centers'],
    isPublished: true,
    createdAt: new Date('2026-03-15'),
    content: `
# Carbon Footprint of Streaming vs. DVD: The 2026 Update

In 2012, headlines declared: **"Streaming is greener than DVDs."**

In 2020, they declared: **"Actually, DVDs are greener."**

In 2026, the truth is: **It's complicated—and depends on your behavior.**

## The Numbers (Updated for 2026 Grid Mix)

### Streaming One Movie on Netflix
- **Data center emissions:** 0.24 kg CO₂e (per 2-hour movie)
- **Network transmission:** 0.08 kg CO₂e (WiFi is greener than mobile)
- **Device manufacturing amortized:** negligible
- **Total:** ~0.32 kg CO₂e

### Watching a Physical DVD
- **Manufacturing (amortized):** 0.5 kg CO₂e (assumes ~10 watches, you've watched 3)
- **Shipping (amortized):** 0.2 kg CO₂e (Netflix rental return, or store trip)
- **Landfill end-of-life:** 0.1 kg CO₂e
- **Total per watch:** ~0.2 kg CO₂e *(if you watch it 10+ times)*

## Here's the Catch: Streaming Encourages MORE Watching

The real issue: Netflix, Disney+, Amazon Prime have made entertainment a $0 marginal cost. People watch more movies per year.

**Scenario 1: Casual viewer**
- Streams 12 movies/year
- Would have rented 3 DVDs/year (cost barrier)
- **Extra CO₂e from streaming:** 3 movies × 0.32 = 0.96 kg CO₂e/year

**Scenario 2: Movie lover**
- Buys favorite films on physical media (~10/year at $20 each)
- Streams heavily too (30+ movies/year)
- **If switched to streaming only:** Already accountable for 30 viewings in emissions

## The Grid Mix Factor (New in 2026)

Streaming emissions depend entirely on where the data center is powered.

| Data Center Location | Emissions/Movie |
|---|---|
| Iceland (geothermal) | 0.05 kg CO₂e |
| California (50% renewable) | 0.15 kg CO₂e |
| Midwest US (coal + gas) | 0.45 kg CO₂e |

Netflix has committed to offsetting, but Amazon Prime and Google still use standard grid mix.

## The Winner? (It's Not Clear)

**Streaming wins IF:**
- You watch 1-2 movies per month (not 2-3 per week)
- Your ISP uses renewable energy (increasingly common)
- You never leave the stream buffering (use WiFi, not LTE)

**DVDs win IF:**
- You own DVDs you watch 5+ times
- You buy used DVDs (zero manufacturing impact)
- You borrow from libraries (zero personal emissions)

## The Real Answer: Library + Strategic Streaming

- **Borrow from your local library:** ✅ Lowest impact (amortized across 500+ viewers)
- **Buy physical media only for favorites you'll watch 10+ times:** ✅ Low per-watch impact
- **Subscribe to ONE streaming service (not three):** ✅ Efficient
- **Use WiFi, not LTE:** ✅ 75% less energy

---

*Pro tip: Log your streaming hours into EcoTrace if you use 4+ hours per day. It might be your biggest discretionary emissions source.*
`,
  },

  {
    id: '3',
    slug: 'ev-charging-stations-grid-cleanliness',
    title: 'Interactive Guide: EV Charging Stations Ranked by Grid Cleanliness',
    excerpt:
      'Not all EVs are created equal. The carbon footprint of charging depends on where you live. Find the cleanest charging networks near you.',
    category: 'tools',
    author: 'EcoTrace Data Team',
    featuredImageUrl: 'https://images.unsplash.com/photo-1560958089-b8a63dd52183?w=800&h=400&fit=crop',
    readTimeMinutes: 5,
    seoKeywords: ['ev charging', 'electric vehicle', 'clean energy', 'carbon emissions', 'charging network'],
    isPublished: true,
    createdAt: new Date('2026-04-10'),
    content: `
# Interactive Guide: EV Charging Stations Ranked by Grid Cleanliness

**The myth:** "Electric vehicles are always cleaner than gas cars."

**The nuance:** "It depends on where you charge."

An EV charged in California emissions ~100 grams CO₂e per mile. The same EV in West Virginia (coal-heavy grid) emits ~250 grams CO₂e per mile.

> Both are still 50-70% cleaner than gas cars. But the delta matters.

## The Grid Mix Map (2026 Data)

### Ultra-Clean Regions (< 50g CO₂e/kWh)
- **Pacific Northwest:** Hydro-power dominant
- **California:** 60% renewable
- **New York:** Large nuclear base
- **New England:** Increasing offshore wind

**Charging here:** 80g CO₂e/mile
**Recommendation:** Charge freely. You're at coal-car parity.

### Moderate Regions (100-200g CO₂e/kWh)
- **Midwest:** Gas + renewables mix
- **Texas:** Increasing wind capacity
- **Great Plains:** Wind energy hub

**Charging here:** 120-150g CO₂e/mile
**Recommendation:** Charge during renewable peak hours (usually 2-4pm when solar peaks, or nighttime when wind is strong).

### Coal-Heavy Regions (> 250g CO₂e/kWh)
- **West Virginia, Kentucky, Wyoming**

**Charging here:** 200-250g CO₂e/mile
**Recommendation:** Stock up on offsets or lobby for grid decarbonization.

## Charging Network Rankings (by Commitment to Clean Energy)

| Network | Clean Energy Commitment | Rating |
|---|---|---|
| **Tesla Supercharger** | 50% solar/renewable | ⭐⭐⭐⭐ |
| **Electrify America** | 80% renewable goal by 2028 | ⭐⭐⭐⭐ |
| **EVgo** | Partners with NREL on grid integration | ⭐⭐⭐ |
| **ChargePoint** | Network-dependent (varies) | ⭐⭐⭐ |
| **Local municipalities** | Often worst (standard grid) | ⭐⭐ |

## Time-of-Charging Matters

Even in the same location, charging at different times dramatically shifts emissions.

**Example: Los Angeles Grid**

| Time | Grid Source | Emissions |
|---|---|---|
| **2 PM** | 40% solar peak | 25g CO₂e/kWh |
| **8 PM** | Solar drops, gas ramps up | 120g CO₂e/kWh |
| **2 AM** | Wind peaks, baseload | 45g CO₂e/kWh |

**Your move:** Use "smart charging." Car apps let you set a preferred departure time, and the car charges during cleanest hours overnight.

## Action: Find Your Local Clean Charging

[Placeholder for interactive map in production]

1. Enter your ZIP code
2. See nearby charging stations
3. View grid cleanliness score
4. Get "sweet spot" charging times (peak renewables)

---

If your local grid is coal-heavy, don't despair. Even coal-powered EV charging beats internal combustion engines. Plus: grids are decarbonizing fast. Your 2026 EV gets cleaner every year without you doing anything.

*Track your EV charging in EcoTrace and watch your impact improve as your grid cleans up.*
`,
  },

  {
    id: '4',
    slug: 'carbon-footprint-common-foods',
    title: 'The Carbon Cost of Your Plate: Common Foods Ranked',
    excerpt:
      'Beef vs. chicken vs. plant-based. A scientifically-backed ranking of the emissions hidden in your daily meals.',
    category: 'science',
    author: 'EcoTrace Team',
    featuredImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
    readTimeMinutes: 4,
    seoKeywords: ['food carbon footprint', 'beef emissions', 'vegan diet', 'sustainable food', 'carbon calculus'],
    isPublished: true,
    createdAt: new Date('2026-02-20'),
    content: `
# The Carbon Cost of Your Plate: Common Foods Ranked

What's for dinner? Your choice has outsized carbon impact.

## The Rankings (kg CO₂e per serving)

### 🥩 High Impact
- **Beef (250g steak):** 5.2 kg CO₂e
- **Lamb (250g leg):** 6.1 kg CO₂e
- **Cheese (100g cheddar):** 2.0 kg CO₂e

### 🍗 Moderate
- **Chicken (150g):** 0.8 kg CO₂e
- **Fish, wild-caught (150g):** 1.2 kg CO₂e
- **Fish, farmed (150g):** 2.1 kg CO₂e
- **Eggs (2 large):** 0.6 kg CO₂e

### 🌱 Low Impact
- **Lentils (1 cup cooked):** 0.2 kg CO₂e
- **Tofu (200g):** 0.3 kg CO₂e
- **Beans (1 cup cooked):** 0.15 kg CO₂e
- **Nuts (100g almonds):** 1.1 kg CO₂e *(high water use)*
- **Vegetables (typical serving):** < 0.1 kg CO₂e

## Why Is Beef So Bad? (The Science)

1. **Methane from cows:** Livestock produces 15% of global emissions. Cows belch methane (29x stronger than CO₂) during digestion.

2. **Land use:** Beef requires 10x more land than beans to produce the same protein.

3. **Feed conversion:** A cow must be fed 10 lbs of grain to produce 1 lb of meat.

4. **Refrigeration & transport:** Chilled supply chains are energy-intensive.

**Result:** Eating one beef steak ≈ driving a gas car 12 miles.

## The One Change That Matters Most

Don't obsess over perfection. One strategic swap:

**Meatless Monday (or Tuesday, or Friday)**

If you normally eat 6 oz beef daily:
- **Everyday beef eater:** 1,890 kg CO₂e/year (diet)
- **Swap 1 day/week to plant-based:** 270 kg CO₂e/year savings
- **That's equivalent to offsetting by planting 13 trees/year**

## Your Action Plan

✅ **This week:** Track three meals and log into EcoTrace. See your diet's emissions.

✅ **Next week:** Replace one beef meal with lentil chili or bean tacos. Note the difference.

✅ **Long term:** Aim for 2-3 meatless days per week. No need to go full vegan.

---

*Science backing: FAO 2013 "Livestock's Long Shadow" study, updated with 2026 grid data.*
`,
  },
];

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category === category && post.isPublished);
}

/**
 * Get featured/pinned posts
 */
export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.isPublished).slice(0, 3);
}

/**
 * Search posts by keyword
 */
export function searchPosts(query: string): BlogPost[] {
  const q = query.toLowerCase();
  return BLOG_POSTS.filter(
    (post) =>
      post.isPublished &&
      (post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.seoKeywords.some((kw) => kw.toLowerCase().includes(q)))
  );
}
