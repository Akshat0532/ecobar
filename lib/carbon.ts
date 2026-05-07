export type CarbonInput = {
  commuteMode: 'car' | 'two_wheeler' | 'transit' | 'bike' | 'remote';
  weeklyKm: number;
  homeEnergy: 'electricity' | 'lpg' | 'mixed';
  monthlyEnergyUsage: number;
  diet: 'meatHeavy' | 'balanced' | 'vegetarian';
};

export type CarbonResult = {
  estimate: number;
  tip: string;
  details: {
    commute: number;
    energy: number;
    diet: number;
  };
};

// India-specific commute factors (kg CO₂e per km per week, annualized monthly)
const commuteFactors: Record<CarbonInput['commuteMode'], number> = {
  car: 0.148,           // Average petrol car
  two_wheeler: 0.035,   // Petrol scooter/bike
  transit: 0.025,       // City bus/metro
  bike: 0.00,           // Bicycle — zero emissions
  remote: 0.005         // Minimal (home office electricity)
};

// India-specific energy factors (kg CO₂e per kWh / per unit)
const energyFactors: Record<CarbonInput['homeEnergy'], number> = {
  electricity: 0.708,   // Indian grid average
  lpg: 2.99,            // LPG per kg (cylinder = 14.2 kg)
  mixed: 0.85           // Mix of electricity + LPG
};

// India-specific diet factors (kg CO₂e per person per month multiplier)
const dietFactors: Record<CarbonInput['diet'], number> = {
  meatHeavy: 6.0,       // Non-veg daily
  balanced: 3.5,         // Non-veg 2-3 times/week (average Indian)
  vegetarian: 1.5        // Vegetarian with dairy (large Indian population)
};

export function calculateCarbonFootprint(input: CarbonInput): CarbonResult {
  const commute = commuteFactors[input.commuteMode] * input.weeklyKm * 52 / 12;
  const energy = energyFactors[input.homeEnergy] * input.monthlyEnergyUsage;
  const diet = dietFactors[input.diet] * 10;

  const estimate = Number((commute + energy + diet).toFixed(1));

  const tip = input.homeEnergy === 'electricity'
    ? 'Consider solar panels — India has 300+ sunny days/year. Even a 1 kW rooftop system can cut your electricity bill by 30-40%.'
    : input.homeEnergy === 'lpg'
      ? 'Consider switching to a solar cooker for daytime meals or an induction cooktop powered by renewable energy.'
      : 'A home energy audit can identify quick wins — LED bulbs and 5-star rated appliances save both ₹ and CO₂.';

  return {
    estimate,
    tip,
    details: {
      commute: Number(commute.toFixed(1)),
      energy: Number(energy.toFixed(1)),
      diet: Number(diet.toFixed(1))
    }
  };
}
