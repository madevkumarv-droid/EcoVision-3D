export interface TemperatureRecord {
  year: number;
  anomaly: number; // °C relative to 1951-1980 base period
  co2Ppm: number;
}

export interface SectorEmission {
  sector: string;
  percentage: number;
  subsectors: string;
  color: string;
  annualGtCo2e: number;
}

export interface RenewableGrowthRecord {
  year: number;
  solarTWh: number;
  windTWh: number;
  hydroTWh: number;
  otherRenewablesTWh: number;
  totalRenewablesTWh: number;
}

// NASA GISS Global Land-Ocean Temperature Anomaly + Mauna Loa CO2 benchmark records
export const HISTORICAL_TEMPERATURE_SERIES: TemperatureRecord[] = [
  { year: 1880, anomaly: -0.16, co2Ppm: 290.8 },
  { year: 1900, anomaly: -0.08, co2Ppm: 295.7 },
  { year: 1920, anomaly: -0.21, co2Ppm: 303.4 },
  { year: 1940, anomaly: 0.12, co2Ppm: 310.7 },
  { year: 1960, anomaly: -0.03, co2Ppm: 316.9 },
  { year: 1970, anomaly: 0.04, co2Ppm: 325.7 },
  { year: 1980, anomaly: 0.26, co2Ppm: 338.8 },
  { year: 1990, anomaly: 0.45, co2Ppm: 354.4 },
  { year: 2000, anomaly: 0.61, co2Ppm: 369.5 },
  { year: 2005, anomaly: 0.68, co2Ppm: 379.8 },
  { year: 2010, anomaly: 0.72, co2Ppm: 389.9 },
  { year: 2015, anomaly: 0.90, co2Ppm: 400.8 },
  { year: 2020, anomaly: 1.02, co2Ppm: 414.2 },
  { year: 2022, anomaly: 1.09, co2Ppm: 418.5 },
  { year: 2024, anomaly: 1.25, co2Ppm: 424.0 },
  { year: 2026, anomaly: 1.28, co2Ppm: 426.8 },
];

// Global Greenhouse Gas Emissions by Sector (IPCC AR6 Working Group III / Climate Watch)
export const GLOBAL_SECTOR_EMISSIONS: SectorEmission[] = [
  {
    sector: 'Electricity & Heat',
    percentage: 31.9,
    subsectors: 'Coal plants, natural gas generation, district heating',
    color: '#ef4444',
    annualGtCo2e: 15.8,
  },
  {
    sector: 'Industry & Manufacturing',
    percentage: 24.2,
    subsectors: 'Steel, cement, chemical production, refining',
    color: '#f97316',
    annualGtCo2e: 12.0,
  },
  {
    sector: 'Agriculture & Forestry',
    percentage: 18.4,
    subsectors: 'Livestock enteric fermentation, deforestation, fertilizer use',
    color: '#eab308',
    annualGtCo2e: 9.1,
  },
  {
    sector: 'Transportation',
    percentage: 16.2,
    subsectors: 'Road vehicles (72%), aviation (11%), shipping (11%), rail (2%)',
    color: '#06b6d4',
    annualGtCo2e: 8.0,
  },
  {
    sector: 'Buildings (Direct)',
    percentage: 5.6,
    subsectors: 'Commercial & residential onsite gas/oil space and water heating',
    color: '#10b981',
    annualGtCo2e: 2.8,
  },
  {
    sector: 'Waste & Wastewater',
    percentage: 3.7,
    subsectors: 'Landfill methane emissions, wastewater treatment biogas',
    color: '#8b5cf6',
    annualGtCo2e: 1.8,
  },
];

// Global Renewable Electricity Generation (IEA Global Electricity Review, Terawatt-hours)
export const RENEWABLE_GENERATION_SERIES: RenewableGrowthRecord[] = [
  { year: 2012, solarTWh: 98, windTWh: 521, hydroTWh: 3670, otherRenewablesTWh: 430, totalRenewablesTWh: 4719 },
  { year: 2015, solarTWh: 256, windTWh: 831, hydroTWh: 3885, otherRenewablesTWh: 530, totalRenewablesTWh: 5502 },
  { year: 2018, solarTWh: 576, windTWh: 1269, hydroTWh: 4180, otherRenewablesTWh: 630, totalRenewablesTWh: 6655 },
  { year: 2020, solarTWh: 825, windTWh: 1591, hydroTWh: 4340, otherRenewablesTWh: 700, totalRenewablesTWh: 7456 },
  { year: 2022, solarTWh: 1284, windTWh: 2098, hydroTWh: 4330, otherRenewablesTWh: 770, totalRenewablesTWh: 8482 },
  { year: 2024, solarTWh: 1890, windTWh: 2520, hydroTWh: 4390, otherRenewablesTWh: 840, totalRenewablesTWh: 9640 },
  { year: 2026, solarTWh: 2450, windTWh: 2980, hydroTWh: 4450, otherRenewablesTWh: 910, totalRenewablesTWh: 10790 },
];

// Documented standard Emission Factors (IPCC / EPA eGRID / DEFRA)
export const EMISSION_FACTORS = {
  // kg CO2e per kWh
  gridElectricity: {
    fossil_heavy: 0.68, // Coal heavy grid
    national_average: 0.39, // US/EU blended national average
    clean_mix: 0.18, // High hydro/nuclear/renewable mix
    '100_green': 0.02, // Certified renewable tariff (lifecycle emissions only)
  },
  // kg CO2e per km driven
  vehiclePerKm: {
    gasoline: 0.192,
    diesel: 0.171,
    hybrid: 0.108,
    ev: 0.045, // lifecycle + grid charging
    none: 0.0,
  },
  // kg CO2e per hour of public transit
  transitPerHour: 0.85,
  // kg CO2e per passenger flight
  flightShortHaul: 250, // per trip (<3 hours, includes radiative forcing factor)
  flightLongHaul: 1100, // per trip (>3 hours, roundtrip or transcontinental)
  // kg CO2e per month for space heating
  heatingMonthly: {
    natural_gas: 185,
    fuel_oil: 275,
    heat_pump: 48,
    electric_resistance: 160,
    biomass: 32,
  },
  // kg CO2e per person per year based on dietary pattern (Poore & Nemecek, Science)
  dietAnnualTons: {
    meat_heavy: 3.3,
    omnivore: 2.5,
    pescatarian: 1.9,
    vegetarian: 1.7,
    vegan: 1.4,
  },
  // kg CO2e per person per year for waste
  wasteAnnualTons: {
    average: 0.45,
    recycler: 0.22,
    zero_waste: 0.08,
  },
};
