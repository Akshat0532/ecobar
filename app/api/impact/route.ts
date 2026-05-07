import { NextResponse } from 'next/server';

export async function GET() {
  const sample = [
    { month: 'Jan', footprint: 360 },
    { month: 'Feb', footprint: 340 },
    { month: 'Mar', footprint: 315 },
    { month: 'Apr', footprint: 298 },
    { month: 'May', footprint: 285 },
    { month: 'Jun', footprint: 270 },
  ];

  return NextResponse.json(sample);
}
