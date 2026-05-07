import { z } from 'zod';
import { calculateCarbonFootprint } from '@/lib/carbon';
import { NextResponse } from 'next/server';

const carbonSchema = z.object({
  commuteMode: z.enum(['car', 'two_wheeler', 'transit', 'bike', 'remote']),
  weeklyKm: z.number().min(0).max(2000),
  homeEnergy: z.enum(['electricity', 'lpg', 'mixed']),
  monthlyEnergyUsage: z.number().min(0).max(2000),
  diet: z.enum(['meatHeavy', 'balanced', 'vegetarian'])
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = carbonSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid inputs' }, { status: 400 });
  }

  const result = calculateCarbonFootprint(parsed.data);
  return NextResponse.json(result);
}
