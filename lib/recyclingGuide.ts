/**
 * Recycling Guide data
 * Common household items with recycling instructions
 */

export interface RecycleItem {
  id: string;
  name: string;
  category: string;
  canRecycle: boolean;
  shortDescription: string;
  detailedDescription: string;
  reason: string;
  steps?: string[];
  commonMistakes?: string[];
  localVariations?: string[];
}

export const RECYCLING_ITEMS: RecycleItem[] = [
  {
    id: 'plastic-bottles',
    name: 'Plastic Bottles (PET #1)',
    category: 'Plastics',
    canRecycle: true,
    shortDescription: 'Water bottles, soda bottles, and most clear drink containers.',
    detailedDescription:
      'PET (polyethylene terephthalate) #1 bottles are among the most commonly recycled plastics. They are melted down and reformed into new bottles, polyester fabric, or carpet fibers.',
    reason: 'PET plastic is highly recyclable and in demand by manufacturers.',
    steps: [
      'Empty and rinse the bottle — no need to scrub, just a quick rinse.',
      'Remove the cap and recycle it separately (caps are usually PP #5).',
      'Crush the bottle to save space in your recycling bin.',
      'Place loose in your curbside recycling bin — never bag recyclables.',
    ],
    commonMistakes: [
      'Leaving liquid inside — contaminates other recyclables.',
      'Putting bottles in plastic bags — bags jam sorting machines.',
      'Recycling bottles with food residue (like peanut butter jars) without rinsing.',
    ],
    localVariations: [
      'Some areas accept caps on, others require them off — check locally.',
      'Bottle deposit states (like CA, NY, MI) offer 5-10¢ refunds.',
    ],
  },
  {
    id: 'aluminum-cans',
    name: 'Aluminum Cans',
    category: 'Metals',
    canRecycle: true,
    shortDescription: 'Soda cans, beer cans, and most beverage cans.',
    detailedDescription:
      'Aluminum is infinitely recyclable. Recycling one can saves enough energy to power a TV for 3 hours. It takes only 60 days for a recycled can to return to store shelves.',
    reason: 'Aluminum is one of the most valuable recyclables — saving 95% of the energy needed to make new aluminum.',
    steps: [
      'Empty the can completely.',
      'Give it a quick rinse.',
      'You can crush cans to save space (though some facilities prefer uncrushed).',
      'Place in your recycling bin.',
    ],
    commonMistakes: [
      'Confusing aluminum foil trays with cans — foil is often too contaminated to recycle.',
      'Recycling aerosol cans with regular cans — check if your area accepts them.',
    ],
    localVariations: [
      'Nearly all US recycling programs accept aluminum cans.',
      'Bottle deposit states pay 5-10¢ per can.',
    ],
  },
  {
    id: 'cardboard',
    name: 'Cardboard & Corrugated Boxes',
    category: 'Paper & Cardboard',
    canRecycle: true,
    shortDescription: 'Shipping boxes, cereal boxes, shoe boxes, and packaging.',
    detailedDescription:
      'Corrugated cardboard (the thick wavy kind in shipping boxes) and paperboard (cereal boxes, shoe boxes) are both recyclable. Cardboard fibers can be recycled 5-7 times before becoming too short.',
    reason: 'Cardboard is highly recyclable and recycling it saves 24% of the energy needed to make new cardboard.',
    steps: [
      'Remove all tape, labels, and packing materials (bubble wrap, styrofoam).',
      'Break down boxes flat to save space.',
      'Keep cardboard dry — wet cardboard cannot be recycled.',
      'Place flat in or beside your recycling bin.',
    ],
    commonMistakes: [
      'Recycling pizza boxes with heavy grease stains — the greasy parts go in compost, clean parts can be recycled.',
      'Leaving packing materials inside boxes.',
      'Recycling wax-coated cardboard (like frozen food boxes) — these are usually trash.',
    ],
    localVariations: [
      'Some areas have separate cardboard collection days.',
      'Many grocery stores accept cardboard for recycling.',
    ],
  },
  {
    id: 'glass-bottles',
    name: 'Glass Bottles & Jars',
    category: 'Glass',
    canRecycle: true,
    shortDescription: 'Food jars, wine bottles, beer bottles, and sauce jars.',
    detailedDescription:
      'Glass is 100% recyclable and can be recycled endlessly without losing quality. Recycled glass (cullet) melts at a lower temperature, saving energy in manufacturing.',
    reason: 'Glass is infinitely recyclable and reduces mining of raw materials (sand, soda ash).',
    steps: [
      'Empty and rinse the container.',
      'Remove metal lids (recycle those with metals).',
      'No need to remove paper labels — they burn off during recycling.',
      'Place in your recycling bin or glass-specific drop-off.',
    ],
    commonMistakes: [
      'Including ceramics, pyrex, or mirrors — these melt at different temperatures and ruin batches.',
      'Including light bulbs — they have different glass composition.',
      'Breaking glass before recycling — whole containers are easier to process.',
    ],
    localVariations: [
      'Some cities no longer accept glass curbside (too heavy, breaks easily).',
      'Many areas have glass-specific drop-off points.',
      'Colors matter in some programs — clear, green, and brown are sorted separately.',
    ],
  },
  {
    id: 'newspaper',
    name: 'Newspapers & Magazines',
    category: 'Paper & Cardboard',
    canRecycle: true,
    shortDescription: 'Newspapers, magazines, catalogs, and junk mail.',
    detailedDescription:
      'Paper products are among the most recyclable materials. Recycling one ton of paper saves 17 trees, 7,000 gallons of water, and 3 cubic yards of landfill space.',
    reason: 'Paper recycling is well-established and saves significant resources compared to virgin paper production.',
    steps: [
      'Keep paper clean and dry.',
      'Remove plastic wrapping from magazines.',
      'Stack neatly or place loose in recycling bin.',
      'Shredded paper should be placed in a paper bag — loose shreds jam machines.',
    ],
    commonMistakes: [
      'Recycling paper towels or tissues — these go in compost.',
      'Recycling wax-coated paper.',
      'Putting wet or food-stained paper in recycling.',
    ],
  },
  {
    id: 'plastic-bags',
    name: 'Plastic Bags & Film',
    category: 'Plastics',
    canRecycle: false,
    shortDescription: 'Grocery bags, zip-lock bags, shrink wrap, and bubble wrap.',
    detailedDescription:
      'Plastic bags and film CANNOT go in curbside recycling bins. They wrap around sorting equipment and cause costly shutdowns. However, many grocery stores collect them for separate recycling.',
    reason: 'Plastic bags tangle in sorting machinery at recycling facilities, causing shutdowns and contamination.',
    steps: [
      'Collect clean, dry plastic bags and film at home.',
      'Take them to a grocery store drop-off bin (most major chains have them).',
      'Better yet: switch to reusable bags to eliminate the need entirely.',
    ],
    commonMistakes: [
      'Putting plastic bags in curbside recycling — this is the #1 contaminant.',
      'Using plastic bags to hold recyclables — always put items loose in the bin.',
      'Including chip bags or candy wrappers — these are multi-layer and not recyclable.',
    ],
    localVariations: [
      'Some areas ban plastic bags entirely.',
      'Store drop-off programs accept bags, film, and bubble wrap.',
    ],
  },
  {
    id: 'styrofoam',
    name: 'Styrofoam (Expanded Polystyrene)',
    category: 'Plastics',
    canRecycle: false,
    shortDescription: 'Takeout containers, packing peanuts, and foam packaging.',
    detailedDescription:
      'Styrofoam (EPS #6) is technically recyclable but almost never accepted in curbside programs. It is 95% air, making it expensive to transport for recycling. It also breaks into tiny pieces that contaminate other recyclables.',
    reason: 'Too bulky and lightweight to be economically recycled in most programs. Breaks into microplastics.',
    commonMistakes: [
      'Putting styrofoam in curbside recycling — it contaminates the entire batch.',
      'Assuming all foam is the same — some specialty foam is recyclable at drop-offs.',
    ],
    localVariations: [
      'Some cities have dedicated EPS drop-off locations.',
      'Many cities are banning styrofoam food containers.',
    ],
  },
  {
    id: 'electronics',
    name: 'Electronics (E-Waste)',
    category: 'Electronics',
    canRecycle: false,
    shortDescription: 'Phones, laptops, tablets, cables, and small appliances.',
    detailedDescription:
      'Electronics contain valuable metals (gold, silver, copper) but also hazardous materials (lead, mercury). They require specialized recycling and should NEVER go in regular trash or recycling bins.',
    reason: 'Contains both valuable recoverable materials and hazardous substances requiring specialized processing.',
    steps: [
      'Wipe personal data from devices before recycling.',
      'Check if the manufacturer offers a take-back program (Apple, Dell, Samsung do).',
      'Find a certified e-waste recycler (look for R2 or e-Stewards certification).',
      'Many Best Buy, Staples, and other retailers accept e-waste for free.',
    ],
    commonMistakes: [
      'Throwing electronics in the trash — hazardous materials leach into soil.',
      'Putting electronics in curbside recycling bins.',
      'Not wiping personal data before recycling.',
    ],
  },
  {
    id: 'food-waste',
    name: 'Food Scraps',
    category: 'Organic',
    canRecycle: false,
    shortDescription: 'Fruit peels, vegetable scraps, coffee grounds, eggshells.',
    detailedDescription:
      'Food waste in landfills produces methane (29x more potent than CO₂). Composting food scraps returns nutrients to soil and avoids methane emissions. Many cities now offer curbside composting.',
    reason: 'Not recyclable, but highly compostable. Composting diverts waste from landfill and reduces methane.',
    steps: [
      'Collect food scraps in a countertop compost bin or bag.',
      'If your city offers curbside composting, place in the green/organics bin.',
      'If not, start a backyard compost pile or use a community garden compost.',
      'Freeze scraps if you can\'t compost immediately to prevent odors.',
    ],
    commonMistakes: [
      'Composting meat, dairy, or oils in home compost — these attract pests (ok for municipal composting).',
      'Putting compostable plastics in home compost — they need industrial heat to break down.',
    ],
    localVariations: [
      'Cities like San Francisco, Seattle, and Portland have mandatory composting.',
      'Many areas offer subsidized compost bins for residents.',
    ],
  },
];

/**
 * Get step-by-step recycling instructions for an item
 */
export function getRecycleSteps(item: RecycleItem): string[] {
  if (item.steps && item.steps.length > 0) {
    return item.steps;
  }

  // Default steps
  if (item.canRecycle) {
    return [
      'Clean the item — remove food residue.',
      'Check for recycling symbols and numbers.',
      'Place in your curbside recycling bin.',
      'When in doubt, check your local recycling program website.',
    ];
  }

  return [
    'This item cannot go in curbside recycling.',
    'Check for specialty drop-off locations in your area.',
    'Consider reducing use of this material when possible.',
  ];
}
