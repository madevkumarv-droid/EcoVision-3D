export type TechnologyType =
  | 'solar'
  | 'wind'
  | 'hydro'
  | 'geothermal'
  | 'storage'
  | 'tidal'
  | 'advanced';

export interface RenewableProject {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  technology: TechnologyType;
  techLabel: string;
  capacityMw: number;
  annualCo2OffsetTons: number;
  homesPoweredEquivalent: number;
  commissionYear: number;
  description: string;
  keyInnovation: string;
  status: 'Operational' | 'Under Expansion' | 'Research / Pilot';
}

export interface EnvironmentalIndicator {
  id: string;
  name: string;
  currentValue: number;
  unit: string;
  preIndustrial?: number;
  historicalAverage?: number;
  yoyChange: string;
  source: string;
  status: 'critical' | 'alert' | 'declining' | 'improving';
}

export interface FootprintInputs {
  electricityKwh: number;
  cleanEnergyPercent: number;
  electricitySource: 'fossil_heavy' | 'national_average' | 'clean_mix' | '100_green';
  vehicleMileage: number; // km per week
  vehicleType: 'gasoline' | 'diesel' | 'hybrid' | 'ev' | 'none';
  transitHours: number; // hours per week on bus/train
  shortFlights: number; // flights per year (<3 hrs)
  longFlights: number; // flights per year (>3 hrs)
  heatingSource: 'natural_gas' | 'fuel_oil' | 'heat_pump' | 'electric_resistance' | 'biomass';
  dietType: 'meat_heavy' | 'omnivore' | 'pescatarian' | 'vegetarian' | 'vegan';
  wasteHabits: 'average' | 'recycler' | 'zero_waste';
}

export interface FootprintResults {
  electricityEmissions: number; // metric tons CO2e / yr
  transportEmissions: number;
  heatingEmissions: number;
  dietEmissions: number;
  wasteEmissions: number;
  totalEmissions: number;
  globalComparisonPercent: number; // vs 4.7t global avg
  parisTargetGap: number; // vs 2.0t target
  treesNeededToOffset: number;
  kmDrivenEquivalent: number;
}

export interface SimulatorInputs {
  monthlyConsumptionKwh: number;
  solarKw: number;
  solarSunHours: number;
  batteryKwh: number;
  windContributionPercent: number;
  gridElectricityCostKwh: number; // $ / kWh
  insulationLevel: 'poor' | 'standard' | 'high_performance';
  heatPumpInstalled: boolean;
}

export interface SimulatorOutputs {
  monthlySolarGenKwh: number;
  monthlyWindGenKwh: number;
  monthlyTotalCleanGenKwh: number;
  monthlyGridImportKwh: number;
  monthlyGridExportKwh: number;
  selfSufficiencyPercent: number;
  annualCo2ReductionKg: number;
  monthlyDollarSavings: number;
  sustainabilityScore: number;
  hourlyProfile: {
    hour: number;
    solarGeneration: number; // kW
    householdLoad: number; // kW
    netGridFlow: number; // kW (+ import, - export)
  }[];
}
