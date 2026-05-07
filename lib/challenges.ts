/**
 * Community challenges data
 * In production, these would be stored in Supabase with admin creation interface
 */

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: 'transport' | 'diet' | 'energy' | 'goods';
  teamGoalUnit: string; // "meals", "miles", "kWh"
  teamGoalValue: number;
  isActive: boolean;
  emoji: string;
  color: string;
}

export const ACTIVE_CHALLENGES: Challenge[] = [
  {
    id: 'meatless-may',
    title: 'Meatless May',
    description: 'Join thousands eating plant-based meals this May. Track meatless meals and help us reach 10,000 combined plant-based dinners.',
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-05-31'),
    category: 'diet',
    teamGoalUnit: 'meatless meals',
    teamGoalValue: 10000,
    isActive: true,
    emoji: '🌱',
    color: 'emerald',
  },
  {
    id: 'bike-april',
    title: 'April Bike Challenge',
    description: 'Skip car trips and bike instead. Track miles biked to reduce transport emissions.',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-30'),
    category: 'transport',
    teamGoalUnit: 'miles biked',
    teamGoalValue: 25000,
    isActive: true,
    emoji: '🚴',
    color: 'blue',
  },
  {
    id: 'energy-dash',
    title: 'Energy Efficiency Sprint',
    description: 'Reduce home energy use this month. Turn off standby devices, adjust thermostats, switch to LEDs.',
    startDate: new Date('2026-04-15'),
    endDate: new Date('2026-05-15'),
    category: 'energy',
    teamGoalUnit: 'kWh saved',
    teamGoalValue: 50000,
    isActive: true,
    emoji: '⚡',
    color: 'amber',
  },
  {
    id: 'secondhand-april',
    title: 'Secondhand Saturdays',
    description: 'Buy secondhand instead of new. Thrift stores, FB Marketplace, consignment shops.',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-30'),
    category: 'goods',
    teamGoalUnit: 'items purchased secondhand',
    teamGoalValue: 5000,
    isActive: true,
    emoji: '♻️',
    color: 'teal',
  },
];

/**
 * Get human-readable progress message
 */
export function getProgressMessage(
  category: string,
  baselineEmissions: number,
  currentEmissions: number
): string {
  const percentChange = ((baselineEmissions - currentEmissions) / baselineEmissions) * 100;

  if (percentChange > 20) return 'Amazing reduction! Keep it up! 🎉';
  if (percentChange > 10) return 'Solid progress! Share your wins! 🚀';
  if (percentChange > 0) return 'Good start! Every bit helps. 💪';
  if (percentChange === 0) return 'No change yet. You got this! 💪';
  return 'Emissions increased. No judgment—keep trying! 🌱';
}

/**
 * Determine if user reduced emissions
 */
export function hasUserReduced(baseline: number, current: number): boolean {
  return current < baseline;
}
