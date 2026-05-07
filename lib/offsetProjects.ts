/**
 * Static list of Gold Standard & Verra verified offset projects
 * In production, these would be fetched from an external API or CMS
 */

export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  category: 'renewable_energy' | 'reforestation' | 'methane' | 'water' | 'soil';
  location: string;
  verificationStandard: 'Gold Standard' | 'Verra' | 'Plan Vivo';
  donationUrl: string;
  organizationName: string;
  co2ReductionPotential: number; // kg per $1 donated (approximate)
  isFeatured: boolean;
}

export const OFFSET_PROJECTS: OffsetProject[] = [
  {
    id: '1',
    name: 'Wind Farm Solar Hybrid - India',
    description: 'Supporting renewable energy transition in rural India',
    longDescription:
      'This Gold Standard-certified project combines wind and solar energy in rural Rajasthan, displacing coal-powered grid electricity. For every dollar donated, approximately 0.8 kg of CO₂e is offset through avoided fossil fuel emissions.',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=500&h=300&fit=crop',
    category: 'renewable_energy',
    location: 'Rajasthan, India',
    verificationStandard: 'Gold Standard',
    donationUrl: 'https://www.goldstandard.org/donate',
    organizationName: 'ClimateWorks Foundation',
    co2ReductionPotential: 0.8,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Mangrove Restoration - Kenya',
    description: 'Restore coastal mangroves and protect marine ecosystems',
    longDescription:
      'Verra-verified project restoring 5,000 hectares of mangrove forests in coastal Kenya. Mangroves are among the most carbon-dense ecosystems on Earth, capturing ~100x more carbon per hectare than terrestrial forests. Project also protects biodiversity and provides livelihoods.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
    category: 'reforestation',
    location: 'Coastal Kenya',
    verificationStandard: 'Verra',
    donationUrl: 'https://www.verra.org/donate',
    organizationName: 'Blue Carbon Initiative',
    co2ReductionPotential: 1.2,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Landfill Methane Recovery - Brazil',
    description: 'Capture methane from waste decomposition',
    longDescription:
      'Gold Standard project capturing methane emissions (29x more potent than CO₂) from the world\'s largest waste disposal sites around São Paulo. Energy generated powers 50,000+ homes annually.',
    imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop',
    category: 'methane',
    location: 'São Paulo, Brazil',
    verificationStandard: 'Gold Standard',
    donationUrl: 'https://www.goldstandard.org/donate',
    organizationName: 'Waste Transformers',
    co2ReductionPotential: 0.95,
    isFeatured: true,
  },
  {
    id: '4',
    name: 'Rainforest Protection - Peru',
    description: 'Prevent deforestation of Amazon rainforest',
    longDescription:
      'Plan Vivo-verified REDD+ project protecting 200,000 hectares of pristine Amazon rainforest in Peru. Provides sustainable income to indigenous communities, preventing need to clear forest for agriculture.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
    category: 'reforestation',
    location: 'Ucayali Region, Peru',
    verificationStandard: 'Plan Vivo',
    donationUrl: 'https://www.planvivo.org/donate',
    organizationName: 'Amazon Guardians',
    co2ReductionPotential: 1.5,
    isFeatured: false,
  },
  {
    id: '5',
    name: 'Industrial Refrigerant Recovery - Mexico',
    description: 'Capture HFC-23 from refrigerant production',
    longDescription:
      'Verra-verified project capturing HFC-23, a potent greenhouse gas (14,800x more warming potential than CO₂) from refrigerant manufacturing facilities. High-impact from a small amount of material.',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=300&fit=crop',
    category: 'methane',
    location: 'Guadalajara, Mexico',
    verificationStandard: 'Verra',
    donationUrl: 'https://www.verra.org/donate',
    organizationName: 'Cool Climate Initiative',
    co2ReductionPotential: 2.1,
    isFeatured: false,
  },
  {
    id: '6',
    name: 'Regenerative Agriculture - Uganda',
    description: 'Teach sustainable farming practices to restore soil',
    longDescription:
      'Gold Standard project teaching 10,000 smallholder farmers in Uganda soil carbon sequestration techniques. Improves yields by 30%+ while permanently storing carbon in soil. Also provides training and seeds.',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop',
    category: 'soil',
    location: 'Central Uganda',
    verificationStandard: 'Gold Standard',
    donationUrl: 'https://www.goldstandard.org/donate',
    organizationName: 'Soil Revival Fund',
    co2ReductionPotential: 0.6,
    isFeatured: false,
  },
];

/**
 * Group projects by category for UI display
 */
export function groupProjectsByCategory(
  projects: OffsetProject[]
): Record<string, OffsetProject[]> {
  return projects.reduce(
    (acc, project) => {
      const key = project.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(project);
      return acc;
    },
    {} as Record<string, OffsetProject[]>
  );
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate estimated offset from donation amount
 */
export function calculateEstimatedOffset(
  project: OffsetProject,
  amountDonated: number
): number {
  return Math.round(project.co2ReductionPotential * amountDonated * 100) / 100;
}
