import { milesToKilometers, simpleInputToCalculatorInput } from '../lib/carbon/adapter';
import { calculateCarbonFootprint } from '../lib/calculator';
import {
  SimpleCarbonInputSchema,
  CarbonCalculationResultSchema,
  type SimpleCarbonInput,
  type CarbonCalculationResult,
} from '../lib/carbon/schema';
import { aggregateDashboardData, type CarbonLog } from '../lib/carbon/dashboard';
import { POST as carbonPost } from '../app/api/carbon/route';
import { POST as savePost } from '../app/api/save-carbon-log/route';
import { NextRequest } from 'next/server';

async function main() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  console.log('\n--- 1. Distance Unit Conversion ---');
  const km = milesToKilometers(100);
  assert(km === 160.93, `100 miles converts to 160.93 km (got ${km})`);

  console.log('\n--- 2. Primary Test Case: Car, 100 miles, Electricity 420 kWh, Balanced diet ---');
  const primaryInput: SimpleCarbonInput = {
    commuteMode: 'car',
    weeklyKm: km,
    homeEnergySource: 'electricity',
    monthlyEnergyUsage: 420,
    dietType: 'balanced',
  };
  const primaryCalcInputs = simpleInputToCalculatorInput(primaryInput);
  assert(primaryCalcInputs.vehicleType === 'SEDAN', 'Mapped vehicleType to SEDAN');
  assert(primaryCalcInputs.weeklyVehicleKm === 160.93, 'Mapped weeklyVehicleKm to 160.93');
  assert(primaryCalcInputs.monthlyElectricity === 420, 'Mapped monthlyElectricity to 420');
  assert(primaryCalcInputs.dietType === 'BALANCED', 'Mapped dietType to BALANCED');

  const primaryResult = calculateCarbonFootprint(primaryCalcInputs);
  const primaryResponse: CarbonCalculationResult = {
    ...primaryResult,
    estimate: primaryResult.monthlyTotal,
    breakdown: {
      homeEnergy: primaryResult.homeEnergy.total,
      transportation: primaryResult.transportation.total,
      diet: primaryResult.diet,
      goodsServices: primaryResult.goodsServices,
    },
  };

  assert(primaryResponse.transportation.total > 0, `Transportation > 0 (got ${primaryResponse.transportation.total} kg)`);
  assert(primaryResponse.homeEnergy.total > 0, `Home energy > 0 (got ${primaryResponse.homeEnergy.total} kg)`);
  assert(primaryResponse.diet > 0, `Diet > 0 (got ${primaryResponse.diet} kg)`);
  assert(primaryResponse.monthlyTotal > 0, `Monthly total > 0 (got ${primaryResponse.monthlyTotal} kg)`);

  const sumCategories = Number(
    (
      primaryResponse.homeEnergy.total +
      primaryResponse.transportation.total +
      primaryResponse.diet +
      primaryResponse.goodsServices
    ).toFixed(2)
  );
  assert(
    Math.abs(primaryResponse.monthlyTotal - sumCategories) < 0.05,
    `monthlyTotal (${primaryResponse.monthlyTotal}) equals sum of categories (${sumCategories})`
  );
  assert(primaryResponse.estimate === primaryResponse.monthlyTotal, 'estimate is alias for monthlyTotal');

  const parseValidation = CarbonCalculationResultSchema.safeParse(primaryResponse);
  assert(parseValidation.success, 'Response validates against CarbonCalculationResultSchema');

  console.log('\n--- 3. Scenario B: Bike + Electricity + Vegetarian ---');
  const scenarioBInput: SimpleCarbonInput = {
    commuteMode: 'bike',
    weeklyKm: 50,
    homeEnergySource: 'electricity',
    monthlyEnergyUsage: 250,
    dietType: 'vegetarian',
  };
  const calcB = calculateCarbonFootprint(simpleInputToCalculatorInput(scenarioBInput));
  assert(calcB.transportation.total === 0, `Bike transportation is 0 (got ${calcB.transportation.total})`);
  assert(calcB.homeEnergy.total > 0, `Home energy is > 0 (got ${calcB.homeEnergy.total})`);
  assert(calcB.diet === 1.5, `Vegetarian diet factor is 1.5 (got ${calcB.diet})`);

  console.log('\n--- 4. Scenario C: Remote + Electricity + Vegan ---');
  const scenarioCInput: SimpleCarbonInput = {
    commuteMode: 'remote',
    weeklyKm: 0,
    homeEnergySource: 'electricity',
    monthlyEnergyUsage: 300,
    dietType: 'vegan',
  };
  const calcC = calculateCarbonFootprint(simpleInputToCalculatorInput(scenarioCInput));
  assert(calcC.transportation.total === 0, `Remote transportation is 0 (got ${calcC.transportation.total})`);
  assert(calcC.homeEnergy.total > 0, `Home energy is > 0 (got ${calcC.homeEnergy.total})`);
  assert(calcC.diet === 0.8, `Vegan diet factor is 0.8 (got ${calcC.diet})`);

  console.log('\n--- 5. Scenario D: Transit + Electricity + Balanced ---');
  const scenarioDInput: SimpleCarbonInput = {
    commuteMode: 'transit',
    weeklyKm: 100,
    homeEnergySource: 'electricity',
    monthlyEnergyUsage: 300,
    dietType: 'balanced',
  };
  const calcD = calculateCarbonFootprint(simpleInputToCalculatorInput(scenarioDInput));
  assert(calcD.transportation.publicTransit > 0, `Transit emissions > 0 (got ${calcD.transportation.publicTransit})`);
  assert(calcD.transportation.personalVehicle === 0, 'Personal vehicle is 0');
  assert(calcD.diet === 3.5, `Balanced diet factor is 3.5 (got ${calcD.diet})`);

  console.log('\n--- 6. Energy Sources Strict Mapping (No Guessing) ---');
  // LPG: 1 cylinder (14.2 kg)
  const lpgInput: SimpleCarbonInput = {
    commuteMode: 'remote',
    weeklyKm: 0,
    homeEnergySource: 'lpg',
    monthlyEnergyUsage: 1,
    dietType: 'balanced',
  };
  const calcLpg = calculateCarbonFootprint(simpleInputToCalculatorInput(lpgInput));
  assert(calcLpg.homeEnergy.lpg === 42.5, `1 LPG cylinder = 42.5 kg CO2e (got ${calcLpg.homeEnergy.lpg})`);

  // Natural Gas: 25 SCM
  const gasInput: SimpleCarbonInput = {
    commuteMode: 'remote',
    weeklyKm: 0,
    homeEnergySource: 'natural_gas',
    monthlyEnergyUsage: 25,
    dietType: 'balanced',
  };
  const calcGas = calculateCarbonFootprint(simpleInputToCalculatorInput(gasInput));
  assert(calcGas.homeEnergy.png === 48.25, `25 SCM natural gas = 48.25 kg CO2e (got ${calcGas.homeEnergy.png})`);

  // Mixed: 350 kWh electricity + 1 cylinder LPG
  const mixedInput: SimpleCarbonInput = {
    commuteMode: 'remote',
    weeklyKm: 0,
    homeEnergySource: 'mixed',
    monthlyEnergyUsage: 350,
    dietType: 'balanced',
  };
  const calcMixed = calculateCarbonFootprint(simpleInputToCalculatorInput(mixedInput));
  assert(calcMixed.homeEnergy.electricity === 247.8, `350 kWh elec = 247.8 kg (got ${calcMixed.homeEnergy.electricity})`);
  assert(calcMixed.homeEnergy.lpg === 42.5, `1 LPG cylinder = 42.5 kg (got ${calcMixed.homeEnergy.lpg})`);
  assert(calcMixed.homeEnergy.total === 290.3, `Mixed total = 290.3 kg (got ${calcMixed.homeEnergy.total})`);

  console.log('\n--- 7. Commute Two-Wheeler Mapping ---');
  const twoWheelerInput: SimpleCarbonInput = {
    commuteMode: 'two_wheeler',
    weeklyKm: 100,
    homeEnergySource: 'electricity',
    monthlyEnergyUsage: 200,
    dietType: 'balanced',
  };
  const calcTwoWheeler = calculateCarbonFootprint(simpleInputToCalculatorInput(twoWheelerInput));
  assert(calcTwoWheeler.transportation.personalVehicle === 15.16, `Two-wheeler personalVehicle is 15.16 kg (got ${calcTwoWheeler.transportation.personalVehicle})`);

  console.log('\n--- 8. Dashboard Categorization Test ---');
  const mockLogs: CarbonLog[] = [
    {
      id: 'test-1',
      user_id: 'user-1',
      estimate: 403.99,
      commute_mode: 'car',
      diet: 'balanced',
      home_energy: 'electricity',
      details: {
        transportation: 103.13,
        homeEnergy: 297.36,
        diet: 3.5,
        goodsServices: 0,
        weeklyKm: 160.93,
      },
      created_at: new Date().toISOString(),
    },
  ];

  const dashboard = aggregateDashboardData(mockLogs);
  assert(dashboard.breakdown.travel === 103.13, `Dashboard travel is 103.13, NOT 403.99 (got ${dashboard.breakdown.travel})`);
  assert(dashboard.breakdown.home === 297.36, `Dashboard home is 297.36, NOT 0 (got ${dashboard.breakdown.home})`);
  assert(dashboard.breakdown.diet === 3.5, `Dashboard diet is 3.5, NOT 0 (got ${dashboard.breakdown.diet})`);
  assert(dashboard.breakdown.goods === 0, `Dashboard goods is 0 (got ${dashboard.breakdown.goods})`);
  assert(dashboard.currentMonth === 403.99, `Current month footprint is 403.99 (got ${dashboard.currentMonth})`);

  // Legacy log fallback test (no details)
  const legacyBikeLog: CarbonLog = {
    id: 'legacy-1',
    user_id: 'user-1',
    estimate: 212.4,
    commute_mode: 'bike',
    diet: null,
    home_energy: 'electricity',
    details: null,
    created_at: new Date().toISOString(),
  };
  const legacyDashboard = aggregateDashboardData([legacyBikeLog]);
  assert(legacyDashboard.breakdown.home === 212.4, `Legacy bike+elec log categorized into home (got ${legacyDashboard.breakdown.home})`);
  assert(legacyDashboard.breakdown.travel === 0, `Legacy bike log travel is 0, not entire estimate (got ${legacyDashboard.breakdown.travel})`);

  console.log('\n--- 9. Schema Validation Edge Cases ---');
  const negKm = SimpleCarbonInputSchema.safeParse({
    ...primaryInput,
    weeklyKm: -5,
  });
  assert(!negKm.success, 'Negative weeklyKm rejected by schema');

  const negEnergy = SimpleCarbonInputSchema.safeParse({
    ...primaryInput,
    monthlyEnergyUsage: -100,
  });
  assert(!negEnergy.success, 'Negative monthlyEnergyUsage rejected by schema');

  const badDiet = SimpleCarbonInputSchema.safeParse({
    ...primaryInput,
    dietType: 'carnivore',
  });
  assert(!badDiet.success, 'Invalid dietType rejected by schema');

  const badEnergySource = SimpleCarbonInputSchema.safeParse({
    ...primaryInput,
    homeEnergySource: 'coal',
  });
  assert(!badEnergySource.success, 'Invalid homeEnergySource rejected by schema');

  console.log('\n--- 10. API Route Tests ---');
  // Test 1: POST /api/carbon with SIMPLE calculation
  const req1 = new NextRequest('http://localhost:3000/api/carbon', {
    method: 'POST',
    body: JSON.stringify({
      type: 'SIMPLE',
      input: primaryInput,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  const res1 = await carbonPost(req1);
  assert(res1.status === 200, `POST /api/carbon returns 200 (got ${res1.status})`);
  const data1 = await res1.json();
  assert(data1.monthlyTotal === 403.99, `API returned monthlyTotal 403.99 (got ${data1.monthlyTotal})`);
  assert(data1.estimate === 403.99, `API returned estimate 403.99 (got ${data1.estimate})`);
  assert(data1.homeEnergy.total === 297.36, `API returned homeEnergy 297.36 (got ${data1.homeEnergy.total})`);
  assert(data1.transportation.total === 103.13, `API returned transportation 103.13 (got ${data1.transportation.total})`);
  assert(data1.diet === 3.5, `API returned diet 3.5 (got ${data1.diet})`);

  // Test 2: Invalid JSON body -> 400
  const reqBadJson = new NextRequest('http://localhost:3000/api/carbon', {
    method: 'POST',
    body: '{ invalid json',
    headers: { 'Content-Type': 'application/json' },
  });
  const resBadJson = await carbonPost(reqBadJson);
  assert(resBadJson.status === 400, `Malformed JSON returns 400 (got ${resBadJson.status})`);

  // Test 3: Invalid calculation type -> 400
  const reqBadType = new NextRequest('http://localhost:3000/api/carbon', {
    method: 'POST',
    body: JSON.stringify({ type: 'INVALID' }),
    headers: { 'Content-Type': 'application/json' },
  });
  const resBadType = await carbonPost(reqBadType);
  assert(resBadType.status === 400, `Invalid calculation type returns 400 (got ${resBadType.status})`);

  // Test 4: Missing authentication on save route -> 401
  const reqUnauthSave = new NextRequest('http://localhost:3000/api/save-carbon-log', {
    method: 'POST',
    body: JSON.stringify({
      commute_mode: 'car',
      home_energy: 'electricity',
      monthly_energy_usage: 420,
      diet: 'balanced',
      estimate: 403.99,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  const resUnauthSave = await savePost(reqUnauthSave);
  assert(resUnauthSave.status === 401, `Unauthenticated save returns 401 (got ${resUnauthSave.status})`);

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
